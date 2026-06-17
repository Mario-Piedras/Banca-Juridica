import pool from "../../../config/database";
import {
  VerificarClienteResponse,
  AperturarCuentaRequest,
  AperturarCuentaResponse,
} from "../../../shared/interfaces";
import saldoCajeroService from "./saldoCajeroService";

export class AperturaService {
  // Verificar estado de solicitud del cliente
  async verificarCliente(
    tipoDocumento: string,
    numeroDocumento: string
  ): Promise<VerificarClienteResponse> {
    const connection = await pool.getConnection();
    try {
      const [clientes]: any = await connection.query(
        `SELECT 
          id_cliente, 
          CONCAT(primer_nombre, ' ', 
                 IFNULL(CONCAT(segundo_nombre, ' '), ''),
                 primer_apellido, ' ', 
                 IFNULL(segundo_apellido, '')) AS nombre_completo
         FROM clientes 
         WHERE tipo_documento = ? AND numero_documento = ?`,
        [tipoDocumento, numeroDocumento]
      );

      if (clientes.length === 0) {
        return {
          existe: false,
          estado: "NoRegistrado",
          mensaje:
            "El cliente no está registrado en el sistema. Debe registrarse primero con el asesor.",
        };
      }

      const cliente = clientes[0];

      // Verificar si ya tiene cuenta activa
      const [cuentas]: any = await connection.query(
        'SELECT COUNT(*) as total FROM cuentas_ahorro WHERE id_cliente = ? AND estado_cuenta = \'Activa\'',
        [cliente.id_cliente]
      );

      if (cuentas[0].total > 0) {
        return {
          existe: true,
          estado: "YaTieneCuenta",
          mensaje: "El cliente ya tiene una cuenta activa.",
          nombreCompleto: cliente.nombre_completo,
          idCliente: cliente.id_cliente,
        };
      }

      // ✅ MEJORADO: Buscar solicitud más reciente que NO haya sido utilizada en una cuenta cerrada
      const [solicitudes]: any = await connection.query(
        `SELECT sa.id_solicitud, sa.estado, sa.comentario_director 
         FROM solicitudes_apertura sa
         WHERE sa.id_cliente = ? 
         AND sa.id_solicitud NOT IN (
           SELECT id_solicitud 
           FROM cuentas_ahorro 
           WHERE id_solicitud IS NOT NULL 
           AND estado_cuenta = 'Cerrada'
         )
         ORDER BY sa.fecha_solicitud DESC 
         LIMIT 1`,
        [cliente.id_cliente]
      );

      if (solicitudes.length === 0) {
        return {
          existe: true,
          estado: "SinSolicitud",
          mensaje:
            "No se encontró ninguna solicitud de apertura válida. Debe realizar una nueva solicitud con el asesor.",
          icono: "info",
          nombreCompleto: cliente.nombre_completo,
          idCliente: cliente.id_cliente,
        };
      }

      const solicitud = solicitudes[0];
      let mensaje = "";
      let icono = "";

      switch (solicitud.estado) {
        case "Aprobada":
          mensaje =
            "Solicitud APROBADA. Puede proceder con la apertura de cuenta.";
          icono = "check_circle";
          break;
        case "Rechazada":
          mensaje = `Solicitud RECHAZADA. ${
            solicitud.comentario_director || "No se puede abrir la cuenta."
          }`;
          icono = "cancel";
          break;
        case "Devuelta":
          mensaje = `Solicitud DEVUELTA. ${
            solicitud.comentario_director ||
            "Debe completar información adicional."
          }`;
          icono = "warning";
          break;
        case "Pendiente":
          mensaje =
            "Solicitud PENDIENTE de aprobación por el director. Por favor espere.";
          icono = "schedule";
          break;
        default:
          mensaje = "Estado de solicitud desconocido.";
          icono = "help";
      }

      return {
        existe: true,
        estado: solicitud.estado,
        mensaje,
        icono,
        nombreCompleto: cliente.nombre_completo,
        idCliente: cliente.id_cliente,
        idSolicitud: solicitud.id_solicitud,
      };
    } finally {
      connection.release();
    }
  }

  async verificarClienteJuridico(
  nit: string
  ): Promise<VerificarClienteResponse> {

    const connection = await pool.getConnection();

    try {

      // Buscar empresa
      const [empresas]: any = await connection.query(
        `
        SELECT
          id_info_empresas,
          razon_social,
          nit
        FROM info_empresas
        WHERE nit = ?
        `,
        [nit]
      );

      if (empresas.length === 0) {
        return {
          existe: false,
          estado: 'NoRegistrado',
          mensaje:
            'La empresa no está registrada en el sistema.'
        };
      }

      const empresa = empresas[0];

      // Buscar solicitud más reciente
      const [solicitudes]: any = await connection.query(
        `
        SELECT
          id_solicitud,
          estado,
          comentario_director
        FROM solicitudes_apertura
        WHERE id_empresa = ?
        ORDER BY fecha_solicitud DESC
        LIMIT 1
        `,
        [empresa.id_info_empresas]
      );

      if (solicitudes.length === 0) {
        return {
          existe: true,
          estado: 'SinSolicitud',
          nombreCompleto: empresa.razon_social,
          mensaje:
            'La empresa no tiene solicitudes registradas.'
        };
      }

      const solicitud = solicitudes[0];

      let icono = 'info';
      let mensaje = '';

      switch (solicitud.estado) {

        case 'Aprobada':
          icono = 'check_circle';
          mensaje =
            'Solicitud APROBADA.';
          break;

        case 'Pendiente':
          icono = 'schedule';
          mensaje =
            'Solicitud pendiente de aprobación.';
          break;

        case 'Rechazada':
          icono = 'cancel';
          mensaje =
            solicitud.comentario_director ||
            'Solicitud rechazada.';
          break;

        case 'Devuelta':
          icono = 'warning';
          mensaje =
            solicitud.comentario_director ||
            'Solicitud devuelta.';
          break;

        default:
          mensaje =
            'Estado desconocido.';
      }

      return {
        existe: true,
        estado: solicitud.estado,
        mensaje,
        icono,
        nombreCompleto: empresa.razon_social,
        idSolicitud: solicitud.id_solicitud
      };

    } finally {
      connection.release();
    }
  }

  // Generar número de cuenta único
  private generarNumeroCuenta(): string {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `2001${timestamp}${random}`.slice(0, 16);
  }

  // Aperturar cuenta de ahorro
  async aperturarCuenta(
    datos: AperturarCuentaRequest,
    idUsuario: number // CAMBIAR: recibir id_usuario en lugar de nombreCajero
  ): Promise<AperturarCuentaResponse> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar que la solicitud esté aprobada
      const [solicitudes]: any = await connection.query(
        "SELECT id_cliente, estado FROM solicitudes_apertura WHERE id_solicitud = ?",
        [datos.idSolicitud]
      );

      if (solicitudes.length === 0 || solicitudes[0].estado !== "Aprobada") {
        await connection.rollback();
        return {
          exito: false,
          mensaje: "La solicitud no está aprobada o no existe.",
        };
      }

      const idCliente = solicitudes[0].id_cliente;

      // Generar número de cuenta único
      let numeroCuenta = this.generarNumeroCuenta();

      // Verificar que sea único
      let [existente]: any = await connection.query(
        "SELECT COUNT(*) as total FROM cuentas_ahorro WHERE numero_cuenta = ?",
        [numeroCuenta]
      );

      while (existente[0].total > 0) {
        numeroCuenta = this.generarNumeroCuenta();
        [existente] = await connection.query(
          "SELECT COUNT(*) as total FROM cuentas_ahorro WHERE numero_cuenta = ?",
          [numeroCuenta]
        );
      }

      // Crear cuenta
      const [resultCuenta]: any = await connection.query(
        "INSERT INTO cuentas_ahorro (numero_cuenta, id_cliente, id_solicitud, saldo) VALUES (?, ?, ?, ?)",
        [numeroCuenta, idCliente, datos.idSolicitud, datos.valorDeposito]
      );

      const idCuenta = resultCuenta.insertId;

      // ✅ MEJORADO: Registrar transacción de apertura con todos los campos
      const [resultTransaccion]: any = await connection.query(
        `INSERT INTO transacciones (id_cuenta, tipo_transaccion, tipo_deposito, monto, codigo_cheque, numero_cheque, saldo_anterior, saldo_nuevo, id_usuario, id_caja)
         VALUES (?, 'Apertura', ?, ?, ?, ?, 0, ?, ?, ?)`,
        [
          idCuenta,
          datos.tipoDeposito,
          datos.valorDeposito,
          datos.codigoCheque || null,
          datos.numeroCheque || null,
          datos.valorDeposito,
          idUsuario, // ← id_usuario del cajero (parámetro de la función)
          datos.idCaja || null, // ← id_caja asignada
        ]
      );

      const idTransaccion = resultTransaccion.insertId;

      // Actualizar estado de la solicitud a "Aperturada"
      await connection.query(
        `UPDATE solicitudes_apertura 
         SET estado = \'Aperturada\', fecha_respuesta = NOW() 
         WHERE id_solicitud = ?`,
        [datos.idSolicitud]
      );

      console.log(`✅ Solicitud ${datos.idSolicitud} marcada como Aperturada`);

      // ✅ CORREGIDO: Actualizar saldo del cajero actual (no "Cajero 01")
      console.log(`📦 Actualizando saldo de cajero: ${idUsuario}`);
      if (datos.tipoDeposito === "Efectivo") {
        await saldoCajeroService.actualizarSaldoEfectivo(
          datos.valorDeposito,
          "sumar",
          idUsuario
        );
      } else if (datos.tipoDeposito === "Cheque") {
        await saldoCajeroService.actualizarSaldoCheques(
          datos.valorDeposito,
          "sumar",
          idUsuario
        );
      }

      await connection.commit();

      return {
        exito: true,
        mensaje: "Cuenta aperturada exitosamente.",
        numeroCuenta,
        idCuenta,
        idTransaccion,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error al aperturar cuenta:", error);
      return {
        exito: false,
        mensaje: "Error al procesar la apertura. Intente nuevamente.",
      };
    } finally {
      connection.release();
    }
  }
}

export default new AperturaService();

