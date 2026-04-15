import { Router } from 'express';
import { PaistributarController } from '../controllers/paistributarController';

const router = Router();
const controller = new PaistributarController();

router.get('/', (req, res) => controller.obtenerTodos(req, res));
router.get('/:id', (req, res) => controller.obtenerUno(req, res));
router.post('/', (req, res) => controller.crear(req, res));
router.put('/:id', (req, res) => controller.actualizar(req, res));
router.delete('/:id', (req, res) => controller.eliminar(req, res));

export default router;
