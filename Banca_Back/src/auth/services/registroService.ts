import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import bcrypt from 'bcrypt';
import { RegistroUsuarioRequest, UsuarioResponse } from '../../shared/interfaces';

export class RegistroService {
  
  /**
   * Registrar un nuevo usuario
   */
  async registrarUsuario(datos: RegistroUsuarioRequest): Promise<UsuarioResponse> {
    const connection = await pool.getConnection();

    try {
      // 1. Validar que el correo no exista
      const [existentes] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario FROM usuarios WHERE correo = ?',
        [datos.correo]
      );

      if (existentes.length > 0) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // 2. Validar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.correo)) {
        throw new Error('Formato de correo electrónico inválido');
      }

      // 3. Validar longitud del nombre
      if (datos.nombre.trim().length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }

      // 4. Validar longitud de la contraseña
      if (datos.contrasena.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // 5. Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(datos.contrasena, saltRounds);

      // 6. Insertar usuario en la base de datos
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO usuarios (nombre, correo, contrasena, activo) 
         VALUES (?, ?, ?, TRUE)`,
        [datos.nombre.trim(), datos.correo.toLowerCase().trim(), hashedPassword]
      );

      // 7. Obtener el usuario recién creado
      const [usuarios] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario, nombre, correo, fecha_creacion, activo 
         FROM usuarios 
         WHERE id_usuario = ?`,
        [result.insertId]
      );

      const usuario = usuarios[0];

      return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fecha_creacion: usuario.fecha_creacion,
        activo: usuario.activo
      };

    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Validar si un correo ya existe
   */
  async validarEmail(correo: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario FROM usuarios WHERE correo = ?',
        [correo.toLowerCase().trim()]
      );

      return usuarios.length > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener usuario por correo
   */
  async obtenerUsuarioPorCorreo(correo: string): Promise<UsuarioResponse | null> {
    const connection = await pool.getConnection();

    try {
      const [usuarios] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario, nombre, correo, fecha_creacion, activo 
         FROM usuarios 
         WHERE correo = ? AND activo = TRUE`,
        [correo.toLowerCase().trim()]
      );

      if (usuarios.length === 0) {
        return null;
      }

      const usuario = usuarios[0];

      return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fecha_creacion: usuario.fecha_creacion,
        activo: usuario.activo
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener todos los usuarios (para administración)
   */
  async obtenerUsuarios(): Promise<UsuarioResponse[]> {
    const connection = await pool.getConnection();

    try {
      const [usuarios] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario, nombre, correo, fecha_creacion, activo 
         FROM usuarios 
         ORDER BY fecha_creacion DESC`
      );

      return usuarios.map(u => ({
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        correo: u.correo,
        fecha_creacion: u.fecha_creacion,
        activo: u.activo
      }));
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}
