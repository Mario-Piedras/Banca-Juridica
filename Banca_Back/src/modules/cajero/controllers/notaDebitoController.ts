import { Request, Response } from 'express';
import { NotaDebitoService } from '../services/notaDebitoService';

const notaDebitoService = new NotaDebitoService();

export class NotaDebitoController {
  // ✅ CORREGIDO: Quitar Promise<void> o usar el tipo correcto
  async aplicarNotaDebito(req: Request, res: Response) {
    try {
      const datos = req.body;

      // Extraer TODOS los datos de auditoría del token JWT
      const user = (req as any).user;
      
      const datosConAuditoria = {
        ...datos,
        idUsuario: user?.id_usuario,     // ← id_usuario
        idCaja: user?.id_caja,           // ← id_caja  
        nombreCaja: user?.nombre_caja,   // ← nombre_caja
        cajero: user?.nombre || 'Cajero 01'
      };

      console.log(`Nota débito por usuario: ${user?.id_usuario}, caja: ${user?.nombre_caja}`);

      if (!datos.idCuenta || !datos.numeroDocumento || datos.valor === undefined) {
        // ✅ CORREGIDO: Usar return sin problema
        return res.status(400).json({
          error: 'Datos incompletos para aplicar la nota débito'
        });
      }

      // Pasar datosConAuditoria al servicio
      const resultado = await notaDebitoService.aplicarNotaDebito(datosConAuditoria);

      // ✅ CORREGIDO: Usar return sin problema
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en aplicarNotaDebito:', error);
      // ✅ CORREGIDO: Usar return sin problema
      return res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
// import { Request, Response } from 'express';
// import { NotaDebitoService } from '../services/notaDebitoService';

// const notaDebitoService = new NotaDebitoService();

// export class NotaDebitoController {
//   // Aplicar nota débito
//   async aplicarNotaDebito(req: Request, res: Response) {
//     try {
//       const datos = req.body;

//       // EXTRAER el nombre del cajero del token JWT
//       const user = (req as any).user;
//       const nombreCajero = user?.nombre || 'Cajero 01';

//       console.log(`Nota débito por cajero: ${nombreCajero}`);

//       if (!datos.idCuenta || !datos.numeroDocumento || datos.valor === undefined) {
//         return res.status(400).json({
//           error: 'Datos incompletos para aplicar la nota débito'
//         });
//       }

//       // Pasar nombreCajero al servicio
//       const resultado = await notaDebitoService.aplicarNotaDebito({
//         ...datos,
//         cajero: nombreCajero
//       });

//       if (resultado.exito) {
//         return res.json(resultado); //return agregado
//       } else {
//         return res.status(400).json(resultado); //return agregado
//       }
//     } catch (error) {
//       console.error('Error en aplicarNotaDebito:', error);
//       return res.status(500).json({ //return agregado
//         error: 'Error interno del servidor'
//       });
//     }
//   }
// }
