import { Router } from 'express';
import { LoginController } from './controllers/loginController';
import { RegistroController } from './controllers/registroController';

const router = Router();
const loginController = new LoginController();
const registroController = new RegistroController();

// ========== RUTAS DE LOGIN ==========
router.post('/login', loginController.login);
router.post('/logout', loginController.logout);  // 👈 RUTA DE LOGOUT AGREGADA
router.get('/roles-disponibles', loginController.getRolesDisponibles);
router.post('/asignar-rol', loginController.asignarRol);
router.get('/verificar-rol', loginController.verificarRol);
router.get('/roles', loginController.getRoles);

// ========== RUTAS DE REGISTRO ==========
router.post('/registro', registroController.registrarUsuario);
router.get('/validar-email', registroController.validarEmail);
router.get('/usuarios', registroController.obtenerUsuarios);
router.get('/usuario/:correo', registroController.obtenerUsuarioPorCorreo);

export default router;
