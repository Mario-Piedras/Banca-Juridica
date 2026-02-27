import pool from '../../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { SolicitudDetalleCompletaBackend } from '../../../shared/interfaces';

export class SolicitudClienteService {
  
  /**
   * Obtener detalle completo de una solicitud incluyendo información del cliente
   */
  async obtenerDetalleCompleto(id_solicitud: number): Promise<SolicitudDetalleCompletaBackend | null> {
    try {
      const query = `
        SELECT 
          s.id_solicitud,
          s.id_cliente,
          s.id_usuario_rol as id_asesor,
          s.tipo_cuenta,
          s.estado,
          s.comentario_director,
          s.comentario_asesor,
          s.fecha_solicitud,
          s.fecha_respuesta,
          IF(s.archivo IS NOT NULL, true, false) as tiene_archivo,
          
          c.primer_nombre,
          c.segundo_nombre,
          c.primer_apellido,
          c.segundo_apellido,
          c.numero_documento,
          c.tipo_documento,
          c.fecha_nacimiento,
          c.nacionalidad,
          c.genero,
          c.estado_civil,
          
          cp.correo,
          cp.telefono,
          cp.direccion,
          cp.ciudad,
          cp.departamento,
          cp.pais,
          
          ae.ocupacion,
          ae.profesion
          
        FROM solicitudes_apertura s
        INNER JOIN clientes c ON s.id_cliente = c.id_cliente
        LEFT JOIN contacto_personal cp ON c.id_cliente = cp.id_cliente
        LEFT JOIN actividad_economica ae ON c.id_cliente = ae.id_cliente
        WHERE s.id_solicitud = ?
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(query, [id_solicitud]);

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];

      return {
        id_solicitud: row.id_solicitud,
        id_cliente: row.id_cliente,
        id_asesor: row.id_asesor,
        tipo_cuenta: row.tipo_cuenta,
        estado: row.estado,
        comentario_director: row.comentario_director,
        comentario_asesor: row.comentario_asesor,
        fecha_solicitud: row.fecha_solicitud,
        fecha_respuesta: row.fecha_respuesta,
        tiene_archivo: row.tiene_archivo === 1,
        cliente: {
          primer_nombre: row.primer_nombre,
          segundo_nombre: row.segundo_nombre,
          primer_apellido: row.primer_apellido,
          segundo_apellido: row.segundo_apellido,
          numero_documento: row.numero_documento,
          tipo_documento: row.tipo_documento,
          fecha_nacimiento: row.fecha_nacimiento,
          nacionalidad: row.nacionalidad,
          genero: row.genero,
          estado_civil: row.estado_civil
        },
        contacto: {
          correo: row.correo,
          telefono: row.telefono,
          direccion: row.direccion,
          ciudad: row.ciudad,
          departamento: row.departamento,
          pais: row.pais
        },
        actividad_economica: {
          ocupacion: row.ocupacion,
          profesion: row.profesion
        }
      };

    } catch (error) {
      console.error('Error en obtenerDetalleCompleto:', error);
      throw error;
    }
  }

  /**
   * Rechazar una solicitud
   */
  async rechazarSolicitud(id_solicitud: number, comentario: string): Promise<boolean> {
    try {
      const query = `
        UPDATE solicitudes_apertura 
        SET 
          estado = 'Rechazada',
          comentario_director = ?,
          fecha_respuesta = NOW()
        WHERE id_solicitud = ? AND estado = 'Pendiente'
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [comentario, id_solicitud]);

      return result.affectedRows > 0;

    } catch (error) {
      console.error('Error en rechazarSolicitud:', error);
      throw error;
    }
  }

  /**
   * Aprobar una solicitud
   */
  async aprobarSolicitud(id_solicitud: number): Promise<boolean> {
    try {
      const query = `
        UPDATE solicitudes_apertura 
        SET 
          estado = 'Aprobada',
          fecha_respuesta = NOW()
        WHERE id_solicitud = ? AND estado = 'Pendiente'
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [id_solicitud]);

      return result.affectedRows > 0;

    } catch (error) {
      console.error('Error en aprobarSolicitud:', error);
      throw error;
    }
  }

  /**
   * Obtener archivo adjunto de una solicitud con su tipo
   */
  async obtenerArchivo(id_solicitud: number): Promise<{ archivo: Buffer; tipo: string } | null> {
    try {
      const query = `
        SELECT archivo 
        FROM solicitudes_apertura 
        WHERE id_solicitud = ? AND archivo IS NOT NULL
      `;

      const [rows] = await pool.execute<RowDataPacket[]>(query, [id_solicitud]);

      if (rows.length === 0 || !rows[0].archivo) {
        return null;
      }

      const archivo = rows[0].archivo as Buffer;
      
      // Detectar tipo de archivo por magic numbers (primeros bytes)
      const tipo = this.detectarTipoArchivo(archivo);

      return { archivo, tipo };

    } catch (error) {
      console.error('Error en obtenerArchivo:', error);
      throw error;
    }
  }

  /**
   * Detectar tipo de archivo basándose en los magic numbers
   */
  private detectarTipoArchivo(buffer: Buffer): string {
    // Leer los primeros bytes para identificar el tipo
    const header = buffer.slice(0, 12).toString('hex').toLowerCase();

    // PDF: %PDF (25 50 44 46)
    if (header.startsWith('25504446')) {
      return 'pdf';
    }

    // PNG: 89 50 4E 47
    if (header.startsWith('89504e47')) {
      return 'png';
    }

    // JPEG: FF D8 FF
    if (header.startsWith('ffd8ff')) {
      return 'jpg';
    }

    // Word .doc: D0 CF 11 E0 A1 B1 1A E1
    if (header.startsWith('d0cf11e0a1b11ae1')) {
      return 'doc';
    }

    // Word .docx (ZIP): 50 4B 03 04 o 50 4B 05 06
    if (header.startsWith('504b0304') || header.startsWith('504b0506')) {
      // Verificar si es docx leyendo más contenido
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
      if (content.includes('word/') || content.includes('document.xml')) {
        return 'docx';
      }
      return 'zip'; // Podría ser otro tipo de ZIP
    }

    // Por defecto, intentar detectar como PDF (compatibilidad)
    return 'pdf';
  }
}