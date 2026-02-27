import pool from '../../../config/database';
import { AplicarNotaDebitoResponse, AplicarNotaDebitoRequest } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class NotaDebitoService {
  async aplicarNotaDebito(datos: AplicarNotaDebitoRequest): Promise<AplicarNotaDebitoResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Obtener saldo actual y validar (CON FOR UPDATE para transacción)
      const [cuentas]: any = await connection.query(
        `SELECT ca.saldo, ca.id_cliente, c.numero_documento,
                CONCAT(c.primer_nombre, ' ', 
                       IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                       c.primer_apellido, ' ', 
                       IFNULL(c.segundo_apellido, '')) AS nombre_completo
         FROM cuentas_ahorro ca
         INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
         WHERE ca.id_cuenta = ? AND ca.estado_cuenta = \'Activa\' FOR UPDATE`,
        [datos.idCuenta]
      );

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

      // 3. Validaciones de saldo y valor
      if (saldoActual < datos.valor) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `Saldo insuficiente para aplicar la nota débito. Saldo disponible: $${saldoActual.toLocaleString()}`
        };
      }

      if (datos.valor <= 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El valor debe ser mayor a cero.'
        };
      }

      const nuevoSaldo = saldoActual - datos.valor;

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
        VALUES (?, 'Nota Débito', ?, ?, ?, ?, ?, ?, NOW())
      `, [
        datos.idCuenta, 
        datos.valor, 
        saldoActual, 
        nuevoSaldo,
        datos.idUsuario || null,
        datos.idCaja || null,
        datos.nombreCaja || `Usuario ${datos.idUsuario}`
      ]);

      // 6. Actualizar saldo efectivo del cajero
      await saldoCajeroService.actualizarSaldoEfectivo(
        datos.valor, 
        'restar', 
        datos.idUsuario || 0 // CAMBIAR: usar idUsuario en lugar de cajero
      );

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Nota débito aplicada exitosamente.',
        datos: {
          idTransaccion: resultado.insertId,
          saldoAnterior: saldoActual,
          saldoNuevo: nuevoSaldo,
          valor: datos.valor,
          fechaTransaccion: new Date(),
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al aplicar nota débito:', error);
      throw new Error('Error al aplicar la nota débito');
    } finally {
      connection.release();
    }
  }
}
// import pool from '../../../config/database';
// import { AplicarNotaDebitoResponse, AplicarNotaDebitoRequest } from '../../../shared/interfaces';
// import saldoCajeroService from './saldoCajeroService';

// export class NotaDebitoService {

//   // Aplicar nota débito (cargo administrativo)
//   async aplicarNotaDebito(datos: AplicarNotaDebitoRequest): Promise<AplicarNotaDebitoResponse> {
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
//       if (saldoActual < datos.valor) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: `Saldo insuficiente para aplicar la nota débito. Saldo disponible: $${saldoActual.toLocaleString()}`
//         };
//       }

//       // 4. Validar que el valor sea mayor a 0
//       if (datos.valor <= 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'El valor debe ser mayor a cero.'
//         };
//       }

//       const nuevoSaldo = saldoActual - datos.valor;

//       // 5. Actualizar saldo de la cuenta
//       await connection.query(
//         'UPDATE cuentas_ahorro SET saldo = ? WHERE id_cuenta = ?',
//         [nuevoSaldo, datos.idCuenta]
//       );

//       // 6. Registrar la transacción como Retiro (nota débito)
//       // Nota: Usamos tipo_transaccion = 'Retiro' porque es un débito
//       // Puedes agregar un campo adicional para especificar que es nota débito
//       const [resultado]: any = await connection.query(`
//         INSERT INTO transacciones 
//         (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, fecha_transaccion)
//         VALUES (?, 'Nota Débito', ?, ?, ?, NOW())
//       `, [datos.idCuenta, datos.valor, saldoActual, nuevoSaldo,
//       ]);

//       // Actualizar saldo efectivo del cajero (nota débito disminuye efectivo)
//       await saldoCajeroService.actualizarSaldoEfectivo(datos.valor, 'restar', datos.cajero || 'Cajero 01');


//       // Hacer commit de la transacción
//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: 'Nota débito aplicada exitosamente.',
//         datos: {
//           idTransaccion: resultado.insertId,
//           saldoAnterior: saldoActual,
//           saldoNuevo: nuevoSaldo,
//           valor: datos.valor,
//           fechaTransaccion: new Date()
//         }
//       };

//     } catch (error) {
//       // Hacer rollback en caso de error
//       await connection.rollback();
//       console.error('Error al aplicar nota débito:', error);
//       throw new Error('Error al aplicar la nota débito');
//     } finally {
//       connection.release();
//     }
//   }
// }
