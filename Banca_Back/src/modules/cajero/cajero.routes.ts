import { Router } from 'express';
import { authMiddleware, requireRole } from '../../shared/middleware/authMiddleware';
import { AperturaController } from './controllers/aperturaController';
import { RetiroController } from './controllers/retiroController';
import { ConsignacionController } from './controllers/consignacionController';
import { NotaDebitoController } from './controllers/notaDebitoController';
import { CancelacionController } from './controllers/cancelacionController';
import { TrasladoController } from './controllers/trasladoController';
import { SaldoCajeroController } from './controllers/saldoCajeroController';

const router = Router();

// ✅ Aplicar autenticación a TODAS las rutas
router.use(authMiddleware);

// Instanciar controladores
const aperturaController = new AperturaController();
const retiroController = new RetiroController();
const consignacionController = new ConsignacionController();
const notaDebitoController = new NotaDebitoController();
const cancelacionController = new CancelacionController();
const trasladoController = new TrasladoController();
const saldoCajeroController = new SaldoCajeroController();

// ========== RUTAS DE APERTURA ==========
router.post('/apertura/verificar-cliente', (req, res) =>
  aperturaController.verificarCliente(req, res)
);

router.post('/apertura/aperturar-cuenta', (req, res) =>
  aperturaController.aperturarCuenta(req, res)
);

// ========== RUTAS DE RETIRO ==========
router.post('/retiro/buscar-cuenta', (req, res) =>
  retiroController.buscarCuenta(req, res)
);

router.post('/retiro/procesar-retiro', (req, res) =>
  retiroController.procesarRetiro(req, res)
);

// ========== RUTAS DE CONSIGNACIÓN ==========
router.post('/consignacion/procesar', (req, res) =>
  consignacionController.procesarConsignacion(req, res)
);

// ========== RUTAS DE NOTA DÉBITO ==========
router.post('/nota-debito/aplicar-nota-debito', (req, res) =>
  notaDebitoController.aplicarNotaDebito(req, res)
);

// ========== RUTAS DE CANCELACIÓN ==========
router.post('/cancelacion/cancelar', (req, res) =>
  cancelacionController.cancelarCuenta(req, res)
);

// ========== RUTAS DE TRASLADO ==========
router.post('/traslado/enviar', (req, res) =>
  trasladoController.enviarTraslado(req, res)
);

router.get('/traslado/consultar-pendientes', (req, res) =>
  trasladoController.consultarTrasladosPendientes(req, res)
);

router.post('/traslado/aceptar', (req, res) =>
  trasladoController.aceptarTraslado(req, res)
);

// ========== RUTAS DE SALDOS ==========
router.get('/saldo/consultar', (req, res) =>
  saldoCajeroController.obtenerSaldos(req, res)
);

export default router;
