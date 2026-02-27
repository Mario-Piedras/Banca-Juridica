import { Request, Response } from 'express';
import { AperturaService } from '../services/aperturaService';

const aperturaService = new AperturaService();

export class AperturaController {
  async verificarCliente(req: Request, res: Response) {
    try {
      const { tipoDocumento, numeroDocumento } = req.body;

      if (!tipoDocumento || !numeroDocumento) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Tipo y número de documento son requeridos'
        });
      }

      const resultado = await aperturaService.verificarCliente(tipoDocumento, numeroDocumento);
      return res.json(resultado);

    } catch (error) {
      console.error('Error en verificarCliente:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al verificar cliente'
      });
    }
  }

  async aperturarCuenta(req: Request, res: Response) {
    try {
      const datos = req.body;

      // ✅ EXTRAER el id_usuario del token JWT
      const user = (req as any).user;  // Viene del authMiddleware
      const idUsuario = user?.id_usuario;  // Debe ser un número
      const nombreCajero = user?.nombre || 'Cajero';  // Solo para logs

      if (!idUsuario) {
        return res.status(401).json({
          exito: false,
          mensaje: 'Usuario no autenticado correctamente'
        });
      }

      console.log(`✅ Apertura de cuenta por cajero: ${nombreCajero} (ID: ${idUsuario}), Caja: ${datos.idCaja}`);

      // Validaciones
      if (!datos.idSolicitud || !datos.tipoDeposito || datos.valorDeposito === undefined) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Datos incompletos para la apertura'
        });
      }

      if (datos.tipoDeposito === 'Cheque' && (!datos.codigoCheque || !datos.numeroCheque)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Código y número de cheque son requeridos para depósito con cheque'
        });
      }

      // ✅ Pasar id_usuario (número) al servicio
      const resultado = await aperturaService.aperturarCuenta(datos, idUsuario);
      return res.json(resultado);

    } catch (error) {
      console.error('Error en aperturarCuenta:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al aperturar cuenta'
      });
    }
  }
}