import { Request, Response } from 'express';
import { ConsultarService } from '../services/consultarService';

const consultarService = new ConsultarService();

export class ConsultarController {
  
  // Buscar solicitudes por id_usuario_rol (ID del asesor)
  async buscarSolicitudesPorAsesor(req: Request, res: Response): Promise<void> {
    try {
      const { id_usuario_rol } = req.params;

      if (!id_usuario_rol) {
        res.status(400).json({
          success: false,
          message: 'El ID del asesor es requerido'
        });
        return;
      }

      const solicitudes = await consultarService.obtenerSolicitudesPorAsesor(parseInt(id_usuario_rol));

      res.status(200).json({
        success: true,
        message: 'Solicitudes encontradas',
        data: solicitudes
      });
    } catch (error) {
      console.error('Error al buscar solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar las solicitudes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener detalle de una solicitud específica
  async obtenerDetalleSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const { id_solicitud } = req.params;

      if (!id_solicitud) {
        res.status(400).json({
          success: false,
          message: 'El ID de la solicitud es requerido'
        });
        return;
      }

      const solicitud = await consultarService.obtenerDetalleSolicitud(parseInt(id_solicitud));

      if (!solicitud) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Detalle de la solicitud',
        data: solicitud
      });
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el detalle de la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener todas las solicitudes (para el director)
  async obtenerTodasSolicitudes(req: Request, res: Response): Promise<void> {
    try {
      const { estado } = req.query;

      const solicitudes = await consultarService.obtenerTodasSolicitudes(estado as string);

      res.status(200).json({
        success: true,
        message: 'Solicitudes encontradas',
        data: solicitudes
      });
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las solicitudes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}