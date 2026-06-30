import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole } from '../../shared/middleware/authMiddleware';
import { ClienteController } from './controllers/consultarController';
import { RegistrarClienteController } from './controllers/registrarClienteController';
import solicitudController from './controllers/solicitudController';
import consultarController from './controllers/consultarSolicitudController';
import movimientosCuentaController from './controllers/movimientosCuentaController';

// const router = Router();
const router: Router = Router();

const clienteController = new ClienteController();
const registrarCLienteController = new RegistrarClienteController();

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, imágenes y Word.'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ========== RUTAS DE CONSULTA DE SOLICITUDES ==========
// Buscar cliente por número de documento (GET)
router.get('/cliente/:numeroDocumento', (req, res) =>
  clienteController.buscarCliente(req, res)
);

router.get('/empresa/:nit', (req, res) =>
  clienteController.buscarEmpresa(req, res)
);

// Registrar cliente completo
router.post('/registrar-cliente', (req, res) => registrarCLienteController.registrar(req, res));

router.get(
  '/solicitudes/cedula/:cedula',
  requireRole('Asesor', 'Director-operativo', 'Cajero'),
  consultarController.buscarPorCedula
);

router.get(
  '/solicitudes/nit/:nit',
  requireRole('Asesor', 'Director-operativo', 'Cajero'),
  consultarController.buscarPorNit
);

router.get(
  '/solicitudes/:id',
  requireRole('Asesor', 'Director-operativo', 'Cajero'),
  consultarController.obtenerPorId
);

// ========== RUTAS PARA CLIENTES ==========
router.get('/clientes/:cedula', solicitudController.buscarCliente);
router.get('/empresas/:nit', solicitudController.buscarEmpresa);

// ========== RUTAS PARA EDITAR CLIENTES ==========
// Obtener cliente completo por ID
router.get('/cliente-id/:id', (req, res) =>
  clienteController.obtenerClientePorId(req, res)
);

// Actualizar cliente existente
router.put('/actualizar-cliente/:id', (req, res) =>
  clienteController.actualizarCliente(req, res)
);

// ========== MOVIMIENTOS ==========
router.get(
  '/movimientos/cuenta/:numeroCuenta',
  requireRole('Asesor'),
  movimientosCuentaController.buscarCuenta
);

router.get(
  '/movimientos/:numeroCuenta',
  requireRole('Asesor'),
  movimientosCuentaController.consultar
);

// ========== RUTAS PARA SOLICITUDES ==========
router.post(
  '/solicitudes',
  requireRole('Asesor'),
  upload.single('archivo'),
  solicitudController.crearSolicitud
);

router.get(
  '/solicitudes',
  requireRole('Asesor', 'Director-operativo'),
  solicitudController.obtenerSolicitudes
);

router.put(
  '/solicitudes/:id/estado',
  requireRole('Director-operativo'),
  solicitudController.actualizarEstado
);

router.delete(
  '/solicitudes/:id',
  requireRole('Asesor', 'Administrador'),
  solicitudController.eliminarSolicitud
);

router.get(
  '/solicitudes/:id/archivo',
  requireRole('Asesor', 'Director-operativo'),
  solicitudController.descargarArchivo
);



export default router;