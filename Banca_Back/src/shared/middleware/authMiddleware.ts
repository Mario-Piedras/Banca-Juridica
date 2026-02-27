import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';

// Extender la interfaz Request para incluir los datos del usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id_usuario: number;
        correo: string;
        nombre: string; 
        rol: string;
        id_usuario_rol?: number;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'banca_uno_secret_key_2025';

/**
 * Middleware para verificar el token JWT y obtener el id_usuario_rol
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar y decodificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id_usuario: number;
      correo: string;
      nombre: string; 
      rol: string;
      id_usuario_rol?: number;
    };

    // AGREGAR LOG para debug
    console.log('🔑 Token decodificado:', JSON.stringify(decoded, null, 2));

    // Si el token ya incluye id_usuario_rol (tokens nuevos), usarlo directamente
    if (decoded.id_usuario_rol) {
      req.user = {
        id_usuario: decoded.id_usuario,
        correo: decoded.correo,
        nombre: decoded.nombre, 
        rol: decoded.rol,
        id_usuario_rol: decoded.id_usuario_rol
      };
      next();
      return;
    }

    // Para tokens antiguos sin id_usuario_rol, buscar en la base de datos
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT ur.id_usuario_rol, ur.id_usuario, ur.id_rol, r.nombre as rol
         FROM usuario_rol ur
         INNER JOIN roles r ON ur.id_rol = r.id_rol
         INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
         WHERE u.id_usuario = ? AND r.nombre = ?`,
        [decoded.id_usuario, decoded.rol]
      );

      if (rows.length === 0) {
        res.status(403).json({
          success: false,
          message: 'Usuario no tiene el rol asignado'
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = {
        id_usuario: decoded.id_usuario,
        correo: decoded.correo,
        nombre: decoded.nombre, 
        rol: decoded.rol,
        id_usuario_rol: rows[0].id_usuario_rol
      };

      next();
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error en authMiddleware:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware opcional para verificar roles específicos
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
      });
      return;
    }

    next();
  };
};
