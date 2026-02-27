import { Request, Response } from 'express';
import { OficinaService } from '../services/oficinaService';

export class OficinaController {
  private oficinaService: OficinaService;

  constructor() {
    this.oficinaService = new OficinaService();
  }

  /**
   * GET /api/cajero-principal/oficina/saldo
   * Obtener saldo de oficina con desglose
   */
  public obtenerSaldoOficina = async (req: Request, res: Response): Promise<void> => {
    try {
      const saldoOficina = await this.oficinaService.obtenerSaldoOficina();
      
      res.json({
        success: true,
        saldoOficina: saldoOficina.saldoOficina,
        saldoBoveda: saldoOficina.saldoBoveda,
        saldoVentanillas: saldoOficina.saldoVentanillas,
        message: 'Saldo de oficina obtenido correctamente'
      });
    } catch (error) {
      console.error('Error en obtenerSaldoOficina:', error);
      res.status(500).json({
        success: false,
        saldoOficina: 0,
        saldoBoveda: 0,
        saldoVentanillas: 0,
        message: 'Error al obtener el saldo de oficina'
      });
    }
  };
}