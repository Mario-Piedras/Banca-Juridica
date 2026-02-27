import pool from '../../../config/database';

class SaldoCajeroService {
  
  // Obtener saldos de un cajero específico
  async obtenerSaldosCajero(id_usuario: number): Promise<{ saldoEfectivo: number; saldoCheques: number }> {
    const connection = await pool.getConnection();
    
    try {
      const [saldos]: any = await connection.query(
        'SELECT saldo_efectivo, saldo_cheques FROM saldos_cajero WHERE id_usuario = ?', // CAMBIAR cajero por id_usuario
        [id_usuario] // CAMBIAR cajero por id_usuario
      );

      if (saldos.length === 0) {
        // Si el cajero no existe, crearlo con saldo 0
        await connection.query(
          'INSERT INTO saldos_cajero (id_usuario, saldo_efectivo, saldo_cheques) VALUES (?, 0.00, 0.00)', // CAMBIAR cajero por id_usuario
          [id_usuario] // CAMBIAR cajero por id_usuario
        );
        return { saldoEfectivo: 0, saldoCheques: 0 };
      }

      return {
        saldoEfectivo: parseFloat(saldos[0].saldo_efectivo),
        saldoCheques: parseFloat(saldos[0].saldo_cheques)
      };
    } catch (error) {
      console.error('Error al obtener saldos del cajero:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Actualizar saldo en efectivo de un cajero específico
  async actualizarSaldoEfectivo(monto: number, operacion: 'sumar' | 'restar', id_usuario: number): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      // Verificar que el cajero existe
      const [existe]: any = await connection.query(
        'SELECT id_saldo FROM saldos_cajero WHERE id_usuario = ?', // CAMBIAR cajero por id_usuario
        [id_usuario] // CAMBIAR cajero por id_usuario
      );

      if (existe.length === 0) {
        // Crear el cajero si no existe
        await connection.query(
          'INSERT INTO saldos_cajero (id_usuario, saldo_efectivo, saldo_cheques) VALUES (?, 0.00, 0.00)', // CAMBIAR cajero por id_usuario
          [id_usuario] // CAMBIAR cajero por id_usuario
        );
      }

      const operador = operacion === 'sumar' ? '+' : '-';
      await connection.query(
        `UPDATE saldos_cajero SET saldo_efectivo = saldo_efectivo ${operador} ? WHERE id_usuario = ?`, // CAMBIAR cajero por id_usuario
        [monto, id_usuario] // CAMBIAR cajero por id_usuario
      );
    } catch (error) {
      console.error('Error al actualizar saldo efectivo:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Actualizar saldo de cheques de un cajero específico
  async actualizarSaldoCheques(monto: number, operacion: 'sumar' | 'restar', id_usuario: number): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      // Verificar que el cajero existe
      const [existe]: any = await connection.query(
        'SELECT id_saldo FROM saldos_cajero WHERE id_usuario = ?', // CAMBIAR cajero por id_usuario
        [id_usuario] // CAMBIAR cajero por id_usuario
      );

      if (existe.length === 0) {
        // Crear el cajero si no existe
        await connection.query(
          'INSERT INTO saldos_cajero (id_usuario, saldo_efectivo, saldo_cheques) VALUES (?, 0.00, 0.00)', // CAMBIAR cajero por id_usuario
          [id_usuario] // CAMBIAR cajero por id_usuario
        );
      }

      const operador = operacion === 'sumar' ? '+' : '-';
      await connection.query(
        `UPDATE saldos_cajero SET saldo_cheques = saldo_cheques ${operador} ? WHERE id_usuario = ?`, // CAMBIAR cajero por id_usuario
        [monto, id_usuario] // CAMBIAR cajero por id_usuario
      );
    } catch (error) {
      console.error('Error al actualizar saldo cheques:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new SaldoCajeroService();
