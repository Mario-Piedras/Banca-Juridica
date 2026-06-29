import { Request, Response } from 'express';
import { CrudController } from './crud.controller';

const crudController = new CrudController();
const TABLE_NAME = 'personas_asociadas';
const ID_FIELD = 'id_representante';

export class PersonasasoController {
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

            const {
                id_empresa,
                representantes
            } = req.body;

            // Validaciones
            if (!id_empresa) {

                return res.status(400).json({
                    mensaje: 'El id de la empresa es obligatorio'
                });

            }

            if (
                !Array.isArray(representantes) ||
                representantes.length === 0
            ) {

                return res.status(400).json({
                    mensaje: 'Debe enviar al menos un representante'
                });

            }

            const resultados = [];

            let idRepresentanteLegal = null;
            let idContactoEntidad = null;

            // INSERTAR REPRESENTANTES
            for (let i = 0; i < representantes.length; i++) {

                const body = representantes[i];

                const data = {
                    tipo_documento: body.tipo_documento,
                    num_documento: body.num_documento,
                    primer_nombre: body.primer_nombre,
                    segundo_nombre: body.segundo_nombre,
                    primer_apellido: body.primer_apellido,
                    segundo_apellido: body.segundo_apellido,
                    cargo: body.cargo,
                    dir_laboral: body.dir_laboral,
                    barrio: body.barrio,
                    ciudad_municipio: body.ciudad_municipio,
                    departamento: body.departamento,
                    pais: body.pais,
                    telefono: body.telefono,
                    ext: body.ext,
                    celular: body.celular,
                    correo: body.correo
                };

                const nuevo = await crudController.crear(TABLE_NAME, data);
                resultados.push(nuevo);

                // PRIMER REGISTRO = REPRESENTANTE LEGAL
                if (i === 0) {
                    idRepresentanteLegal = nuevo.id;
                }

                // SEGUNDO REGISTRO = CONTACTO ADICIONAL
                if (i === 1) {
                    idContactoEntidad = nuevo.id;
                }

            }

            // ACTUALIZAR EMPRESA
            await crudController.actualizar(
                'info_empresas',
                { id_info_empresas: id_empresa },
                {
                    id_info_repre_legal: idRepresentanteLegal,
                    id_cont_entidad: idContactoEntidad
                }
            );

            return res.status(201).json({
                mensaje: 'Representantes guardados correctamente',
                representante_legal: idRepresentanteLegal,
                contacto_adicional: idContactoEntidad
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
