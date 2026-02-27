import pool from '../../../config/database';
import { RowDataPacket } from 'mysql2';
import { SolicitudConsultaResponse } from '../../../shared/interfaces';

export class ConsultarService {

  // Obtener solicitudes por id_usuario_rol (ID del asesor)
  async obtenerSolicitudesPorAsesor(id_usuario_rol: number): Promise<SolicitudConsultaResponse[]> {
    try {
      const query = `
        SELECT 
          sa.id_solicitud,
          sa.id_usuario_rol as id_asesor,
          sa.tipo_cuenta as producto,
          sa.estado,
          sa.fecha_solicitud as fecha,
          sa.comentario_director,
          sa.comentario_asesor,
          c.numero_documento as cedula,
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido
        FROM solicitudes_apertura sa
        INNER JOIN clientes c ON sa.id_cliente = c.id_cliente
        WHERE sa.id_usuario_rol = ?
        ORDER BY sa.fecha_solicitud DESC
      `;

      const [rows] = await pool.query<RowDataPacket[]>(query, [id_usuario_rol]);

      const solicitudes: SolicitudConsultaResponse[] = rows.map(row => ({
        id_solicitud: row.id_solicitud,
        id_asesor: row.id_asesor,
        cedula: row.cedula,
        fecha: this.formatearFecha(row.fecha),
        estado: row.estado,
        producto: row.producto,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        nombre_completo: this.construirNombreCompleto(
          row.primer_nombre,
          row.segundo_nombre,
          row.primer_apellido,
          row.segundo_apellido
        )
      }));

      return solicitudes;
    } catch (error) {
      console.error('Error en obtenerSolicitudesPorAsesor:', error);
      throw new Error('Error al consultar las solicitudes del asesor');
    }
  }

  // Obtener detalle completo de una solicitud
  async obtenerDetalleSolicitud(id_solicitud: number): Promise<SolicitudConsultaResponse | null> {
    try {
      const query = `
        SELECT 
          sa.id_solicitud,
          sa.id_usuario_rol as id_asesor,
          sa.tipo_cuenta as producto,
          sa.estado,
          sa.fecha_solicitud as fecha,
          sa.fecha_respuesta,
          sa.comentario_director,
          sa.comentario_asesor,
          c.numero_documento as cedula,
          c.tipo_documento,
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido,
          c.genero,
          c.estado_civil,
          c.fecha_nacimiento,
          u.nombre as nombre_asesor,
          u.correo as correo_asesor
        FROM solicitudes_apertura sa
        INNER JOIN clientes c ON sa.id_cliente = c.id_cliente
        INNER JOIN usuario_rol ur ON sa.id_usuario_rol = ur.id_usuario_rol
        INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
        WHERE sa.id_solicitud = ?
      `;

      const [rows] = await pool.query<RowDataPacket[]>(query, [id_solicitud]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];

      return {
        id_solicitud: row.id_solicitud,
        id_asesor: row.id_asesor,
        cedula: row.cedula,
        tipo_documento: row.tipo_documento,
        fecha: this.formatearFecha(row.fecha),
        fecha_respuesta: row.fecha_respuesta ? this.formatearFecha(row.fecha_respuesta) : null,
        estado: row.estado,
        producto: row.producto,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        nombre_completo: this.construirNombreCompleto(
          row.primer_nombre,
          row.segundo_nombre,
          row.primer_apellido,
          row.segundo_apellido
        ),
        genero: row.genero,
        estado_civil: row.estado_civil,
        fecha_nacimiento: this.formatearFecha(row.fecha_nacimiento),
        nombre_asesor: row.nombre_asesor,
        correo_asesor: row.correo_asesor
      };
    } catch (error) {
      console.error('Error en obtenerDetalleSolicitud:', error);
      throw new Error('Error al consultar el detalle de la solicitud');
    }
  }

  // Obtener todas las solicitudes (para el director)
  async obtenerTodasSolicitudes(estado?: string): Promise<SolicitudConsultaResponse[]> {
    try {
      let query = `
        SELECT 
          sa.id_solicitud,
          sa.id_usuario_rol as id_asesor,
          sa.tipo_cuenta as producto,
          sa.estado,
          sa.fecha_solicitud as fecha,
          sa.comentario_director,
          sa.comentario_asesor,
          c.numero_documento as cedula,
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido,
          u.nombre as nombre_asesor
        FROM solicitudes_apertura sa
        INNER JOIN clientes c ON sa.id_cliente = c.id_cliente
        INNER JOIN usuario_rol ur ON sa.id_usuario_rol = ur.id_usuario_rol
        INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
      `;

      const params: any[] = [];

      if (estado) {
        query += ` WHERE sa.estado = ?`;
        params.push(estado);
      }

      query += ` ORDER BY sa.fecha_solicitud DESC`;

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      const solicitudes: SolicitudConsultaResponse[] = rows.map(row => ({
        id_solicitud: row.id_solicitud,
        id_asesor: row.id_asesor,
        cedula: row.cedula,
        fecha: this.formatearFecha(row.fecha),
        estado: row.estado,
        producto: row.producto,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        nombre_completo: this.construirNombreCompleto(
          row.primer_nombre,
          row.segundo_nombre,
          row.primer_apellido,
          row.segundo_apellido
        ),
        nombre_asesor: row.nombre_asesor
      }));

      return solicitudes;
    } catch (error) {
      console.error('Error en obtenerTodasSolicitudes:', error);
      throw new Error('Error al consultar todas las solicitudes');
    }
  }

  // Métodos auxiliares
  private formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private construirNombreCompleto(
    primer_nombre: string,
    segundo_nombre: string | null,
    primer_apellido: string,
    segundo_apellido: string | null
  ): string {
    const nombres = [primer_nombre, segundo_nombre].filter(Boolean).join(' ');
    const apellidos = [primer_apellido, segundo_apellido].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  }
}