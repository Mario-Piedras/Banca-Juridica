import pool from '../../../config/database';
import { BuscarCuentaResponse, ProcesarRetiroRequest, ProcesarRetiroResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class RetiroService {
  async buscarCuenta(numeroCuenta: string): Promise<BuscarCuentaResponse> {
    const connection = await pool.getConnection();

    try {
      const [cuentas]: any = await connection.query(`
        SELECT 
          ca.id_cuenta,
          ca.numero_cuenta,
          ca.saldo,
          ca.estado_cuenta,
          ca.id_cliente,
          c.numero_documento,
          CONCAT(c.primer_nombre, ' ', 
                 IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                 c.primer_apellido, ' ', 
                 IFNULL(c.segundo_apellido, '')) AS nombre_completo
        FROM cuentas_ahorro ca
        INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE ca.numero_cuenta = ?
      `, [numeroCuenta]);

      if (cuentas.length === 0) {
        return {
          existe: false,
          mensaje: 'El número de cuenta no existe en el sistema.'
        };
      }

      const cuenta = cuentas[0];

      if (cuenta.estado_cuenta !== 'Activa') {
        return {
          existe: false,
          mensaje: `La cuenta está ${cuenta.estado_cuenta}. No se pueden realizar retiros.`
        };
      }

      return {
        existe: true,
        mensaje: 'Cuenta encontrada',
        datos: {
          numeroCuenta: cuenta.numero_cuenta,
          numeroDocumento: cuenta.numero_documento,
          titular: cuenta.nombre_completo,
          saldo: parseFloat(cuenta.saldo),
          estadoCuenta: cuenta.estado_cuenta,
          idCuenta: cuenta.id_cuenta,
          idCliente: cuenta.id_cliente
        }
      };

    } catch (error) {
      console.error('Error al buscar cuenta:', error);
      throw new Error('Error al buscar la cuenta en la base de datos');
    } finally {
      connection.release();
    }
  }

  async procesarRetiro(datos: ProcesarRetiroRequest): Promise<ProcesarRetiroResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Obtener saldo actual y datos del cliente (CON FOR UPDATE)
      const [cuentas]: any = await connection.query(`
        SELECT ca.saldo, ca.id_cliente, c.numero_documento,
               CONCAT(c.primer_nombre, ' ', 
                      IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                      c.primer_apellido, ' ', 
                      IFNULL(c.segundo_apellido, '')) AS nombre_completo
        FROM cuentas_ahorro ca
        INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE ca.id_cuenta = ? AND ca.estado_cuenta = \'Activa\' FOR UPDATE
      `, [datos.idCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'La cuenta no existe o no está activa.'
        };
      }

      const saldoActual = parseFloat(cuentas[0].saldo);
      const idCliente = cuentas[0].id_cliente;
      const numeroDocumento = cuentas[0].numero_documento;
      const nombreTitular = cuentas[0].nombre_completo;

      // 2. Validar que el número de documento coincida
      if (numeroDocumento !== datos.numeroDocumento) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El número de documento no coincide con el titular de la cuenta.'
        };
      }

      // 3. Validaciones de saldo y monto
      if (saldoActual < datos.montoRetirar) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `Saldo insuficiente. Saldo disponible: $${saldoActual.toLocaleString()}`
        };
      }

      if (datos.montoRetirar <= 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El monto a retirar debe ser mayor a cero.'
        };
      }

      const nuevoSaldo = saldoActual - datos.montoRetirar;

      // 4. Actualizar saldo de la cuenta
      await connection.query(
        'UPDATE cuentas_ahorro SET saldo = ? WHERE id_cuenta = ?',
        [nuevoSaldo, datos.idCuenta]
      );

      // 5. Registrar transacción con auditoría completa
      const [resultado]: any = await connection.query(`
        INSERT INTO transacciones 
        (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, 
         id_usuario, id_caja, cajero, fecha_transaccion) 
        VALUES (?, 'Retiro', ?, ?, ?, ?, ?, ?, NOW())
      `, [
        datos.idCuenta, 
        datos.montoRetirar, 
        saldoActual, 
        nuevoSaldo,
        datos.idUsuario || null,
        datos.idCaja || null,
        datos.nombreCaja || `Usuario ${datos.idUsuario}`
      ]);

      // 6. Actualizar saldo efectivo del cajero
      await saldoCajeroService.actualizarSaldoEfectivo(
        datos.montoRetirar, 
        'restar', 
        datos.idUsuario || 0 // CAMBIAR: usar idUsuario en lugar de cajero
      );

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Retiro procesado exitosamente.',
        datos: {
          idTransaccion: resultado.insertId,
          saldoAnterior: saldoActual,
          saldoNuevo: nuevoSaldo,
          montoRetirado: datos.montoRetirar,
          fechaTransaccion: new Date(),
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al procesar retiro:', error);
      throw new Error('Error al procesar el retiro');
    } finally {
      connection.release();
    }
  }
}

export default new RetiroService();
// import pool from '../../../config/database';
// import { BuscarCuentaResponse, ProcesarRetiroRequest, ProcesarRetiroResponse } from '../../../shared/interfaces';
// import saldoCajeroService from './saldoCajeroService';

// export class RetiroService {

//   // Buscar cuenta por número y obtener datos del titular
//   async buscarCuenta(numeroCuenta: string): Promise<BuscarCuentaResponse> {
//     const connection = await pool.getConnection();

//     try {
//       // ✅ Query que une cuentas_ahorro con clientes - NOMBRE COMPLETO CONSTRUIDO CON CONCAT
//       const [cuentas]: any = await connection.query(`
//         SELECT 
//           ca.id_cuenta,
//           ca.numero_cuenta,
//           ca.saldo,
//           ca.estado_cuenta,
//           ca.id_cliente,
//           c.numero_documento,
//           CONCAT(c.primer_nombre, ' ', 
//                  IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
//                  c.primer_apellido, ' ', 
//                  IFNULL(c.segundo_apellido, '')) AS nombre_completo
//         FROM cuentas_ahorro ca
//         INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
//         WHERE ca.numero_cuenta = ?
//       `, [numeroCuenta]);

//       if (cuentas.length === 0) {
//         return {
//           existe: false,
//           mensaje: 'El número de cuenta no existe en el sistema.'
//         };
//       }

//       const cuenta = cuentas[0];

//       // Validar estado de la cuenta
//       if (cuenta.estado_cuenta !== 'Activa') {
//         return {
//           existe: false,
//           mensaje: `La cuenta está ${cuenta.estado_cuenta}. No se pueden realizar retiros.`
//         };
//       }

//       // Retornar datos de la cuenta
//       return {
//         existe: true,
//         mensaje: 'Cuenta encontrada',
//         datos: {
//           numeroCuenta: cuenta.numero_cuenta,
//           numeroDocumento: cuenta.numero_documento,
//           titular: cuenta.nombre_completo,
//           saldo: parseFloat(cuenta.saldo),
//           estadoCuenta: cuenta.estado_cuenta,
//           idCuenta: cuenta.id_cuenta,
//           idCliente: cuenta.id_cliente
//         }
//       };

//     } catch (error) {
//       console.error('Error al buscar cuenta:', error);
//       throw new Error('Error al buscar la cuenta en la base de datos');
//     } finally {
//       connection.release();
//     }
//   }

//   // Procesar el retiro de dinero
//   async procesarRetiro(datos: ProcesarRetiroRequest): Promise<ProcesarRetiroResponse> {
//     const connection = await pool.getConnection();

//     try {
//       // Iniciar transacción
//       await connection.beginTransaction();

//       // 1. Obtener saldo actual y validar
//       const [cuentas]: any = await connection.query(
//         'SELECT saldo, id_cliente FROM cuentas_ahorro WHERE id_cuenta = ? AND estado_cuenta = "Activa" FOR UPDATE',
//         [datos.idCuenta]
//       );

//       if (cuentas.length === 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'La cuenta no existe o no está activa.'
//         };
//       }

//       const saldoActual = parseFloat(cuentas[0].saldo);
//       const idCliente = cuentas[0].id_cliente;

//       // 2. Validar que el número de documento coincida
//       const [clientes]: any = await connection.query(
//         'SELECT numero_documento FROM clientes WHERE id_cliente = ?',
//         [idCliente]
//       );

//       if (clientes[0].numero_documento !== datos.numeroDocumento) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'El número de documento no coincide con el titular de la cuenta.'
//         };
//       }

//       // 3. Validar que haya saldo suficiente
//       if (saldoActual < datos.montoRetirar) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: `Saldo insuficiente. Saldo disponible: $${saldoActual.toLocaleString()}`
//         };
//       }

//       // 4. Validar que el monto sea mayor a 0
//       if (datos.montoRetirar <= 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'El monto a retirar debe ser mayor a cero.'
//         };
//       }

//       const nuevoSaldo = saldoActual - datos.montoRetirar;

//       // 5. Actualizar saldo de la cuenta
//       await connection.query(
//         'UPDATE cuentas_ahorro SET saldo = ? WHERE id_cuenta = ?',
//         [nuevoSaldo, datos.idCuenta]
//       );

//       // 6. Registrar la transacción
//       const [resultado]: any = await connection.query(`
//         INSERT INTO transacciones 
//         (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, fecha_transaccion) 
//         VALUES (?, 'Retiro', ?, ?, ?, NOW())
//       `, [datos.idCuenta, datos.montoRetirar, saldoActual, nuevoSaldo]);

//       // Actualizar saldo efectivo del cajero (retiro disminuye efectivo)
//       await saldoCajeroService.actualizarSaldoEfectivo(datos.montoRetirar, 'restar', datos.cajero || 'Cajero 01');

//       // Hacer commit de la transacción
//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: 'Retiro procesado exitosamente.',
//         datos: {
//           idTransaccion: resultado.insertId,
//           saldoAnterior: saldoActual,
//           saldoNuevo: nuevoSaldo,
//           montoRetirado: datos.montoRetirar,
//           fechaTransaccion: new Date()
//         }
//       };

//     } catch (error) {
//       // Hacer rollback en caso de error
//       await connection.rollback();
//       console.error('Error al procesar retiro:', error);
//       throw new Error('Error al procesar el retiro');
//     } finally {
//       connection.release();
//     }
//   }
// }

// export default new RetiroService();
