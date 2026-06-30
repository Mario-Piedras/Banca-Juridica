import { Request, Response } from 'express';
import { CrudController } from './crud.controller';

const crudController = new CrudController();
const TABLE_NAME = 'tipo_entidad';
const ID_FIELD = 'id_tipo_entidad';

export class TipoentidadController {
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
            const id_empresa = body.id_empresa;
            const data = {
                naturaleza: body.naturaleza,
                codigo_ciiu: body.codigo_ciiu,
                actividad_economia: body.actividad_economia,
                num_empleados: body.num_empleados,
                tipo_sociedad: body.tipo_sociedad,
                otra_sociedad: body.otra_sociedad,
                tipo_asociacion: body.tipo_asociacion,
                otra_asociacion: body.otra_asociacion,
                ent_estatal: body.ent_estatal,
                otra_ent_estatal: body.otra_ent_estatal,
                ent_estatal_descentralizada: body.ent_estatal_descentralizada
            };

            if (!data || Object.keys(data).length === 0) {
                return res.status(400).json({ mensaje: 'Los datos son obligatorios' });
            }

            // Guardar tipo entidad
            const nuevo = await crudController.crear(TABLE_NAME, data);
            // Actualizar FK en info_empresas
            await crudController.actualizar(
                'info_empresas',
                { id_info_empresas: id_empresa },
                { id_tipo_entidad: nuevo.id }
            );

            return res.status(201).json({
                mensaje: 'Tipo entidad guardado correctamente',
                data: nuevo
            });
        } catch (error: any) {
            console.error(error);
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