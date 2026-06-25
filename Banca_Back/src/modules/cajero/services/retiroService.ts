import pool from '../../../config/database';
import { BuscarCuentaResponse, ProcesarRetiroRequest, ProcesarRetiroResponse } from '../../../shared/interfaces';
import saldoCajeroService from './saldoCajeroService';

export class RetiroService {
  async buscarCuenta(numeroCuenta: string): Promise<BuscarCuentaResponse> {
    const connection = await pool.getConnection();

    try {
      const [cuentas]: any = await connection.query(
      `
      SELECT
        ca.id_cuenta,
        ca.numero_cuenta,
        ca.saldo,
        ca.estado_cuenta,
        ca.id_cliente,
        ca.id_empresa,

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
      `,[numeroCuenta]);

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

      const esJuridica = !!cuenta.id_empresa;

      return {
        existe: true,
        mensaje: 'Cuenta encontrada',
        datos: {
          numeroCuenta: cuenta.numero_cuenta,

          numeroDocumento:
            esJuridica
              ? cuenta.nit
              : cuenta.numero_documento,

          titular:
            esJuridica
              ? cuenta.razon_social
              : cuenta.nombre_completo,

          saldo: parseFloat(cuenta.saldo),

          estadoCuenta: cuenta.estado_cuenta,

          idCuenta: cuenta.id_cuenta,

          idCliente: cuenta.id_cliente,

          tipoCuenta:
            esJuridica
              ? 'Juridica'
              : 'Natural'
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

      // Buscar cuenta (Natural o Jurídica)
      const [cuentas]: any = await connection.query(`
        SELECT
          ca.id_cuenta,
          ca.saldo,
          ca.estado_cuenta,
          ca.id_cliente,
          ca.id_empresa,

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

        WHERE ca.id_cuenta = ?
        AND ca.estado_cuenta = 'Activa'

        FOR UPDATE
      `, [datos.idCuenta]);

      if (cuentas.length === 0) {
        await connection.rollback();

        return {
          exito: false,
          mensaje: 'La cuenta no existe o no está activa.'
        };
      }

      const cuenta = cuentas[0];

      const esJuridica = !!cuenta.id_empresa;

      const documentoTitular =
        esJuridica
          ? cuenta.nit
          : cuenta.numero_documento;

      const nombreTitular =
        esJuridica
          ? cuenta.razon_social
          : cuenta.nombre_completo;

      const saldoActual = parseFloat(cuenta.saldo);

      // Validar documento / NIT
      if (documentoTitular !== datos.numeroDocumento) {
        await connection.rollback();

        return {
          exito: false,
          mensaje:
            'El documento/NIT no coincide con el titular de la cuenta.'
        };
      }

      // Validar monto
      if (datos.montoRetirar <= 0) {
        await connection.rollback();

        return {
          exito: false,
          mensaje:
            'El monto a retirar debe ser mayor a cero.'
        };
      }

      if (saldoActual < datos.montoRetirar) {
        await connection.rollback();

        return {
          exito: false,
          mensaje:
            `Saldo insuficiente. Saldo disponible: $${saldoActual.toLocaleString('es-CO')}`
        };
      }

      const nuevoSaldo = saldoActual - datos.montoRetirar;

      // Actualizar cuenta
      await connection.query(
        `
        UPDATE cuentas_ahorro
        SET saldo = ?
        WHERE id_cuenta = ?
        `,
        [nuevoSaldo, datos.idCuenta]
      );

      // Registrar transacción
      const [resultado]: any =
        await connection.query(`
          INSERT INTO transacciones
          (
            id_cuenta,
            tipo_transaccion,
            monto,
            saldo_anterior,
            saldo_nuevo,
            id_usuario,
            id_caja,
            cajero,
            fecha_transaccion
          )
          VALUES
          (?, 'Retiro', ?, ?, ?, ?, ?, ?, NOW())
        `, [
          datos.idCuenta,
          datos.montoRetirar,
          saldoActual,
          nuevoSaldo,
          datos.idUsuario || null,
          datos.idCaja || null,
          datos.nombreCaja || `Usuario ${datos.idUsuario}`
        ]);

      await saldoCajeroService.actualizarSaldoEfectivo(
        datos.montoRetirar,
        'restar',
        datos.idUsuario || 0
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
          nombreTitular,
          numeroDocumento: documentoTitular,
          tipoCuenta:
            esJuridica
              ? 'Juridica'
              : 'Natural'
        }
      };

    } catch (error) {

      await connection.rollback();

      console.error(error);

      throw new Error(
        'Error al procesar el retiro'
      );

    } finally {

      connection.release();

    }
  }
}

export default new RetiroService();
