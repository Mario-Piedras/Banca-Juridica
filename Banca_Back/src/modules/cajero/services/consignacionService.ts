import pool from '../../../config/database';
import { ProcesarConsignacionRequest, ProcesarConsignacionResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class ConsignacionService {

  async procesarConsignacion(datos: ProcesarConsignacionRequest): Promise<ProcesarConsignacionResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar cuenta y validar que exista y esté activa
      const [cuentas]: any = await connection.query(`
        SELECT 
          ca.id_cuenta,
          ca.numero_cuenta,
          ca.saldo,
          ca.id_cliente,
          c.numero_documento,
          CONCAT(c.primer_nombre, ' ', 
                 IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                 c.primer_apellido, ' ', 
                 IFNULL(c.segundo_apellido, '')) AS nombre_completo
        FROM cuentas_ahorro ca
        INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE ca.numero_cuenta = ? AND ca.estado_cuenta = 'Activa'
        FOR UPDATE
      `, [datos.numeroCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'La cuenta no existe o no está activa.'
        };
      }

      const cuenta = cuentas[0];
      const saldoAnterior = parseFloat(cuenta.saldo);

      // 2. Validar que el valor sea mayor a 0
      if (datos.valor <= 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El valor a consignar debe ser mayor a cero.'
        };
      }

      // 3. Validar datos de cheque si aplica
      if (datos.tipoConsignacion === 'Cheque') {
        if (!datos.codigoCheque || !datos.numeroCheque) {
          await connection.rollback();
          return {
            exito: false,
            mensaje: 'Debe ingresar el código y número de cheque.'
          };
        }
      }

      const nuevoSaldo = saldoAnterior + datos.valor;

      // 4. Actualizar saldo de la cuenta
      await connection.query(
        'UPDATE cuentas_ahorro SET saldo = ? WHERE id_cuenta = ?',
        [nuevoSaldo, cuenta.id_cuenta]
      );

      // 5. ✅ MEJORADO: Registrar la transacción con id_usuario e id_caja
      const [resultado]: any = await connection.query(`
        INSERT INTO transacciones 
        (id_cuenta, tipo_transaccion, tipo_deposito, monto, codigo_cheque, numero_cheque, 
         saldo_anterior, saldo_nuevo, id_usuario, id_caja, fecha_transaccion) 
        VALUES (?, 'Depósito', ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        cuenta.id_cuenta,
        datos.tipoConsignacion,
        datos.valor,
        datos.codigoCheque || null,
        datos.numeroCheque || null,
        saldoAnterior,
        nuevoSaldo,
        datos.idUsuario || null,    // ← NUEVO: id_usuario del cajero
        datos.idCaja || null        // ← NUEVO: id_caja asignada
      ]);

      // 6. Actualizar saldo del cajero
      if (datos.tipoConsignacion === 'Efectivo') {
        await saldoCajeroService.actualizarSaldoEfectivo(datos.valor, 'sumar', datos.idUsuario || 0); // CAMBIAR: usar idUsuario en lugar de cajero
      } else if (datos.tipoConsignacion === 'Cheque') {
        await saldoCajeroService.actualizarSaldoCheques(datos.valor, 
          'sumar', 
          datos.idUsuario || 0 // CAMBIAR: usar idUsuario en lugar de cajero
        );
      }

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Consignación procesada exitosamente.',
        datos: {
          idTransaccion: resultado.insertId,
          numeroCuenta: cuenta.numero_cuenta,
          titular: cuenta.nombre_completo,
          numeroDocumento: cuenta.numero_documento,
          saldoAnterior: saldoAnterior,
          saldoNuevo: nuevoSaldo,
          valorConsignado: datos.valor,
          tipoConsignacion: datos.tipoConsignacion,
          codigoCheque: datos.codigoCheque,
          numeroCheque: datos.numeroCheque,
          fechaTransaccion: new Date()
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al procesar consignación:', error);
      throw new Error('Error al procesar la consignación');
    } finally {
      connection.release();
    }
  }
}

export default new ConsignacionService();

// import pool from '../../../config/database';
// import { ProcesarConsignacionRequest, ProcesarConsignacionResponse } from '../../../shared/interfaces';
// import saldoCajeroService from './saldoCajeroService';

// export class ConsignacionService {

//   async procesarConsignacion(datos: ProcesarConsignacionRequest): Promise<ProcesarConsignacionResponse> {
//     const connection = await pool.getConnection();

//     try {
//       await connection.beginTransaction();

//       // 1. Buscar cuenta y validar que exista y esté activa
//       // ✅ NOMBRE COMPLETO CONSTRUIDO CON CONCAT
//       const [cuentas]: any = await connection.query(`
//         SELECT 
//           ca.id_cuenta,
//           ca.numero_cuenta,
//           ca.saldo,
//           ca.id_cliente,
//           c.numero_documento,
//           CONCAT(c.primer_nombre, ' ', 
//                  IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
//                  c.primer_apellido, ' ', 
//                  IFNULL(c.segundo_apellido, '')) AS nombre_completo
//         FROM cuentas_ahorro ca
//         INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
//         WHERE ca.numero_cuenta = ? AND ca.estado_cuenta = 'Activa'
//         FOR UPDATE
//       `, [datos.numeroCuenta]);

//       if (cuentas.length === 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'La cuenta no existe o no está activa.'
//         };
//       }

//       const cuenta = cuentas[0];
//       const saldoAnterior = parseFloat(cuenta.saldo);

//       // 2. Validar que el valor sea mayor a 0
//       if (datos.valor <= 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'El valor a consignar debe ser mayor a cero.'
//         };
//       }

//       // 3. Validar datos de cheque si aplica
//       if (datos.tipoConsignacion === 'Cheque') {
//         if (!datos.codigoCheque || !datos.numeroCheque) {
//           await connection.rollback();
//           return {
//             exito: false,
//             mensaje: 'Debe ingresar el código y número de cheque.'
//           };
//         }
//       }

//       const nuevoSaldo = saldoAnterior + datos.valor;

//       // 4. Actualizar saldo de la cuenta
//       await connection.query(
//         'UPDATE cuentas_ahorro SET saldo = ? WHERE id_cuenta = ?',
//         [nuevoSaldo, cuenta.id_cuenta]
//       );

//       // 5. Registrar la transacción
//       const [resultado]: any = await connection.query(`
//         INSERT INTO transacciones 
//         (id_cuenta, tipo_transaccion, tipo_deposito, monto, codigo_cheque, numero_cheque, saldo_anterior, saldo_nuevo, fecha_transaccion) 
//         VALUES (?, 'Depósito', ?, ?, ?, ?, ?, ?, NOW())
//       `, [
//         cuenta.id_cuenta,
//         datos.tipoConsignacion,
//         datos.valor,
//         datos.codigoCheque || null,
//         datos.numeroCheque || null,
//         saldoAnterior,
//         nuevoSaldo
//       ]);

//       // 6. Actualizar saldo del cajero
//       if (datos.tipoConsignacion === 'Efectivo') {
//         await saldoCajeroService.actualizarSaldoEfectivo(datos.valor, 'sumar', datos.cajero || 'Cajero 01');
//       } else if (datos.tipoConsignacion === 'Cheque') {
//         await saldoCajeroService.actualizarSaldoCheques(datos.valor, 'sumar', datos.cajero || 'Cajero 01');
//       }

//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: 'Consignación procesada exitosamente.',
//         datos: {
//           idTransaccion: resultado.insertId,
//           numeroCuenta: cuenta.numero_cuenta,
//           titular: cuenta.nombre_completo,
//           numeroDocumento: cuenta.numero_documento,
//           saldoAnterior: saldoAnterior,
//           saldoNuevo: nuevoSaldo,
//           valorConsignado: datos.valor,
//           tipoConsignacion: datos.tipoConsignacion,
//           codigoCheque: datos.codigoCheque,
//           numeroCheque: datos.numeroCheque,
//           fechaTransaccion: new Date()
//         }
//       };

//     } catch (error) {
//       await connection.rollback();
//       console.error('Error al procesar consignación:', error);
//       throw new Error('Error al procesar la consignación');
//     } finally {
//       connection.release();
//     }
//   }
// }

// export default new ConsignacionService();
