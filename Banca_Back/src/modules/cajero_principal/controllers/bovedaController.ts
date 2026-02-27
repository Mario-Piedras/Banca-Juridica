import { Request, Response } from 'express';
import { BovedaService } from '../services/bovedaService';

export class BovedaController {
  private bovedaService: BovedaService;

  constructor() {
    this.bovedaService = new BovedaService();
  }

  /**
   * GET /api/cajero-principal/boveda/saldo
   * Obtener saldo específico de bóveda
   */
  public obtenerSaldoBoveda = async (req: Request, res: Response): Promise<void> => {
    console.log('✅ EL CONTROLADOR SE ESTÁ EJECUTANDO');
    try {
      const saldoBoveda = await this.bovedaService.obtenerSaldoBoveda();
      
      res.json({
        success: true,
        saldo: saldoBoveda,
        message: 'Saldo de bóveda obtenido correctamente'
      });
    } catch (error) {
      console.error('Error en obtenerSaldoBoveda:', error);
      res.status(500).json({
        success: false,
        saldo: 0,
        message: 'Error al obtener el saldo de bóveda'
      });
    }
  };
}