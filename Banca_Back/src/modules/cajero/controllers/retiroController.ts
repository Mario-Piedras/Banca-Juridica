import { Request, Response } from 'express';
import { RetiroService } from '../services/retiroService';

const retiroService = new RetiroService();

export class RetiroController {
  async buscarCuenta(req: Request, res: Response) {
    try {
      const { numeroCuenta } = req.body;

      if (!numeroCuenta) {
        return res.status(400).json({
          error: 'El número de cuenta es requerido'
        });
      }

      const resultado = await retiroService.buscarCuenta(numeroCuenta);
      return res.json(resultado);
    } catch (error) {
      console.error('Error en buscarCuenta:', error);
      return res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  async procesarRetiro(req: Request, res: Response) {
    try {
      const datos = req.body;

      // ✅ CORREGIDO: Extraer TODOS los datos de auditoría del token JWT
      const user = (req as any).user;
      
      const datosConAuditoria = {
        ...datos,
        idUsuario: user?.id_usuario,     // ← NUEVO: id_usuario
        idCaja: user?.id_caja,           // ← NUEVO: id_caja  
        nombreCaja: user?.nombre_caja,   // ← NUEVO: nombre_caja
        cajero: user?.nombre || 'Cajero 01'
      };

      console.log(`Retiro por usuario: ${user?.id_usuario}, caja: ${user?.nombre_caja}`);

      if (!datos.idCuenta || !datos.numeroDocumento || datos.montoRetirar === undefined) {
        return res.status(400).json({
          error: 'Datos incompletos para procesar el retiro'
        });
      }

      // Pasar datosConAuditoria al servicio
      const resultado = await retiroService.procesarRetiro(datosConAuditoria);

      // ✅ Mismo patrón: siempre status 200 para lógica de negocio
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en procesarRetiro:', error);
      return res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
// import { Request, Response } from 'express';
// import { RetiroService } from '../services/retiroService';

// const retiroService = new RetiroService();

// export class RetiroController {
//   // Buscar cuenta por número
//   async buscarCuenta(req: Request, res: Response) {
//     try {
//       const { numeroCuenta } = req.body;

//       if (!numeroCuenta) {
//         return res.status(400).json({
//           error: 'El número de cuenta es requerido'
//         });
//       }

//       const resultado = await retiroService.buscarCuenta(numeroCuenta);
//       return res.json(resultado); //return agregado
//     } catch (error) {
//       console.error('Error en buscarCuenta:', error);
//       return res.status(500).json({ //return agregado
//         error: 'Error interno del servidor'
//       });
//     }
//   }

//   // Procesar retiro de dinero
//   async procesarRetiro(req: Request, res: Response) {
//     try {
//       const datos = req.body;

//       // EXTRAER el nombre del cajero del token JWT
//       const user = (req as any).user;
//       const nombreCajero = user?.nombre || 'Cajero 01';

//       console.log(`Retiro por cajero: ${nombreCajero}`);

//       if (!datos.idCuenta || !datos.numeroDocumento || datos.montoRetirar === undefined) {
//         return res.status(400).json({
//           error: 'Datos incompletos para procesar el retiro'
//         });
//       }

//       // Pasar nombreCajero al servicio
//       const resultado = await retiroService.procesarRetiro({
//         ...datos,
//         cajero: nombreCajero
//       });

//       if (resultado.exito) {
//         return res.json(resultado); //return agregado
//       } else {
//         return res.status(400).json(resultado); //return agregado
//       }
//     } catch (error) {
//       console.error('Error en procesarRetiro:', error);
//       return res.status(500).json({ //return agregado
//         error: 'Error interno del servidor'
//       });
//     }
//   }
// }
