// src/modules/asesor/controllers/consultarController.ts
import { Request, Response } from 'express';
import { ClienteService } from '../services/consultarService';
import { RegistrarClienteService } from '../services/registrarClienteService'; // ← AGREGAR
import { ObtenerClienteResponse, ActualizarClienteResponse, ClienteCompleto } from '../../../shared/interfaces';

const clienteService = new ClienteService();
const registrarClienteService = new RegistrarClienteService(); // ← AGREGAR

export class ClienteController {
  async buscarCliente(req: Request, res: Response) {
    try {
      const { numeroDocumento } = req.params;

      // 🧱 Validación del parámetro
      if (!numeroDocumento) {
        return res.status(400).json({
          mensaje: 'El número de documento es requerido',
          existe: false
        });
      }

      // 🔍 Buscar cliente en la base de datos
      const resultado = await clienteService.buscarPorDocumento(numeroDocumento);

      // 📭 Si no se encontró
      if (!resultado.existe) {
        return res.status(404).json({
          mensaje: 'Cliente no encontrado',
          existe: false
        });
      }

      // ✅ Si se encontró, devolver la info
      return res.json({
        mensaje: 'Cliente encontrado correctamente',
        existe: true,
        cliente: resultado.cliente
      });

    } catch (error) {
      console.error('Error en ClienteController.buscarCliente:', error);
      return res.status(500).json({
        mensaje: 'Error interno del servidor',
        existe: false
      });
    }
  }

  async obtenerClientePorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const idCliente = parseInt(id);

      if (isNaN(idCliente)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de cliente inválido' 
        } as ObtenerClienteResponse);
      }

      const cliente = await registrarClienteService.obtenerClienteCompletoPorId(idCliente);
      
      return res.json({ // ← AGREGAR 'return'
        success: true,
        data: cliente
      } as ObtenerClienteResponse);
      
    } catch (error: any) {
      console.error('Error en obtenerClientePorId:', error);
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ 
          success: false, 
          message: error.message 
        } as ObtenerClienteResponse);
      }
      return res.status(500).json({ // ← AGREGAR 'return'
        success: false, 
        message: 'Error interno del servidor' 
      } as ObtenerClienteResponse);
    }
  }

  async actualizarCliente(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const idCliente = parseInt(id);
      const datosActualizados: ClienteCompleto = req.body;

      if (isNaN(idCliente)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de cliente inválido' 
        } as ActualizarClienteResponse);
      }

      const result = await registrarClienteService.actualizarClienteCompleto(idCliente, datosActualizados);
      
      return res.json({ // ← AGREGAR 'return'
        success: true,
        message: result.message,
        idCliente: result.idCliente
      } as ActualizarClienteResponse);
      
    } catch (error: any) {
      console.error('Error en actualizarCliente:', error);
      return res.status(500).json({ // ← AGREGAR 'return'
        success: false, 
        message: error.message || 'Error interno del servidor' 
      } as ActualizarClienteResponse);
    }
  }
}
