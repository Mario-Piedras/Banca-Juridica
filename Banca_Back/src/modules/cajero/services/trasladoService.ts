import pool from '../../../config/database';
import { 
  EnviarTrasladoRequest, 
  EnviarTrasladoResponse,
  ConsultarTrasladosResponse,
  AceptarTrasladoRequest,
  AceptarTrasladoResponse 
} from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class TrasladoService {
  
  async enviarTraslado(datos: EnviarTrasladoRequest): Promise<EnviarTrasladoResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validar que el monto sea mayor a 0
      if (datos.monto <= 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'El monto debe ser mayor a cero.'
        };
      }

      // 2. Validar que no se envíe a sí mismo
      if (datos.cajeroOrigen === datos.cajeroDestino) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'No puede enviar dinero a sí mismo.'
        };
      }

      // 3. Obtener saldo actual del cajero
      const [saldos]: any = await connection.query(
        'SELECT saldo_efectivo FROM saldos_cajero WHERE id_usuario = ? ORDER BY id_saldo DESC LIMIT 1',
        [datos.idUsuario]
      );

      if (saldos.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'No se encontró el saldo del cajero.'
        };
      }

      const saldoActual = parseFloat(saldos[0].saldo_efectivo);

      // 4. Validar que haya saldo suficiente
      if (saldoActual < datos.monto) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `Saldo insuficiente. Saldo disponible: $${saldoActual.toLocaleString()}`
        };
      }

      // 5. Registrar el traslado con auditoría mínima disponible (según esquema actual)
      const [resultado]: any = await connection.query(
        `INSERT INTO traslados_cajero 
         (cajero_origen, cajero_destino, monto, estado, fecha_envio, id_usuario_origen) 
         VALUES (?, ?, ?, 'Pendiente', NOW(), ?)`,
        [
          datos.cajeroOrigen, 
          datos.cajeroDestino, 
          datos.monto,
          datos.idUsuario || null
        ]
      );

      // 6. Disminuir saldo del cajero origen
      await saldoCajeroService.actualizarSaldoEfectivo(datos.monto, 'restar', datos.idUsuario || 0);

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Traslado enviado exitosamente.',
        datos: {
          idTraslado: resultado.insertId,
          cajeroOrigen: datos.cajeroOrigen,
          cajeroDestino: datos.cajeroDestino,
          monto: datos.monto,
          fechaEnvio: new Date()
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al enviar traslado:', error);
      throw new Error('Error al enviar el traslado');
    } finally {
      connection.release();
    }
  }

  async consultarTrasladosPendientes(cajeroDestino: string): Promise<ConsultarTrasladosResponse> {
    const connection = await pool.getConnection();

    try {
      const [traslados]: any = await connection.query(
        `SELECT id_traslado, cajero_origen, monto, fecha_envio, id_usuario_origen
         FROM traslados_cajero
         WHERE cajero_destino = ? AND estado = 'Pendiente'
         ORDER BY fecha_envio DESC`,
        [cajeroDestino]
      );

      return {
        exito: true,
        traslados: traslados.map((t: any) => ({
          idTraslado: t.id_traslado,
          cajeroOrigen: t.cajero_origen,
          monto: parseFloat(t.monto),
          fechaEnvio: t.fecha_envio
        }))
      };

    } catch (error) {
      console.error('Error al consultar traslados:', error);
      throw new Error('Error al consultar los traslados');
    } finally {
      connection.release();
    }
  }

  async aceptarTraslado(datos: AceptarTrasladoRequest): Promise<AceptarTrasladoResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar el traslado
      const [traslados]: any = await connection.query(
        `SELECT id_traslado, cajero_origen, cajero_destino, monto, estado, fecha_envio, id_usuario_origen
         FROM traslados_cajero
         WHERE id_traslado = ?`,
        [datos.idTraslado]
      );

      if (traslados.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'Traslado no encontrado.'
        };
      }

      const traslado = traslados[0];

      // 2. Validar que esté pendiente
      if (traslado.estado !== 'Pendiente') {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'Este traslado ya fue aceptado.'
        };
      }

      // 3. Validar que el cajero destino coincida
      if (traslado.cajero_destino !== datos.cajeroDestino) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: 'Este traslado no está dirigido a este cajero.'
        };
      }

      // 4. Actualizar estado del traslado con auditoría de usuario destino (según esquema actual)
      await connection.query(
        `UPDATE traslados_cajero 
         SET estado = 'Aceptado', fecha_aceptacion = NOW(), id_usuario_destino = ?
         WHERE id_traslado = ?`,
        [datos.idUsuario || null, datos.idTraslado]
      );

      // 5. Aumentar saldo del cajero destino
      await saldoCajeroService.actualizarSaldoEfectivo(
        parseFloat(traslado.monto), 
        'sumar', 
        datos.idUsuario || 0 // CAMBIAR: usar idUsuario en lugar de cajeroOrigen
      );

      await connection.commit();

      return {
        exito: true,
        mensaje: 'Traslado aceptado exitosamente.',
        datos: {
          idTraslado: traslado.id_traslado,
          cajeroOrigen: traslado.cajero_origen,
          cajeroDestino: traslado.cajero_destino,
          monto: parseFloat(traslado.monto),
          fechaEnvio: traslado.fecha_envio,
          fechaAceptacion: new Date()
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error al aceptar traslado:', error);
      throw new Error('Error al aceptar el traslado');
    } finally {
      connection.release();
    }
  }
}
// import pool from '../../../config/database';
// import { 
//   EnviarTrasladoRequest, 
//   EnviarTrasladoResponse,
//   ConsultarTrasladosResponse,
//   AceptarTrasladoRequest,
//   AceptarTrasladoResponse 
// } from '../../../shared/interfaces';
// import saldoCajeroService from './saldoCajeroService';

// export class TrasladoService {
  
//   // Enviar traslado (disminuye saldo del cajero origen)
//   async enviarTraslado(datos: EnviarTrasladoRequest): Promise<EnviarTrasladoResponse> {
//     const connection = await pool.getConnection();

//     try {
//       await connection.beginTransaction();

//       // 1. Validar que el monto sea mayor a 0
//       if (datos.monto <= 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'El monto debe ser mayor a cero.'
//         };
//       }

//       // 2. Validar que no se envíe a sí mismo
//       if (datos.cajeroOrigen === datos.cajeroDestino) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'No puede enviar dinero a sí mismo.'
//         };
//       }

//       // 3. Obtener saldo actual del cajero
//       const [saldos]: any = await connection.query(
//         'SELECT saldo_efectivo FROM saldos_cajero ORDER BY id_saldo DESC LIMIT 1'
//       );

//       if (saldos.length === 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'No se encontró el saldo del cajero.'
//         };
//       }

//       const saldoActual = parseFloat(saldos[0].saldo_efectivo);

//       // 4. Validar que haya saldo suficiente
//       if (saldoActual < datos.monto) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: `Saldo insuficiente. Saldo disponible: $${saldoActual.toLocaleString()}`
//         };
//       }

//       // 5. Registrar el traslado como pendiente
//       const [resultado]: any = await connection.query(
//         `INSERT INTO traslados_cajero (cajero_origen, cajero_destino, monto, estado, fecha_envio)
//          VALUES (?, ?, ?, 'Pendiente', NOW())`,
//         [datos.cajeroOrigen, datos.cajeroDestino, datos.monto]
//       );

//       // 6. Disminuir saldo del cajero origen
//      await saldoCajeroService.actualizarSaldoEfectivo(datos.monto, 'restar', datos.cajeroOrigen);

//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: 'Traslado enviado exitosamente.',
//         datos: {
//           idTraslado: resultado.insertId,
//           cajeroOrigen: datos.cajeroOrigen,
//           cajeroDestino: datos.cajeroDestino,
//           monto: datos.monto,
//           fechaEnvio: new Date()
//         }
//       };

//     } catch (error) {
//       await connection.rollback();
//       console.error('Error al enviar traslado:', error);
//       throw new Error('Error al enviar el traslado');
//     } finally {
//       connection.release();
//     }
//   }

//   // Consultar traslados pendientes para un cajero
//   async consultarTrasladosPendientes(cajeroDestino: string): Promise<ConsultarTrasladosResponse> {
//     const connection = await pool.getConnection();

//     try {
//       const [traslados]: any = await connection.query(
//         `SELECT id_traslado, cajero_origen, monto, fecha_envio
//          FROM traslados_cajero
//          WHERE cajero_destino = ? AND estado = 'Pendiente'
//          ORDER BY fecha_envio DESC`,
//         [cajeroDestino]
//       );

//       return {
//         exito: true,
//         traslados: traslados.map((t: any) => ({
//           idTraslado: t.id_traslado,
//           cajeroOrigen: t.cajero_origen,
//           monto: parseFloat(t.monto),
//           fechaEnvio: t.fecha_envio
//         }))
//       };

//     } catch (error) {
//       console.error('Error al consultar traslados:', error);
//       throw new Error('Error al consultar los traslados');
//     } finally {
//       connection.release();
//     }
//   }

//   // Aceptar traslado (aumenta saldo del cajero destino)
//   async aceptarTraslado(datos: AceptarTrasladoRequest): Promise<AceptarTrasladoResponse> {
//     const connection = await pool.getConnection();

//     try {
//       await connection.beginTransaction();

//       // 1. Buscar el traslado
//       const [traslados]: any = await connection.query(
//         `SELECT id_traslado, cajero_origen, cajero_destino, monto, estado, fecha_envio
//          FROM traslados_cajero
//          WHERE id_traslado = ?`,
//         [datos.idTraslado]
//       );

//       if (traslados.length === 0) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'Traslado no encontrado.'
//         };
//       }

//       const traslado = traslados[0];

//       // 2. Validar que esté pendiente
//       if (traslado.estado !== 'Pendiente') {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'Este traslado ya fue aceptado.'
//         };
//       }

//       // 3. Validar que el cajero destino coincida
//       if (traslado.cajero_destino !== datos.cajeroDestino) {
//         await connection.rollback();
//         return {
//           exito: false,
//           mensaje: 'Este traslado no está dirigido a este cajero.'
//         };
//       }

//       // 4. Actualizar estado del traslado
//       await connection.query(
//         `UPDATE traslados_cajero 
//          SET estado = 'Aceptado', fecha_aceptacion = NOW()
//          WHERE id_traslado = ?`,
//         [datos.idTraslado]
//       );

//       // 5. Aumentar saldo del cajero destino
//      await saldoCajeroService.actualizarSaldoEfectivo(parseFloat(traslado.monto), 'sumar', datos.cajeroDestino);

//       await connection.commit();

//       return {
//         exito: true,
//         mensaje: 'Traslado aceptado exitosamente.',
//         datos: {
//           idTraslado: traslado.id_traslado,
//           cajeroOrigen: traslado.cajero_origen,
//           cajeroDestino: traslado.cajero_destino,
//           monto: parseFloat(traslado.monto),
//           fechaEnvio: traslado.fecha_envio,
//           fechaAceptacion: new Date()
//         }
//       };

//     } catch (error) {
//       await connection.rollback();
//       console.error('Error al aceptar traslado:', error);
//       throw new Error('Error al aceptar el traslado');
//     } finally {
//       connection.release();
//     }
//   }
// }
