import { Request, Response } from 'express';
import { RegistrarClienteService } from '../services/registrarClienteService';
import { ClienteCompleto } from '../../../shared/interfaces'; // ← AGREGAR

const registrarClienteService = new RegistrarClienteService();

export class RegistrarClienteController {

  async registrar(req: Request, res: Response): Promise<Response> {
    try {
      const result = await registrarClienteService.registrarClienteCompleto(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message || 'Error interno del servidor' });
    }
  }

  async obtenerClientePorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const idCliente = parseInt(id);

      if (isNaN(idCliente)) {
        return res.status(400).json({ message: 'ID de cliente inválido' });
      }

      const cliente = await registrarClienteService.obtenerClienteCompletoPorId(idCliente);
      return res.json(cliente);
    } catch (error: any) {
      console.error('Error en obtenerClientePorId:', error);

      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async actualizarCliente(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const idCliente = parseInt(id);
      const datosActualizados = req.body;

      if (isNaN(idCliente)) {
        return res.status(400).json({ message: 'ID de cliente inválido' });
      }

      const result = await registrarClienteService.actualizarClienteCompleto(idCliente, datosActualizados);
      return res.json(result);
    } catch (error: any) {
      console.error('Error en actualizarCliente:', error);
      return res.status(500).json({ message: error.message || 'Error interno del servidor' });
    }
  }

}

