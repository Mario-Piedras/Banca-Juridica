import { Request, Response } from 'express';
import saldoCajeroService from '../services/saldoCajeroService';

export class SaldoCajeroController {
  
  async obtenerSaldos(req: Request, res: Response): Promise<void> {
    try {
      const { id_usuario } = req.query;

      if (!id_usuario) {
        res.status(400).json({
          exito: false,
          mensaje: 'El parámetro id_usuario es requerido'
        });
        return;
      }

      const idUsuario = parseInt(id_usuario as string);
      
      if (isNaN(idUsuario)) {
        res.status(400).json({
          exito: false,
          mensaje: 'El id_usuario debe ser un número válido'
        });
        return;
      }

      const saldos = await saldoCajeroService.obtenerSaldosCajero(idUsuario);
      
      res.status(200).json({
        exito: true,
        saldos: {
          saldoEfectivo: saldos.saldoEfectivo,
          saldoCheques: saldos.saldoCheques,
          total: saldos.saldoEfectivo + saldos.saldoCheques
        }
      });
    } catch (error) {
      console.error('Error en obtenerSaldos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener los saldos del cajero'
      });
    }
  }
}
// import { Request, Response } from 'express';
// import saldoCajeroService from '../services/saldoCajeroService';

// export class SaldoCajeroController {
  
//   async obtenerSaldos(req: Request, res: Response): Promise<void> {
//     try {
//       const { id_usuario } = req.query;

//       if (!id_usuario) {
//         res.status(400).json({
//           exito: false,
//           mensaje: 'El parámetro cajero es requerido'
//         });
//         return;
//       }

//       // Convertir a número
//       const idUsuario = parseInt(id_usuario as string);
      
//       if (isNaN(idUsuario)) {
//         res.status(400).json({
//           exito: false,
//           mensaje: 'El id_usuario debe ser un número válido'
//         });
//         return;
//       }

//       const saldos = await saldoCajeroService.obtenerSaldosCajero(idUsuario);
      
//       res.status(200).json({
//         exito: true,
//         saldos: {
//           saldoEfectivo: saldos.saldoEfectivo,
//           saldoCheques: saldos.saldoCheques,
//           total: saldos.saldoEfectivo + saldos.saldoCheques
//         }
//       });
//     } catch (error) {
//       console.error('Error en obtenerSaldos:', error);
//       res.status(500).json({
//         exito: false,
//         mensaje: 'Error al obtener los saldos del cajero'
//       });
//     }
//   }
// }
