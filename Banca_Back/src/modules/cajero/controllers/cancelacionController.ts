import { Request, Response } from 'express';
import { CancelacionService } from '../services/cancelacionService';

const cancelacionService = new CancelacionService();

export class CancelacionController {
  async cancelarCuenta(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await cancelacionService.cancelarCuenta(req.body);
      
      // ✅ CAMBIO: SIEMPRE status 200 para lógica de negocio (éxito o advertencia)
      // El frontend usa 'exito' para decidir. Solo 500 para errores reales.
      res.status(200).json(resultado);
      
    } catch (error) {
      console.error('Error en cancelarCuenta:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al cancelar la cuenta'
      });
    }
  }
}
