import { Router } from 'express';
import { InfosociosController } from '../controllers/infosociosController';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';

const router = Router();
const controller = new InfosociosController();

router.get('/', authMiddleware,
    requireRole('Cajero'),
    (req, res) => controller.obtenerTodos(req, res));
    
router.get('/:id', authMiddleware,
    requireRole('Cajero'),
    (req, res) => controller.obtenerUno(req, res));

router.post('/', authMiddleware,
    requireRole('Cajero'),
    (req, res) => controller.crear(req, res));

router.put('/:id', authMiddleware,
    requireRole('Cajero'),
    (req, res) => controller.actualizar(req, res));

router.delete('/:id', authMiddleware,
    requireRole('Cajero'),
    (req, res) => controller.eliminar(req, res));

export default router;
