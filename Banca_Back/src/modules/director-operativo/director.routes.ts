import { Router } from 'express';
import { authMiddleware, requireRole } from '../../shared/middleware/authMiddleware';
import { ConsultarController } from './controllers/consultarController';
import { SolicitudClienteController } from './controllers/solicitudClienteController';

const router = Router();
const consultarController = new ConsultarController();
const solicitudClienteController = new SolicitudClienteController();


router.use(authMiddleware);

// ===== RUTAS DE CONSULTA DE SOLICITUDES =====

// Ruta para buscar solicitudes por ID de asesor (id_usuario_rol)
router.get(
  '/solicitudes/asesor/:id_usuario_rol', requireRole('Director-operativo'),
  (req, res) => consultarController.buscarSolicitudesPorAsesor(req, res)
);

/*router.post(
  '/solicitudes', 
  requireRole('Asesor'), 
  upload.single('archivo'), 
  solicitudController.crearSolicitud
);*/

// Ruta para obtener el detalle de una solicitud específica (solo info básica)
router.get(
  '/solicitudes/:id_solicitud',
  (req, res) => consultarController.obtenerDetalleSolicitud(req, res)
);

// Ruta para obtener todas las solicitudes (para el director)
// Se puede filtrar por estado usando query parameter: ?estado=Pendiente
router.get(
  '/solicitudes',
  (req, res) => consultarController.obtenerTodasSolicitudes(req, res)
);

// ===== RUTAS DE GESTIÓN DE SOLICITUDES (APROBAR/RECHAZAR) =====

// Ruta para obtener detalle completo de solicitud con información del cliente
router.get(
  '/solicitud-detalle/:id_solicitud',
  (req, res) => solicitudClienteController.obtenerDetalleCompleto(req, res)
);

// Ruta para rechazar una solicitud
router.put(
  '/solicitud/:id_solicitud/rechazar',
  (req, res) => solicitudClienteController.rechazarSolicitud(req, res)
);

// Ruta para aprobar una solicitud
router.put(
  '/solicitud/:id_solicitud/aprobar',
  (req, res) => solicitudClienteController.aprobarSolicitud(req, res)
);

// Ruta para descargar el archivo adjunto de una solicitud
router.get(
  '/solicitud/:id_solicitud/archivo',
  (req, res) => solicitudClienteController.descargarArchivo(req, res)
);

export default router;