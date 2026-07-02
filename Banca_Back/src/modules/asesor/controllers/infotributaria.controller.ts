import { Request, Response } from 'express';
import { CrudController } from './crud.controller';

const crudController = new CrudController();
const TABLE_NAME = 'info_tributaria';
const ID_FIELD = 'id_info_tributaria';

export class InfotributariaController {
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
            console.log('ID EMPRESA:', id_empresa);

            const data = {
                tipo_contribuyente: body.tipo_contribuyente,
                clase_contribuyente: body.clase_contribuyente,
                responsable_iva: body.responsable_iva,
                autorretenedor: body.autorretenedor,
                intermediario_mercado: body.intermediario_mercado,
                vigilado_superintendencia: body.vigilado_superintendencia,
                tributa_exterior: body.tributa_exterior
            };

            if (!data || Object.keys(data).length === 0) {
                return res.status(400).json({ mensaje: 'Los datos son obligatorios' });
            }

            // Guardar info tributaria
            const nuevo = await crudController.crear(TABLE_NAME, data);

            // Actualizar FK
            await crudController.actualizar(
                'info_empresas',
                {
                    id_info_empresas: id_empresa
                },
                {
                    id_info_tributaria: nuevo.id
                }
            );
            return res.status(201).json({
                mensaje:
                    'Información tributaria guardada',
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
