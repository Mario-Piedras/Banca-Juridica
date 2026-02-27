import pool from '../../../config/database';
import { CancelarCuentaRequest, CancelarCuentaResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class CancelacionService {
  async cancelarCuenta(datos: CancelarCuentaRequest): Promise<CancelarCuentaResponse> {
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
          ca.estado_cuenta,
          c.numero_documento,
          CONCAT(c.primer_nombre, ' ', 
                 IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
                 c.primer_apellido, ' ', 
                 IFNULL(c.segundo_apellido, '')) AS nombre_completo
        FROM cuentas_ahorro ca
        INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE ca.numero_cuenta = ?
        FOR UPDATE
      `, [datos.numeroCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: '❌ La cuenta no existe.'
        };
      }

      const cuenta = cuentas[0];

      // 2. Validar que la cuenta esté activa
      if (cuenta.estado_cuenta !== 'Activa') {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `❌ La cuenta ya está ${cuenta.estado_cuenta}.`
        };
      }

      // 3. Validar que el número de documento coincida
      if (cuenta.numero_documento !== datos.numeroDocumento) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: '❌ El número de documento no coincide con el titular de la cuenta.'
        };
      }

      // 4. Validar que el saldo sea 0
      const saldoActual = parseFloat(cuenta.saldo);
      if (saldoActual !== 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `⚠️ No se puede cancelar la cuenta.\n\n` +
                   `Saldo actual: $${saldoActual.toLocaleString('es-CO')}\n\n` +
                   `Para cancelar la cuenta, el saldo debe ser $0.\n` +
                   `Realice retiros o transferencias hasta dejar el saldo en cero.`
        };
      }

      // ✅ Motivo OPCIONAL - ya no validamos

      // 5. Actualizar estado de la cuenta a "Cerrada"
      await connection.query(
        'UPDATE cuentas_ahorro SET estado_cuenta = ? WHERE id_cuenta = ?',
        ['Cerrada', cuenta.id_cuenta]
      );

      // 6. Marcar la solicitud como "Utilizada" o cambiarla a NULL
      await connection.query(
        'UPDATE cuentas_ahorro SET id_solicitud = NULL WHERE id_cuenta = ?',
        [cuenta.id_cuenta]
      );

      // 7. Registrar transacción de cierre con auditoría completa
      const motivoFinal = datos.motivoCancelacion?.trim() || 'Sin motivo especificado';
      
      await connection.query(
        `INSERT INTO transacciones 
         (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, 
          motivo_cancelacion, id_usuario, id_caja, cajero, fecha_transaccion) 
         VALUES (?, \'Cancelación\', 0, 0, 0, ?, ?, ?, ?, NOW())`,
        [
          cuenta.id_cuenta, 
          motivoFinal,
          datos.idUsuario || null,
          datos.idCaja || null,
          datos.nombreCaja || `Usuario ${datos.idUsuario}`
        ]
      );

      await connection.commit();

      return {
        exito: true,
        mensaje: '✅ Cuenta cancelada exitosamente.',
        datos: {
          idCuenta: cuenta.id_cuenta,
          numeroCuenta: cuenta.numero_cuenta,
          titular: cuenta.nombre_completo,
          numeroDocumento: cuenta.numero_documento,
          saldoFinal: 0,
          motivoCancelacion: motivoFinal,
          fechaCancelacion: new Date()
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al cancelar cuenta:', error);
      throw new Error('Error al cancelar la cuenta');
    } finally {
      connection.release();
    }
  }
}

export default new CancelacionService();
// import pool from '../../../config/database';  // ✅ Ruta corregida
// import { CancelarCuentaRequest, CancelarCuentaResponse } from '../../../shared/interfaces';
// import saldoCajeroService from './saldoCajeroService';

// export class CancelacionService {
//   async cancelarCuenta(datos: CancelarCuentaRequest): Promise<CancelarCuentaResponse> {
//     const connection = await pool.getConnection();

//     try {
//       await connection.beginTransaction();

//       // 1. Buscar cuenta y validar que exista y esté activa
//       const [cuentas]: any = await connection.query(`
//         SELECT 
//           ca.id_cuenta,
//           ca.numero_cuenta,
//           ca.saldo,
//           ca.id_cliente,
//           ca.estado_cuenta,
//           c.numero_documento,
//           CONCAT(c.primer_nombre, ' ', 
//                  IFNULL(CONCAT(c.segundo_nombre, ' '), ''), 
//                  c.primer_apellido, ' ', 
//                  IFNULL(c.segundo_apellido, '')) AS nombre_completo
//         FROM cuentas_ahorro ca
//         INNER JOIN clientes c ON ca.id_cliente = c.id_cliente
//         WHERE ca.numero_cuenta = ?
//         FOR UPDATE
//       `, [datos.numeroCuenta]);

//       if (cuentas.length === 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: '❌ La cuenta no existe.'
//         };
//       }

//       const cuenta = cuentas[0];

//       // 2. Validar que la cuenta esté activa
//       if (cuenta.estado_cuenta !== 'Activa') {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: `❌ La cuenta ya está ${cuenta.estado_cuenta}.`
//         };
//       }

//       // 3. Validar que el número de documento coincida
//       if (cuenta.numero_documento !== datos.numeroDocumento) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: '❌ El número de documento no coincide con el titular de la cuenta.'
//         };
//       }

//       // 4. Validar que el saldo sea 0
//       const saldoActual = parseFloat(cuenta.saldo);
//       if (saldoActual !== 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: `⚠️ No se puede cancelar la cuenta.\n\n` +
//                    `Saldo actual: $${saldoActual.toLocaleString('es-CO')}\n\n` +
//                    `Para cancelar la cuenta, el saldo debe ser $0.\n` +
//                    `Realice retiros o transferencias hasta dejar el saldo en cero.`
//         };
//       }

//       // ✅ Motivo OPCIONAL - ya no validamos

//       // 5. Actualizar estado de la cuenta a "Cerrada"
//       await connection.query(
//         'UPDATE cuentas_ahorro SET estado_cuenta = ? WHERE id_cuenta = ?',
//         ['Cerrada', cuenta.id_cuenta]
//       );

//       // 6. Marcar la solicitud como "Utilizada" o cambiarla a NULL
//       await connection.query(
//         'UPDATE cuentas_ahorro SET id_solicitud = NULL WHERE id_cuenta = ?',
//         [cuenta.id_cuenta]
//       );

//       // 7. Registrar transacción de cierre
//       const motivoFinal = datos.motivoCancelacion?.trim() || 'Sin motivo especificado';
      
//       await connection.query(
//         'INSERT INTO transacciones (id_cuenta, tipo_transaccion, monto, saldo_anterior, saldo_nuevo, fecha_transaccion, motivo_cancelacion) VALUES (?, "Cancelación", 0, 0, 0, NOW(), ?)',
//         [cuenta.id_cuenta, motivoFinal]
//       );

//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: '✅ Cuenta cancelada exitosamente.',
//         datos: {
//           idCuenta: cuenta.id_cuenta,
//           numeroCuenta: cuenta.numero_cuenta,
//           titular: cuenta.nombre_completo,
//           numeroDocumento: cuenta.numero_documento,
//           saldoFinal: 0,
//           motivoCancelacion: motivoFinal,
//           fechaCancelacion: new Date()
//         }
//       };

//     } catch (error) {
//       await connection.rollback();
//       console.error('Error al cancelar cuenta:', error);
//       throw new Error('Error al cancelar la cuenta');
//     } finally {
//       connection.release();
//     }
//   }
// }

// export default new CancelacionService();
