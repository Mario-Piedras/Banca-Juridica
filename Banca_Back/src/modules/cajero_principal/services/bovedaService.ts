import { RowDataPacket } from 'mysql2';
import pool from '../../../config/database';

export class BovedaService {
  
  /**
   * Obtener saldo de bóveda específico
   */
  // async obtenerSaldoBoveda(): Promise<number> {
  //   const connection = await pool.getConnection();
    
  //   try {
  //     const [rows] = await connection.query<RowDataPacket[]>(
  //       'SELECT saldo_efectivo FROM boveda ORDER BY id_boveda DESC LIMIT 1'
  //     );
      
  //     return rows[0]?.saldo_efectivo || 0;

  //   } catch (error) {
  //     console.error('Error en obtenerSaldoBoveda:', error);
  //     throw error;
  //   } finally {
  //     connection.release();
  //   }
  // }
  async obtenerSaldoBoveda(): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT saldo_efectivo FROM boveda ORDER BY id_boveda DESC LIMIT 1'
      );
      
      if (rows.length === 0) {
        console.warn('No se encontraron registros en la bóveda');
        return 0;
      }
      
      const saldo = rows[0]?.saldo_efectivo || 0;
      console.log('Saldo obtenido de la base de datos:', saldo);
      
      return saldo;

    } catch (error) {
      console.error('Error en obtenerSaldoBoveda:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Actualizar saldo de bóveda
   */
  async actualizarSaldoBoveda(nuevoSaldo: number, idUsuario?: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'INSERT INTO boveda (saldo_efectivo, id_usuario_responsable) VALUES (?, ?)',
        [nuevoSaldo, idUsuario]
      );
      
      return true;

    } catch (error) {
      console.error('Error en actualizarSaldoBoveda:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}