import { Request, Response } from 'express';
import solicitudService from '../services/solicitudService';

export class SolicitudController {

  // Buscar cliente por cédula
  async buscarCliente(req: Request, res: Response): Promise<void> {
    try {
      const { cedula } = req.params;

      if (!cedula) {
        res.status(400).json({ 
          success: false, 
          message: 'La cédula es requerida' 
        });
        return;
      }

      const cliente = await solicitudService.buscarClientePorCedula(cedula);

      if (!cliente) {
        res.status(404).json({ 
          success: false, 
          message: 'Cliente no encontrado' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: cliente 
      });
    } catch (error) {
      console.error('Error en buscarCliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al buscar el cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Crear nueva solicitud
  async crearSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const { cedula, comentario } = req.body;
      const archivo = req.file?.buffer;

      // Verificar que el usuario esté autenticado y tenga id_usuario_rol
      if (!req.user || !req.user.id_usuario_rol) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado o sin rol asignado' 
        });
        return;
      }

      if (!cedula) {
        res.status(400).json({ 
          success: false, 
          message: 'La cédula es requerida' 
        });
        return;
      }

      // Buscar cliente por cédula
      const cliente = await solicitudService.buscarClientePorCedula(cedula);

      if (!cliente) {
        res.status(404).json({ 
          success: false, 
          message: 'Cliente no encontrado con la cédula proporcionada' 
        });
        return;
      }

      // Crear solicitud con el id_usuario_rol del usuario autenticado
      const idSolicitud = await solicitudService.crearSolicitud(
        cliente.id_cliente,
        req.user.id_usuario_rol,
        comentario,
        archivo
      );

      res.status(201).json({ 
        success: true, 
        message: 'Solicitud creada exitosamente',
        data: {
          id_solicitud: idSolicitud,
          id_cliente: cliente.id_cliente,
          id_usuario_rol: req.user.id_usuario_rol,
          creado_por: req.user.correo
        }
      });
    } catch (error) {
      console.error('Error en crearSolicitud:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener todas las solicitudes
  async obtenerSolicitudes(req: Request, res: Response): Promise<void> {
    try {
      const solicitudes = await solicitudService.obtenerSolicitudes();

      res.status(200).json({ 
        success: true, 
        data: solicitudes 
      });
    } catch (error) {
      console.error('Error en obtenerSolicitudes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener las solicitudes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener solicitud por ID
  async obtenerSolicitudPorId(req: Request, res: Response): Promise<void> {
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

      const solicitud = await solicitudService.obtenerSolicitudPorId(idSolicitud);

      if (!solicitud) {
        res.status(404).json({ 
          success: false, 
          message: 'Solicitud no encontrada' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        data: solicitud 
      });
    } catch (error) {
      console.error('Error en obtenerSolicitudPorId:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar estado de solicitud
  async actualizarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado, comentario_director } = req.body;
      const idSolicitud = parseInt(id);

      if (isNaN(idSolicitud)) {
        res.status(400).json({ 
          success: false, 
          message: 'ID de solicitud inválido' 
        });
        return;
      }

      if (!estado || !['Pendiente', 'Aprobada', 'Rechazada', 'Devuelta'].includes(estado)) {
        res.status(400).json({ 
          success: false, 
          message: 'Estado inválido' 
        });
        return;
      }

      const actualizado = await solicitudService.actualizarEstadoSolicitud(
        idSolicitud,
        estado,
        comentario_director
      );

      if (!actualizado) {
        res.status(404).json({ 
          success: false, 
          message: 'Solicitud no encontrada' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        message: 'Estado actualizado exitosamente' 
      });
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al actualizar el estado',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Eliminar solicitud
  async eliminarSolicitud(req: Request, res: Response): Promise<void> {
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

      const eliminado = await solicitudService.eliminarSolicitud(idSolicitud);

      if (!eliminado) {
        res.status(404).json({ 
          success: false, 
          message: 'Solicitud no encontrada' 
        });
        return;
      }

      res.status(200).json({ 
        success: true, 
        message: 'Solicitud eliminada exitosamente' 
      });
    } catch (error) {
      console.error('Error en eliminarSolicitud:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al eliminar la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Descargar archivo de solicitud
  async descargarArchivo(req: Request, res: Response): Promise<void> {
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

      const archivo = await solicitudService.obtenerArchivo(idSolicitud);

      if (!archivo) {
        res.status(404).json({ 
          success: false, 
          message: 'Archivo no encontrado' 
        });
        return;
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=solicitud_${idSolicitud}.pdf`);
      res.send(archivo);
    } catch (error) {
      console.error('Error en descargarArchivo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al descargar el archivo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default new SolicitudController();