import { Request, Response } from 'express';
import { ConsultarSolicitudService } from '../services/consultarSolicitudService';

const consultarService = new ConsultarSolicitudService();

export class ConsultarSolicitudController {

  async buscarPorCedula(req: Request, res: Response): Promise<void> {
    try {
      const { cedula } = req.params;

      if (!cedula || cedula.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'La cédula es requerida'
        });
        return;
      }

      const solicitudes = await consultarService.buscarPorCedula(cedula);

      if (solicitudes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No se encontraron solicitudes para esta cédula',
          data: []
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Se encontraron ${solicitudes.length} solicitud(es)`,
        data: solicitudes
      });

    } catch (error) {
      console.error('Error en buscarPorCedula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar solicitudes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async buscarPorNit(req: Request, res: Response): Promise<void> {
    try {
      const { nit } = req.params;

      if (!nit || nit.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El NIT es requerido'
        });
        return;
      }

      // Llama al método del servicio (lo implementaremos en el siguiente paso)
      const solicitudes = await consultarService.buscarPorNit(nit);

      if (solicitudes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No se encontraron solicitudes para este NIT',
          data: []
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Se encontraron ${solicitudes.length} solicitud(es) para la empresa`,
        data: solicitudes
      });

    } catch (error) {
      console.error('Error en buscarPorNit:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar solicitudes de la empresa',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const idSolicitud = parseInt(id);
      if (isNaN(idSolicitud)) {
        res.status(400).json({
          success: false,
          message: 'ID de solicitud inválido'
        });
        return;
      }

      const solicitud = await consultarService.obtenerPorId(idSolicitud);

      if (!solicitud) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Solicitud encontrada',
        data: solicitud
      });

    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default new ConsultarSolicitudController();