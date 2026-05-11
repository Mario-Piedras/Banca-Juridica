import { Request, Response } from 'express';
import { CrudController } from './crudController';

const crudController = new CrudController();
const TABLE_NAME = 'info_financiera_emp';
const ID_FIELD = 'id_info_financiera';

export class InfofinancieraController {
    async obtenerTodos(req: Request, res: Response): Promise<Response> {
        try {
            const rows = await crudController.obtenerTodos(TABLE_NAME);
            return res.json(rows);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async obtenerUno(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ mensaje: 'El id es requerido' });
            }

            const row = await crudController.obtenerUno(TABLE_NAME, { [ID_FIELD]: id });
            if (!row) {
                return res.status(404).json({ mensaje: 'Registro no encontrado' });
            }

            return res.json(row);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async crear(req: Request, res: Response): Promise<Response> {
        try {

            const body = req.body;

            const data = {
                ingresos_op: body.ingresos_op,
                ingresos_no_op: body.ingresos_no_op,
                detalle_ingresos: body.detalle_ingresos,
                ventas_anuales: body.ventas_anuales,
                fecha_cierre_ventas: body.fecha_cierre_ventas,
                egresos_mensuales: body.egresos_mensuales,
                utilidad_neta: body.utilidad_neta,
                total_activos: body.total_activos,
                total_pasivos: body.total_pasivos,
                total_patrimonio: body.total_patrimonio
            };

            if (!data || Object.keys(data).length === 0) {
                return res.status(400).json({ mensaje: 'Los datos son obligatorios' });
            }

            const nuevo = await crudController.crear(TABLE_NAME, data);
            return res.status(201).json(nuevo);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async actualizar(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            const data = req.body;

            if (!id) {
                return res.status(400).json({ mensaje: 'El id es requerido' });
            }
            if (!data || Object.keys(data).length === 0) {
                return res.status(400).json({ mensaje: 'Los datos para actualizar son obligatorios' });
            }

            const actualizado = await crudController.actualizar(TABLE_NAME, { [ID_FIELD]: id }, data);
            return res.json(actualizado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    async eliminar(req: Request, res: Response): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ mensaje: 'El id es requerido' });
            }

            const resultado = await crudController.eliminar(TABLE_NAME, { [ID_FIELD]: id });
            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}
