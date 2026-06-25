import pool from '../../../config/database';
import { CancelarCuentaRequest, CancelarCuentaResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class CancelacionService {
  async cancelarCuenta(datos: CancelarCuentaRequest): Promise<CancelarCuentaResponse> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar cuenta y validar que exista y esté activa
      const [cuentas]: any = await connection.query(
        `
        SELECT
          ca.id_cuenta,
          ca.numero_cuenta,
          ca.saldo,
          ca.estado_cuenta,
          ca.id_cliente,
          ca.id_empresa,
          ca.id_solicitud,

          c.numero_documento,

          CONCAT(
            c.primer_nombre,' ',
            IFNULL(CONCAT(c.segundo_nombre,' '),''),
            c.primer_apellido,' ',
            IFNULL(c.segundo_apellido,'')
          ) AS nombre_completo,

          ie.nit,
          ie.razon_social

        FROM cuentas_ahorro ca

        LEFT JOIN clientes c
        ON ca.id_cliente = c.id_cliente

        LEFT JOIN info_empresas ie
        ON ca.id_empresa = ie.id_info_empresas

        WHERE ca.numero_cuenta = ?

        FOR UPDATE
        `,
      [datos.numeroCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();
        return {
          exito: false,
          mensaje: '❌ La cuenta no existe.'
        };
      }

      const cuenta = cuentas[0];

      // 2. Verificar si la cuenta pertenece a un cliente natural o juridico
      const esJuridica = !!cuenta.id_empresa;

      const titular = esJuridica
        ? cuenta.razon_social
        : cuenta.nombre_completo;

      const numeroDocumento = esJuridica
        ? cuenta.nit
        : cuenta.numero_documento;

      const tipoCuenta = esJuridica
        ? 'Jurídica'
        : 'Natural';

      // 3. Validar que la cuenta esté activa
      if (cuenta.estado_cuenta !== 'Activa') {
        await connection.rollback();
        return {
          exito: false,
          mensaje: `❌ La cuenta ya está ${cuenta.estado_cuenta}.`
        };
      }

      // 4. Validar que el número de documento coincida
      const documentoTitular =
        cuenta.id_empresa
          ? cuenta.nit
          : cuenta.numero_documento;

      if (documentoTitular !== datos.numeroDocumento) {

        await connection.rollback();

        return {
          exito: false,
          mensaje:
            '❌ El documento/NIT no coincide con el titular de la cuenta.'
        };
      }

      // 5. Validar que el saldo sea 0
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

      // 6. Actualizar estado de la cuenta a "Cerrada"
      await connection.query(
        'UPDATE cuentas_ahorro SET estado_cuenta = ? WHERE id_cuenta = ?',
        ['Cerrada', cuenta.id_cuenta]
      );

      // 7. Marcar la solicitud como "Cancelada" para indicar que la cuenta se cerró
      await connection.query(
        'UPDATE solicitudes_apertura SET estado = ? WHERE id_solicitud = ?',
        ['Cancelada', cuenta.id_solicitud]
      );

      // 8. Registrar transacción de cierre con auditoría completa
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
          titular:
            cuenta.id_empresa
              ? cuenta.razon_social
              : cuenta.nombre_completo,

          numeroDocumento:
            cuenta.id_empresa
              ? cuenta.nit
              : cuenta.numero_documento,
          tipoCuenta,
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