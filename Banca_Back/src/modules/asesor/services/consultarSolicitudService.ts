import pool from '../../../config/database';
import { RowDataPacket } from 'mysql2';
import { SolicitudConsultaResponse } from '../../../shared/interfaces';

export class ConsultarSolicitudService {

  async buscarPorCedula(cedula: string): Promise<SolicitudConsultaResponse[]> {
    const query = `
      SELECT 
        s.id_solicitud,
        s.id_usuario_rol as id_asesor,
        c.numero_documento as cedula,
        c.tipo_documento,
        DATE_FORMAT(s.fecha_solicitud, '%Y-%m-%d %H:%i:%s') as fecha,
        DATE_FORMAT(s.fecha_respuesta, '%Y-%m-%d %H:%i:%s') as fecha_respuesta,
        s.estado,
        s.tipo_cuenta as producto,
        s.comentario_director,
        s.comentario_asesor,
        CONCAT(
          c.primer_nombre,
          IFNULL(CONCAT(' ', c.segundo_nombre), ''),
          ' ',
          c.primer_apellido,
          IFNULL(CONCAT(' ', c.segundo_apellido), '')
        ) as nombre_completo,
        c.genero,
        c.estado_civil,
        DATE_FORMAT(c.fecha_nacimiento, '%Y-%m-%d') as fecha_nacimiento,
        u.nombre as nombre_asesor,
        u.correo as correo_asesor
      FROM solicitudes_apertura s
      INNER JOIN clientes c ON s.id_cliente = c.id_cliente
      LEFT JOIN usuario_rol ur ON s.id_usuario_rol = ur.id_usuario_rol
      LEFT JOIN usuarios u ON ur.id_usuario = u.id_usuario
      WHERE c.numero_documento = ?
      ORDER BY s.fecha_solicitud DESC
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, [cedula]);
      
      return rows.map(row => ({
        id_solicitud: row.id_solicitud,
        id_asesor: row.id_asesor,
        cedula: row.cedula,
        tipo_documento: row.tipo_documento,
        fecha: row.fecha,
        fecha_respuesta: row.fecha_respuesta,
        estado: row.estado,
        producto: row.producto,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        nombre_completo: row.nombre_completo,
        genero: row.genero,
        estado_civil: row.estado_civil,
        fecha_nacimiento: row.fecha_nacimiento,
        nombre_asesor: row.nombre_asesor,
        correo_asesor: row.correo_asesor
      }));
    } catch (error) {
      console.error('Error al buscar solicitudes por cédula:', error);
      throw new Error('Error al buscar solicitudes');
    }
  }

  async obtenerPorId(idSolicitud: number): Promise<SolicitudConsultaResponse | null> {
    const query = `
      SELECT 
        s.id_solicitud,
        s.id_usuario_rol as id_asesor,
        c.numero_documento as cedula,
        c.tipo_documento,
        DATE_FORMAT(s.fecha_solicitud, '%Y-%m-%d %H:%i:%s') as fecha,
        DATE_FORMAT(s.fecha_respuesta, '%Y-%m-%d %H:%i:%s') as fecha_respuesta,
        s.estado,
        s.tipo_cuenta as producto,
        s.comentario_director,
        s.comentario_asesor,
        CONCAT(
          c.primer_nombre,
          IFNULL(CONCAT(' ', c.segundo_nombre), ''),
          ' ',
          c.primer_apellido,
          IFNULL(CONCAT(' ', c.segundo_apellido), '')
        ) as nombre_completo,
        c.genero,
        c.estado_civil,
        DATE_FORMAT(c.fecha_nacimiento, '%Y-%m-%d') as fecha_nacimiento,
        u.nombre as nombre_asesor,
        u.correo as correo_asesor
      FROM solicitudes_apertura s
      INNER JOIN clientes c ON s.id_cliente = c.id_cliente
      LEFT JOIN usuario_rol ur ON s.id_usuario_rol = ur.id_usuario_rol
      LEFT JOIN usuarios u ON ur.id_usuario = u.id_usuario
      WHERE s.id_solicitud = ?
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, [idSolicitud]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id_solicitud: row.id_solicitud,
        id_asesor: row.id_asesor,
        cedula: row.cedula,
        tipo_documento: row.tipo_documento,
        fecha: row.fecha,
        fecha_respuesta: row.fecha_respuesta,
        estado: row.estado,
        producto: row.producto,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        nombre_completo: row.nombre_completo,
        genero: row.genero,
        estado_civil: row.estado_civil,
        fecha_nacimiento: row.fecha_nacimiento,
        nombre_asesor: row.nombre_asesor,
        correo_asesor: row.correo_asesor
      };
    } catch (error) {
      console.error('Error al obtener solicitud por ID:', error);
      throw new Error('Error al obtener solicitud');
    }
  }
}