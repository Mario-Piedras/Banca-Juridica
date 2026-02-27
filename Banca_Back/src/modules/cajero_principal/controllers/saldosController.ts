import { Request, Response } from 'express';
import { SaldosService } from '../services/saldoService';

export class SaldosController {
  private saldosService: SaldosService;

  constructor() {
    this.saldosService = new SaldosService();
  }

  /**
   * GET /api/saldos/cajeros
   * Obtener saldos de bóveda, oficina y todas las CAJAS
   */
  public obtenerSaldosCajeros = async (req: Request, res: Response): Promise<void> => {
    try {
      const saldos = await this.saldosService.obtenerSaldosCajeros();
      
      res.json({
        success: true,
        saldoBoveda: saldos.saldoBoveda,
        saldoOficina: saldos.saldoOficina,
        cajeros: saldos.cajeros,
        message: 'Saldos obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error en obtenerSaldosCajeros:', error);
      res.status(500).json({
        success: false,
        saldoBoveda: 0,
        saldoOficina: 0,
        cajeros: [],
        message: 'Error al obtener los saldos'
      });
    }
  };

  /**
   * GET /api/saldos/caja/:id/movimientos
   * Obtener movimientos de una caja específica
   */
  public obtenerMovimientosCaja = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { fecha } = req.query;
      
      const movimientos = await this.saldosService.obtenerMovimientosCaja(parseInt(id), fecha as string);
      
      res.json({
        success: true,
        movimientos: movimientos,
        message: 'Movimientos obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error en obtenerMovimientosCaja:', error);
      res.status(500).json({
        success: false,
        movimientos: [],
        message: 'Error al obtener los movimientos'
      });
    }
  };

  /**
   * GET /api/saldos/resumen-dia
   * Obtener resumen general del día
   */
  public obtenerResumenDia = async (req: Request, res: Response): Promise<void> => {
    try {
      const resumen = await this.saldosService.obtenerResumenDia();
      
      res.json({
        success: true,
        resumen: resumen,
        message: 'Resumen del día obtenido correctamente'
      });
    } catch (error) {
      console.error('Error en obtenerResumenDia:', error);
      res.status(500).json({
        success: false,
        resumen: {
          totalDepositos: 0,
          totalRetiros: 0,
          totalTransacciones: 0,
          cuentasAperturadas: 0,
          saldoTotalCajas: 0
        },
        message: 'Error al obtener el resumen del día'
      });
    }
  };
}