import { Router } from 'express';
import { SaldosController } from '../cajero_principal/controllers/saldosController';
import { BovedaController } from './controllers/bovedaController'; // ✅ Nuevo
import { OficinaController } from './controllers/oficinaController'; // ✅ Nuevo
import { authMiddleware } from '../../shared/middleware/authMiddleware';


const router = Router();
// Instanciar controladores

console.log('🔄 RUTAS DE CAJERO-PRINCIPAL CARGADAS'); // ← Agrega este log

const saldosController = new SaldosController(); // ✅ Nuevo
const bovedaController = new BovedaController(); // ✅ Nuevo
const oficinaController = new OficinaController(); // ✅ Nuevo


// ========== RUTAS DE SALDOS CAJEROS ==========
router.get('/cajeros', authMiddleware, saldosController.obtenerSaldosCajeros);
router.get('/caja/:id/movimientos', authMiddleware, saldosController.obtenerMovimientosCaja);
router.get('/resumen-dia', authMiddleware, saldosController.obtenerResumenDia);

// ========== RUTAS DE BÓVEDA ========== ✅ NUEVAS
router.get('/boveda/saldo', bovedaController.obtenerSaldoBoveda);
console.log('✅ Ruta registrada: GET /api/cajero-principal/boveda/saldo'); // ← Agrega este log
// En tu archivo de rutas actual, agrega esto AL PRINCIPIO:
router.get('/test-boveda', (req, res) => {
  console.log('✅ Ruta de prueba funcionando');
  res.json({
    success: true,
    saldo: 500000000,
    message: 'Ruta de prueba funcionando'
  });
});

// ========== RUTAS DE OFICINA ========== ✅ NUEVAS
router.get('/oficina/saldo', authMiddleware, oficinaController.obtenerSaldoOficina);

export default router;