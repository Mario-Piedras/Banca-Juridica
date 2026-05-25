import { Router } from 'express';
import { PersonasasoController } from '../controllers/personasasoController';
import { authMiddleware, requireRole } from '../../../shared/middleware/authMiddleware';


const router = Router();
const controller = new PersonasasoController();

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
