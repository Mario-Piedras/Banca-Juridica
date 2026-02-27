import { Request, Response } from 'express';
import { ConsignacionService } from '../services/consignacionService';

const consignacionService = new ConsignacionService();

export class ConsignacionController {
  async procesarConsignacion(req: Request, res: Response): Promise<void> {
    try {
      const datos = req.body;

      // EXTRAER el nombre del cajero del token JWT
      const user = (req as any).user;
      const nombreCajero = user?.nombre || 'Cajero 01';

      console.log(`Consignación por cajero: ${nombreCajero}, Caja: ${datos.idCaja}`);

      // Pasar nombreCajero al servicio
      const resultado = await consignacionService.procesarConsignacion({
        ...datos,
        cajero: nombreCajero
      });

      if (resultado.exito) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en procesarConsignacion:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al procesar la consignación'
      });
    }
  }
}
