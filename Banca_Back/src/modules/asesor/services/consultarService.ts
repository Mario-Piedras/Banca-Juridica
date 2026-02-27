import pool from '../../../config/database';

export class ClienteService {
  async buscarPorDocumento(numeroDocumento: string) {
    const connection = await pool.getConnection();

    try {
      const [clientes]: any = await connection.query(
        `SELECT 
          c.id_cliente, 
          c.tipo_documento, 
          c.numero_documento,
          CONCAT_WS(' ', 
            c.primer_nombre, 
            c.segundo_nombre, 
            c.primer_apellido, 
            c.segundo_apellido
          ) as nombre_completo,   
          c.estado_civil,
          c.genero,
          c.fecha_nacimiento,
          cp.correo,
          cp.telefono,
          cp.direccion,
          cp.ciudad,
          ae.ocupacion
        FROM clientes c
        LEFT JOIN contacto_personal cp ON c.id_cliente = cp.id_cliente
        LEFT JOIN actividad_economica ae ON c.id_cliente = ae.id_cliente
        WHERE c.numero_documento = ?`,
        [numeroDocumento]
      );
      console.log('Resultado de la consulta:', clientes);

      if (clientes.length === 0) {
        return { existe: false, mensaje: 'Cliente no encontrado' };
      }

      const cliente = clientes[0];

      // Consultar cuentas de ahorro asociadas al cliente
      const [cuentas]: any = await connection.query(
        `SELECT 
          numero_cuenta,
          saldo,
          estado_cuenta,
          fecha_apertura
        FROM cuentas_ahorro
        WHERE id_cliente = ? AND estado_cuenta IN ('Activa', 'Cerrada')
        ORDER BY 
          CASE estado_cuenta
            WHEN 'Activa' THEN 1
            WHEN 'Cerrada' THEN 2
          END,
          fecha_apertura DESC`,
        [cliente.id_cliente]
      );

      // Agregar las cuentas al objeto cliente
      cliente.cuentas = cuentas;

      return { existe: true, cliente };
    } catch (error) {
      console.error('Error en ClienteService.buscarPorDocumento:', error);
      throw new Error('Error al consultar el cliente.');
    } finally {
      connection.release();
    }
  }
}
