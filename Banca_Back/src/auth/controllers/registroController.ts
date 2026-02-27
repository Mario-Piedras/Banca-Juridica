import { Request, Response } from 'express';
import { RegistroService } from '../services/registroService';
import { RegistroUsuarioRequest } from '../../shared/interfaces';

export class RegistroController {
  private registroService: RegistroService;

  constructor() {
    this.registroService = new RegistroService();
  }

  /**
   * POST /api/auth/registro
   * Registrar un nuevo usuario
   */
  registrarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, correo, contrasena, rol }: RegistroUsuarioRequest = req.body;

      // Validaciones básicas
      if (!nombre || !correo || !contrasena) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios (nombre, correo, contrasena)'
        });
        return;
      }

      // Validar formato de nombre
      if (nombre.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'El nombre debe tener al menos 3 caracteres'
        });
        return;
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        res.status(400).json({
          success: false,
          message: 'Formato de correo electrónico inválido'
        });
        return;
      }

      // Validar longitud de contraseña
      if (contrasena.length < 8) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
        return;
      }

      // Registrar usuario
      const usuario = await this.registroService.registrarUsuario({
        nombre,
        correo,
        contrasena,
        rol
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: usuario
      });

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);

      // Manejo de errores específicos
      if (error.message === 'El correo electrónico ya está registrado') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('inválido') || error.message.includes('debe tener')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al registrar usuario'
      });
    }
  };

  /**
   * GET /api/auth/validar-email?correo=...
   * Validar si un correo ya existe
   */
  validarEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo } = req.query;

      if (!correo || typeof correo !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un correo válido'
        });
        return;
      }

      const existe = await this.registroService.validarEmail(correo);

      res.status(200).json({
        exists: existe
      });

    } catch (error) {
      console.error('Error al validar correo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar correo'
      });
    }
  };

  /**
   * GET /api/auth/usuarios
   * Obtener todos los usuarios (para administración)
   */
  obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.registroService.obtenerUsuarios();

      res.status(200).json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios'
      });
    }
  };

  /**
   * GET /api/auth/usuario/:correo
   * Obtener usuario por correo
   */
  obtenerUsuarioPorCorreo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { correo } = req.params;

      const usuario = await this.registroService.obtenerUsuarioPorCorreo(correo);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: usuario
      });

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario'
      });
    }
  };
}
