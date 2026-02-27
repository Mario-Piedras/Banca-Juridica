import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { PoolConnection } from "mysql2/promise";
import pool from '../../config/database';
import { LoginRequest, LoginResponse, Rol } from '../../shared/interfaces';

export class LoginService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'banca_uno_secret_key_2025';
  private readonly JWT_EXPIRES_IN = '8h';

  /**
   * Login de usuario con asignación automática de rol y caja para cajeros
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const connection = await pool.getConnection();

    try {
      console.log('\n🔐 === PROCESO DE LOGIN ===');
      console.log('📧 Correo:', loginData.correo);
      console.log('👤 Rol solicitado:', loginData.rol);

      // 1. Buscar usuario por correo
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
        [loginData.correo]
      );

      if (usuarios.length === 0) {
        console.log('❌ Usuario no encontrado');
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      const usuario = usuarios[0];
      console.log('✅ Usuario encontrado:', usuario.nombre);

      // 2. Verificar si el usuario está activo
      if (!usuario.activo) {
        console.log('❌ Usuario inactivo');
        return {
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        };
      }

      // 3. Verificar contraseña
      const passwordValida = await bcryptjs.compare(loginData.contrasena, usuario.contrasena);

      if (!passwordValida) {
        console.log('❌ Contraseña incorrecta');
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      console.log('✅ Contraseña correcta');

      // 4. Verificar que el rol existe en el sistema
      const [rolesExistentes] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol, nombre, descripcion FROM roles WHERE nombre = ?',
        [loginData.rol]
      );

      if (rolesExistentes.length === 0) {
        console.log('❌ Rol no existe:', loginData.rol);
        return {
          success: false,
          message: `El rol ${loginData.rol} no existe en el sistema`
        };
      }

      const rol = rolesExistentes[0];
      console.log('✅ Rol encontrado:', rol.nombre);

      // 5. Verificar si el usuario ya tiene el rol asignado
      const [rolesUsuario] = await connection.query<RowDataPacket[]>(
        `SELECT id_usuario_rol FROM usuario_rol 
         WHERE id_usuario = ? AND id_rol = ?`,
        [usuario.id_usuario, rol.id_rol]
      );

      let idUsuarioRol: number;

      // 6. Si no tiene el rol, asignárselo automáticamente
      if (rolesUsuario.length === 0) {
        const [result] = await connection.query<ResultSetHeader>(
          'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
          [usuario.id_usuario, rol.id_rol]
        );
        idUsuarioRol = result.insertId;
        console.log(`✅ Rol ${loginData.rol} asignado automáticamente`);
      } else {
        idUsuarioRol = rolesUsuario[0].id_usuario_rol;
        console.log('✅ Usuario ya tiene el rol asignado');
      }

      // 7. Si el rol es "Cajero", asignar la primera caja libre
      let cajaAsignada: { id_caja: number; nombre_caja: string } | null = null;
      if (rol.nombre.toLowerCase() === 'cajero') {
        cajaAsignada = await this.asignarPrimeraCajaLibre(connection, usuario.id_usuario, usuario.nombre, rol.nombre);
        
        if (!cajaAsignada) {
          console.log('⚠️ No hay cajas libres en este momento');
          return { 
            success: false, 
            message: 'No hay cajas disponibles en este momento. Intente más tarde.' 
          };
        }
        console.log('✅ Caja asignada al usuario:', cajaAsignada);
      }

      // 8. Generar token JWT
      const tokenPayload: any = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: rol.nombre,
        id_usuario_rol: idUsuarioRol
      };

      if (cajaAsignada) {
        tokenPayload.id_caja = cajaAsignada.id_caja;
        tokenPayload.nombre_caja = cajaAsignada.nombre_caja;
      }

      const token = jwt.sign(
        tokenPayload,
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      console.log('✅ Token JWT generado');

      // 9. Preparar datos de respuesta
      const responseUser: any = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: rol.nombre,
        id_usuario_rol: idUsuarioRol
      };

      if (cajaAsignada) {
        responseUser.id_caja = cajaAsignada.id_caja;
        responseUser.nombre_caja = cajaAsignada.nombre_caja;
      }

      console.log('✅ === LOGIN EXITOSO ===\n');

      // 10. Retornar respuesta exitosa
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        token,
        user: responseUser
      };

    } catch (error) {
      console.error('❌ Error en login service:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Método auxiliar: asignarPrimeraCajaLibre
   * Asigna la primera caja libre disponible para un cajero
   */
  private async asignarPrimeraCajaLibre(
  connection: PoolConnection, 
  idUsuario: number, 
  nombreUsuario: string,
  rolUsuario: string  // ← AGREGAR este parámetro
): Promise<{ id_caja: number; nombre_caja: string } | null> {
  await connection.beginTransaction();

  try {
    // Determinar qué cajas puede usar este usuario
    let queryCajas = '';
    let params: any[] = [];
    
    if (rolUsuario.toLowerCase() === 'cajero-principal') {
      // Cajero Principal solo puede usar la Caja Principal
      queryCajas = `SELECT id_caja, nombre_caja FROM cajas
                   WHERE estado = 'LIBRE' AND nombre_caja = 'Caja Principal'
                   ORDER BY id_caja
                   LIMIT 1
                   FOR UPDATE`;
    } else {
      // Cajero normal NO puede usar la Caja Principal
      queryCajas = `SELECT id_caja, nombre_caja FROM cajas
                   WHERE estado = 'LIBRE' AND nombre_caja != 'Caja Principal'
                   ORDER BY id_caja
                   LIMIT 1
                   FOR UPDATE`;
    }

    const [cajasRows] = await connection.query<RowDataPacket[]>(queryCajas, params);

    // Si no hay cajas libres, hacer rollback y devolver null
    if (cajasRows.length === 0) {
      await connection.rollback();
      
      // Mensaje específico según el rol
      if (rolUsuario.toLowerCase() === 'cajero-principal') {
        console.log('❌ No hay Caja Principal disponible');
      } else {
        console.log('❌ No hay cajas regulares disponibles');
      }
      
      return null;
    }

    // Tomar la primera caja disponible
    const caja = cajasRows[0];
    const idCaja = caja.id_caja;

    // Marcar la caja como ocupada y asignar el usuario
    await connection.query(
      `UPDATE cajas
       SET estado = 'OCUPADA', usuario_asignado = ?, fecha_asignacion = NOW()
       WHERE id_caja = ?`,
      [idUsuario, idCaja]
    );

    // Verificar si existe un registro en saldos_cajero para este usuario
    const [saldoRows] = await connection.query<RowDataPacket[]>(
      `SELECT id_saldo FROM saldos_cajero WHERE id_usuario = ? LIMIT 1`,
      [idUsuario]
    );

    if (saldoRows.length === 0) {
      // Si no existe, crear registro con saldo 0 y vincular id_caja
      await connection.query(
        `INSERT INTO saldos_cajero (id_usuario, cajero, saldo_efectivo, saldo_cheques, id_caja)
         VALUES (?, ?, 0.00, 0.00, ?)`,
        [idUsuario, nombreUsuario, idCaja]
      );
    } else {
      // Si existe, actualizar la caja asignada
      await connection.query(
        `UPDATE saldos_cajero SET id_caja = ? WHERE id_usuario = ?`,
        [idCaja, idUsuario]
      );
    }

    // Commit de la transacción para persistir cambios
    await connection.commit();

    console.log(`✅ Caja asignada: ${caja.nombre_caja} para ${rolUsuario}`);
    
    // Devolver datos de la caja asignada
    return { id_caja: idCaja, nombre_caja: caja.nombre_caja };

  } catch (err) {
    // Si hay error, hacer rollback y re-lanzar
    await connection.rollback();
    console.error('Error asignando caja (transacción):', err);
    throw err;
  }
}
  

  // En loginService.ts - AGREGAR ESTE MÉTODO
private async asignarCajaFijaPrincipal(
  connection: PoolConnection, 
  idUsuario: number,
  nombreUsuario: string
): Promise<{ id_caja: number; nombre_caja: string } | null> {
  
  // Buscar la caja principal (Caja 6)
  const [cajasRows] = await connection.query<RowDataPacket[]>(
    `SELECT id_caja, nombre_caja FROM cajas 
     WHERE nombre_caja = 'Caja Principal' AND estado = 'LIBRE'`
  );

  if (cajasRows.length === 0) {
    console.log('❌ Caja Principal no disponible');
    return null;
  }

  const caja = cajasRows[0];
  
  // Marcar como ocupada por el cajero principal
  await connection.query(
    `UPDATE cajas SET estado = 'OCUPADA', usuario_asignado = ?, fecha_asignacion = NOW()
     WHERE id_caja = ?`,
    [idUsuario, caja.id_caja]
  );

  // Crear/actualizar registro en saldos_cajero
  const [saldoRows] = await connection.query<RowDataPacket[]>(
    `SELECT id_saldo FROM saldos_cajero WHERE id_usuario = ? LIMIT 1`,
    [idUsuario]
  );

  if (saldoRows.length === 0) {
    await connection.query<ResultSetHeader>(
  `INSERT INTO saldos_cajero (id_usuario, cajero, saldo_efectivo, saldo_cheques, id_caja)
   VALUES (?, ?, 0.00, 0.00, ?)`,
  [idUsuario, nombreUsuario, caja.id_caja]
    );
  } else {
    await connection.query(
  `UPDATE saldos_cajero SET id_caja = ? WHERE id_usuario = ?`,
  [caja.id_caja, idUsuario]
);
  }

  console.log('✅ Caja Principal asignada a:', nombreUsuario);
  return { id_caja: caja.id_caja, nombre_caja: caja.nombre_caja };
}
  /**
   * Liberar la caja asociada a un usuario (para logout)
   */
// En loginService.ts - MODIFICAR el método liberarCajaPorUsuario

/**
 * Liberar la caja asociada a un usuario (para logout) - INCLUYE CAJA PRINCIPAL
 */
async liberarCajaPorUsuario(idUsuario: number): Promise<{ success: boolean; message: string }> {
  const connection = await pool.getConnection();

  try {
    // ✅ LIBERAR TODAS LAS CAJAS (NORMALES Y PRINCIPAL) asignadas a este usuario
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE cajas
       SET estado = 'LIBRE', usuario_asignado = NULL, fecha_asignacion = NULL
       WHERE usuario_asignado = ?`,
      [idUsuario]
    );

    // Si no se afectaron filas, significa que no tenía caja asignada
    if (result.affectedRows === 0) {
      return { success: true, message: 'No se encontró caja asignada para este usuario.' };
    }

    return { 
      success: true, 
      message: `Caja${result.affectedRows > 1 ? 's' : ''} liberada${result.affectedRows > 1 ? 's' : ''} correctamente.` 
    };

  } catch (error) {
    console.error('Error liberando caja:', error);
    throw error;
  } finally {
    connection.release();
  }
}

  /**
   * Obtener roles disponibles para un usuario
   */
  async getRolesDisponibles(correo: string): Promise<Rol[]> {
    const connection = await pool.getConnection();

    try {
      const [roles] = await connection.query<RowDataPacket[]>(
        `SELECT r.id_rol, r.nombre, r.descripcion 
         FROM usuario_rol ur
         INNER JOIN roles r ON ur.id_rol = r.id_rol
         INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
         WHERE u.correo = ? AND u.activo = TRUE`,
        [correo]
      );

      return roles as Rol[];
    } catch (error) {
      console.error('Error al obtener roles disponibles:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Asignar un rol a un usuario
   */
  async asignarRol(correo: string, nombreRol: string): Promise<{ success: boolean; message: string }> {
    const connection = await pool.getConnection();

    try {
      // 1. Obtener id del usuario
      const [usuarios] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario FROM usuarios WHERE correo = ?',
        [correo]
      );

      if (usuarios.length === 0) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const idUsuario = usuarios[0].id_usuario;

      // 2. Obtener id del rol
      const [roles] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol FROM roles WHERE nombre = ?',
        [nombreRol]
      );

      if (roles.length === 0) {
        return { success: false, message: 'Rol no encontrado' };
      }

      const idRol = roles[0].id_rol;

      // 3. Verificar si ya tiene el rol asignado
      const [rolExistente] = await connection.query<RowDataPacket[]>(
        'SELECT id_usuario_rol FROM usuario_rol WHERE id_usuario = ? AND id_rol = ?',
        [idUsuario, idRol]
      );

      if (rolExistente.length > 0) {
        return { success: false, message: 'El usuario ya tiene este rol asignado' };
      }

      // 4. Asignar rol
      await connection.query<ResultSetHeader>(
        'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
        [idUsuario, idRol]
      );

      return { success: true, message: 'Rol asignado correctamente' };

    } catch (error) {
      console.error('Error al asignar rol:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  async verificarRol(correo: string, nombreRol: string): Promise<boolean> {
    const connection = await pool.getConnection();

    try {
      const [resultado] = await connection.query<RowDataPacket[]>(
        `SELECT ur.id_usuario_rol 
         FROM usuario_rol ur
         INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
         INNER JOIN roles r ON ur.id_rol = r.id_rol
         WHERE u.correo = ? AND r.nombre = ?`,
        [correo, nombreRol]
      );

      return resultado.length > 0;
    } catch (error) {
      console.error('Error al verificar rol:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener todos los roles del sistema
   */
  async getRoles(): Promise<Rol[]> {
    const connection = await pool.getConnection();

    try {
      const [roles] = await connection.query<RowDataPacket[]>(
        'SELECT id_rol, nombre, descripcion FROM roles ORDER BY nombre'
      );

      return roles as Rol[];
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { RowDataPacket, ResultSetHeader } from 'mysql2';
// import pool from '../../config/database';
// import { LoginRequest, LoginResponse, Rol } from '../../shared/interfaces';

// export class LoginService {
//   private readonly JWT_SECRET = process.env.JWT_SECRET || 'banca_uno_secret_key_2025';
//   private readonly JWT_EXPIRES_IN = '8h';

//   /**
//    * Login de usuario con asignación automática de rol si no lo tiene
//    */
//   async login(loginData: LoginRequest): Promise<LoginResponse> {
//     const connection = await pool.getConnection();

//     try {
//       // 1. Buscar usuario por correo
//       const [usuarios] = await connection.query<RowDataPacket[]>(
//         'SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
//         [loginData.correo]
//       );

//       if (usuarios.length === 0) {
//         console.log(' Usuario no encontrado');
//         return {
//           success: false,
//           message: 'Credenciales inválidas'
//         };
//       }

//       const usuario = usuarios[0];
//       console.log(' Usuario encontrado:', usuario.nombre);

//       // 2. Verificar si el usuario está activo
//       if (!usuario.activo) {
//         console.log(' Usuario inactivo');
//         return {
//           success: false,
//           message: 'Usuario inactivo. Contacte al administrador'
//         };
//       }
//       // 3. Verificar contraseña
//       const passwordValida = await bcrypt.compare(loginData.contrasena, usuario.contrasena);

//       if (!passwordValida) {
//         console.log(' Contraseña incorrecta');
//         return {
//           success: false,
//           message: 'Credenciales inválidas'
//         };
//       }

//       console.log(' Contraseña correcta');

//       // 4. Verificar que el rol existe en el sistema
//       const [rolesExistentes] = await connection.query<RowDataPacket[]>(
//         'SELECT id_rol, nombre, descripcion FROM roles WHERE nombre = ?',
//         [loginData.rol]
//       );

//       if (rolesExistentes.length === 0) {
//         console.log(' Rol no existe:', loginData.rol);
//         return {
//           success: false,
//           message: `El rol ${loginData.rol} no existe en el sistema`
//         };
//       }

//       const rol = rolesExistentes[0];
//       console.log(' Rol encontrado:', rol.nombre);

//       // 5. Verificar si el usuario ya tiene el rol asignado
//       const [rolesUsuario] = await connection.query<RowDataPacket[]>(
//         `SELECT id_usuario_rol FROM usuario_rol 
//          WHERE id_usuario = ? AND id_rol = ?`,
//         [usuario.id_usuario, rol.id_rol]
//       );

//       let idUsuarioRol: number;

//       // 6. Si no tiene el rol, asignárselo automáticamente
//       if (rolesUsuario.length === 0) {
//         const [result] = await connection.query<ResultSetHeader>(
//           'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
//           [usuario.id_usuario, rol.id_rol]
//         );
//         idUsuarioRol = result.insertId;
//         console.log(` Rol ${loginData.rol} asignado automáticamente`);
//       } else {
//         idUsuarioRol = rolesUsuario[0].id_usuario_rol;
//         console.log(' Usuario ya tiene el rol asignado');
//       }

//       // 7. Generar token JWT
//       const token = jwt.sign(
//         {
//           id_usuario: usuario.id_usuario,
//           correo: usuario.correo,
//           nombre: usuario.nombre,
//           rol: rol.nombre,
//           id_usuario_rol: idUsuarioRol
//         },
//         this.JWT_SECRET,
//         { expiresIn: this.JWT_EXPIRES_IN }
//       );

//       // 8. Retornar respuesta exitosa
//       return {
//         success: true,
//         message: 'Inicio de sesión exitoso',
//         token,
//         user: {
//           id_usuario: usuario.id_usuario,
//           correo: usuario.correo,
//           nombre: usuario.nombre,
//           rol: rol.nombre,
//           id_usuario_rol: idUsuarioRol
//         }
//       };

//     } catch (error) {
//       console.error(' Error en login service:', error);
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }

//   /**
//    * Obtener roles disponibles para un usuario
//    */
//   async getRolesDisponibles(correo: string): Promise<Rol[]> {
//     const connection = await pool.getConnection();

//     try {
//       const [roles] = await connection.query<RowDataPacket[]>(
//         `SELECT r.id_rol, r.nombre, r.descripcion 
//          FROM usuario_rol ur
//          INNER JOIN roles r ON ur.id_rol = r.id_rol
//          INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
//          WHERE u.correo = ? AND u.activo = TRUE`,
//         [correo]
//       );

//       return roles as Rol[];
//     } catch (error) {
//       console.error('Error al obtener roles disponibles:', error);
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }

//   /**
//    * Asignar un rol a un usuario
//    */
//   async asignarRol(correo: string, nombreRol: string): Promise<{ success: boolean; message: string }> {
//     const connection = await pool.getConnection();

//     try {
//       // 1. Obtener id del usuario
//       const [usuarios] = await connection.query<RowDataPacket[]>(
//         'SELECT id_usuario FROM usuarios WHERE correo = ?',
//         [correo]
//       );

//       if (usuarios.length === 0) {
//         return { success: false, message: 'Usuario no encontrado' };
//       }

//       const idUsuario = usuarios[0].id_usuario;

//       // 2. Obtener id del rol
//       const [roles] = await connection.query<RowDataPacket[]>(
//         'SELECT id_rol FROM roles WHERE nombre = ?',
//         [nombreRol]
//       );

//       if (roles.length === 0) {
//         return { success: false, message: 'Rol no encontrado' };
//       }

//       const idRol = roles[0].id_rol;

//       // 3. Verificar si ya tiene el rol asignado
//       const [rolExistente] = await connection.query<RowDataPacket[]>(
//         'SELECT id_usuario_rol FROM usuario_rol WHERE id_usuario = ? AND id_rol = ?',
//         [idUsuario, idRol]
//       );

//       if (rolExistente.length > 0) {
//         return { success: false, message: 'El usuario ya tiene este rol asignado' };
//       }

//       // 4. Asignar rol
//       await connection.query<ResultSetHeader>(
//         'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
//         [idUsuario, idRol]
//       );

//       return { success: true, message: 'Rol asignado correctamente' };

//     } catch (error) {
//       console.error('Error al asignar rol:', error);
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }

//   /**
//    * Verificar si un usuario tiene un rol específico
//    */
//   async verificarRol(correo: string, nombreRol: string): Promise<boolean> {
//     const connection = await pool.getConnection();

//     try {
//       const [resultado] = await connection.query<RowDataPacket[]>(
//         `SELECT ur.id_usuario_rol 
//          FROM usuario_rol ur
//          INNER JOIN usuarios u ON ur.id_usuario = u.id_usuario
//          INNER JOIN roles r ON ur.id_rol = r.id_rol
//          WHERE u.correo = ? AND r.nombre = ?`,
//         [correo, nombreRol]
//       );

//       return resultado.length > 0;
//     } catch (error) {
//       console.error('Error al verificar rol:', error);
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }

//   /**
//    * Obtener todos los roles del sistema
//    */
//   async getRoles(): Promise<Rol[]> {
//     const connection = await pool.getConnection();

//     try {
//       const [roles] = await connection.query<RowDataPacket[]>(
//         'SELECT id_rol, nombre, descripcion FROM roles ORDER BY nombre'
//       );

//       return roles as Rol[];
//     } catch (error) {
//       console.error('Error al obtener roles:', error);
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }
// }