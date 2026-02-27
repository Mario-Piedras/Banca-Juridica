import { RowDataPacket } from 'mysql2';
import pool from '../../../config/database';

export class SaldosService {
  
  /**
   * Obtener saldos de todas las CAJAS
   */
  async obtenerSaldosCajeros(): Promise<{
    saldoBoveda: number;
    saldoOficina: number;
    cajeros: any[];
  }> {
    const connection = await pool.getConnection();
    
    try {
      // 1. Obtener saldo de bóveda
      const [bovedaRows] = await connection.query<RowDataPacket[]>(
        'SELECT saldo_efectivo FROM boveda ORDER BY id_boveda DESC LIMIT 1'
      );
      const saldoBoveda = bovedaRows[0]?.saldo_efectivo || 0;

      // 2. Obtener saldo de oficina
      const [oficinaRows] = await connection.query<RowDataPacket[]>(
        'SELECT saldo_efectivo FROM oficina ORDER BY id_oficina DESC LIMIT 1'
      );
      const saldoOficina = oficinaRows[0]?.saldo_efectivo || 0;

      // 3. Obtener CAJAS con sus saldos y transacciones
      const [cajasRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          c.id_caja,
          c.nombre_caja,
          u.nombre as nombreCajero,
          COALESCE(sc.saldo_efectivo, 0) as saldoEfectivo,
          COUNT(DISTINCT t.id_transaccion) as transaccionesHoy,
          COALESCE(SUM(CASE WHEN t.tipo_transaccion = 'Depósito' THEN t.monto ELSE 0 END), 0) as dineroDepositado,
          COALESCE(SUM(CASE WHEN t.tipo_transaccion = 'Retiro' THEN t.monto ELSE 0 END), 0) as dineroRetirado,
          (SELECT COUNT(*) FROM cuentas_ahorro ca 
           WHERE DATE(ca.fecha_apertura) = CURDATE() AND ca.id_solicitud IN (
             SELECT id_solicitud 
             FROM solicitudes_apertura 
             WHERE id_usuario_rol = (
               SELECT ur.id_usuario_rol 
               FROM usuario_rol ur 
               WHERE ur.id_usuario = u.id_usuario 
                 AND ur.id_rol = (SELECT id_rol FROM roles WHERE nombre = 'Cajero')
               LIMIT 1
             )
           )) as cuentasAperturadas,
          CASE 
            WHEN c.estado = 'OCUPADA' THEN 'Activo'
            ELSE 'Inactivo'
          END as estado
         FROM cajas c
         LEFT JOIN usuarios u ON c.usuario_asignado = u.id_usuario
         LEFT JOIN saldos_cajero sc ON sc.id_usuario = u.id_usuario
         LEFT JOIN transacciones t ON c.id_caja = t.id_caja AND DATE(t.fecha_transaccion) = CURDATE()
         WHERE c.nombre_caja != 'Caja Principal'  -- Excluir caja principal del listado
          GROUP BY c.id_caja, c.nombre_caja, u.nombre, sc.saldo_efectivo, c.estado
         ORDER BY c.nombre_caja`
      );

      return {
        saldoBoveda,
        saldoOficina,
        cajeros: cajasRows
      };

    } catch (error) {
      console.error('Error en obtenerSaldosCajeros:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener movimientos de una caja específica
   */
  async obtenerMovimientosCaja(idCaja: number, fecha?: string): Promise<any[]> {
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          t.id_transaccion,
          t.tipo_transaccion,
          t.monto,
          t.saldo_anterior,
          t.saldo_nuevo,
          t.fecha_transaccion,
          ca.numero_cuenta,
          c.primer_nombre,
          c.primer_apellido
        FROM transacciones t
        LEFT JOIN cuentas_ahorro ca ON t.id_cuenta = ca.id_cuenta
        LEFT JOIN clientes c ON ca.id_cliente = c.id_cliente
        WHERE t.id_caja = ?
      `;
      
      const params: any[] = [idCaja];
      
      if (fecha) {
        query += ' AND DATE(t.fecha_transaccion) = ?';
        params.push(fecha);
      } else {
        query += ' AND DATE(t.fecha_transaccion) = CURDATE()';
      }
      
      query += ' ORDER BY t.fecha_transaccion DESC';
      
      const [movimientos] = await connection.query<RowDataPacket[]>(query, params);
      return movimientos;

    } catch (error) {
      console.error('Error en obtenerMovimientosCaja:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener resumen general del día
   */
  async obtenerResumenDia(): Promise<{
    totalDepositos: number;
    totalRetiros: number;
    totalTransacciones: number;
    cuentasAperturadas: number;
    saldoTotalCajas: number;
  }> {
    const connection = await pool.getConnection();
    
    try {
      // Total depósitos y retiros del día
      const [transacciones] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as totalTransacciones,
          COALESCE(SUM(CASE WHEN tipo_transaccion = 'Depósito' THEN monto ELSE 0 END), 0) as totalDepositos,
          COALESCE(SUM(CASE WHEN tipo_transaccion = 'Retiro' THEN monto ELSE 0 END), 0) as totalRetiros
        FROM transacciones 
        WHERE DATE(fecha_transaccion) = CURDATE()
      `);

      // Cuentas aperturadas hoy
      const [cuentas] = await connection.query<RowDataPacket[]>(`
        SELECT COUNT(*) as total 
        FROM cuentas_ahorro 
        WHERE DATE(fecha_apertura) = CURDATE()
      `);

      // Saldo total de todas las cajas
      const [saldos] = await connection.query<RowDataPacket[]>(`
        SELECT COALESCE(SUM(saldo_efectivo), 0) as saldoTotal 
        FROM saldos_cajero
      `);

      return {
        totalDepositos: transacciones[0]?.totalDepositos || 0,
        totalRetiros: transacciones[0]?.totalRetiros || 0,
        totalTransacciones: transacciones[0]?.totalTransacciones || 0,
        cuentasAperturadas: cuentas[0]?.total || 0,
        saldoTotalCajas: saldos[0]?.saldoTotal || 0
      };

    } catch (error) {
      console.error('Error en obtenerResumenDia:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}