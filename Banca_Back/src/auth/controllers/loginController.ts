import { Request, Response } from 'express';
import { LoginService } from '../services/loginService';
import { LoginRequest } from '../../shared/interfaces';

export class LoginController {
  private loginService: LoginService;

  constructor() {
    this.loginService = new LoginService();
  }

  /**
   * POST /api/auth/login
   * Login de usuario con rol seleccionado
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;

      // Validar datos requeridos
      if (!loginData.correo || !loginData.contrasena || !loginData.rol) {
        res.status(400).json({
          success: false,
          message: 'Correo, contraseña y rol son requeridos'
        });
        return;
      }

      // Intentar login
      const result = await this.loginService.login(loginData);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Error en LoginController.login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor en login.",
      });
    }
  };

  /**
   * POST /api/auth/logout
   * Libera la caja asignada al cajero y cierra sesión en backend
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario } = req.body;

      if (!id_usuario) {
        res.status(400).json({
          success: false,
          message: "id_usuario es requerido para cerrar sesión.",
        });
        return;
      }

      const result = await this.loginService.liberarCajaPorUsuario(id_usuario);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Sesión cerrada. Caja liberada correctamente.",
      });
    } catch (error) {
      console.error("❌ Error en LoginController.logout:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al cerrar sesión.",
      });
    }
  };

  /**
   * GET /api/auth/roles-disponibles?correo=...
   * Obtener roles disponibles para un usuario
   */
  getRolesDisponibles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo } = req.query;

      if (!correo || typeof correo !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Correo es requerido'
        });
        return;
      }

      const roles = await this.loginService.getRolesDisponibles(correo);

      res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles disponibles'
      });
    }
  };

  /**
   * POST /api/auth/asignar-rol
   * Asignar un rol a un usuario
   */
  asignarRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo, rol } = req.body;

      if (!correo || !rol) {
        res.status(400).json({
          success: false,
          message: 'Correo y rol son requeridos'
        });
        return;
      }

      const result = await this.loginService.asignarRol(correo, rol);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error al asignar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al asignar rol'
      });
    }
  };

  /**
   * GET /api/auth/verificar-rol?correo=...&rol=...
   * Verificar si un usuario tiene un rol específico
   */
  verificarRol = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo, rol } = req.query;

      if (!correo || !rol || typeof correo !== 'string' || typeof rol !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Correo y rol son requeridos'
        });
        return;
      }

      const tieneRol = await this.loginService.verificarRol(correo, rol);

      res.status(200).json({
        success: true,
        tieneRol
      });
    } catch (error) {
      console.error('Error al verificar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar rol'
      });
    }
  };

  /**
   * GET /api/auth/roles
   * Obtener todos los roles del sistema
   */
  getRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.loginService.getRoles();

      res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener roles'
      });
    }
  };
}
// import { Request, Response } from 'express';
// import { LoginService } from '../services/loginService';
// import { LoginRequest } from '../../shared/interfaces';

// export class LoginController {
//   private loginService: LoginService;

//   constructor() {
//     this.loginService = new LoginService();
//   }

//   /**
//    * POST /api/auth/login
//    * Login de usuario con rol seleccionado
//    */
//   login = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const loginData: LoginRequest = req.body;

//       // Validar datos requeridos
//       if (!loginData.correo || !loginData.contrasena || !loginData.rol) {
//         res.status(400).json({
//           success: false,
//           message: 'Correo, contraseña y rol son requeridos'
//         });
//         return;
//       }

//       // Intentar login
//       const result = await this.loginService.login(loginData);

//       if (result.success) {
//         res.status(200).json(result);
//       } else {
//         res.status(401).json(result);
//       }
//     } catch (error) {
//       console.error('Error en login:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error interno del servidor'
//       });
//     }
//   };

//   /**
//    * GET /api/auth/roles-disponibles?correo=...
//    * Obtener roles disponibles para un usuario
//    */
//   getRolesDisponibles = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { correo } = req.query;

//       if (!correo || typeof correo !== 'string') {
//         res.status(400).json({
//           success: false,
//           message: 'Correo es requerido'
//         });
//         return;
//       }

//       const roles = await this.loginService.getRolesDisponibles(correo);

//       res.status(200).json({
//         success: true,
//         roles
//       });
//     } catch (error) {
//       console.error('Error al obtener roles:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error al obtener roles disponibles'
//       });
//     }
//   };

//   /**
//    * POST /api/auth/asignar-rol
//    * Asignar un rol a un usuario
//    */
//   asignarRol = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { correo, rol } = req.body;

//       if (!correo || !rol) {
//         res.status(400).json({
//           success: false,
//           message: 'Correo y rol son requeridos'
//         });
//         return;
//       }

//       const result = await this.loginService.asignarRol(correo, rol);

//       if (result.success) {
//         res.status(200).json(result);
//       } else {
//         res.status(400).json(result);
//       }
//     } catch (error) {
//       console.error('Error al asignar rol:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error al asignar rol'
//       });
//     }
//   };

//   /**
//    * GET /api/auth/verificar-rol?correo=...&rol=...
//    * Verificar si un usuario tiene un rol específico
//    */
//   verificarRol = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { correo, rol } = req.query;

//       if (!correo || !rol || typeof correo !== 'string' || typeof rol !== 'string') {
//         res.status(400).json({
//           success: false,
//           message: 'Correo y rol son requeridos'
//         });
//         return;
//       }

//       const tieneRol = await this.loginService.verificarRol(correo, rol);

//       res.status(200).json({
//         success: true,
//         tieneRol
//       });
//     } catch (error) {
//       console.error('Error al verificar rol:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error al verificar rol'
//       });
//     }
//   };

//   /**
//    * GET /api/auth/roles
//    * Obtener todos los roles del sistema
//    */
//   getRoles = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const roles = await this.loginService.getRoles();

//       res.status(200).json({
//         success: true,
//         roles
//       });
//     } catch (error) {
//       console.error('Error al obtener roles:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Error al obtener roles'
//       });
//     }
//   };
// }
