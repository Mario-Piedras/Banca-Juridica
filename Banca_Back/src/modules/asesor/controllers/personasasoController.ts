import { Request, Response } from 'express';
import { CrudController } from './crudController';

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

        const body = req.body;

            const data = {
                tipo_documento: body.tipoDocumento,
                num_documento: body.numeroDoc,
                primer_nombre: body.primerNombre,
                segundo_nombre: body.segundoNombre,
                primer_apellido: body.primerApellido,
                segundo_apellido: body.segundoApellido,
                cargo: body.cargo,
                dir_laboral: body.direccionLaboral,
                barrio: body.barrio,
                ciudad_municipio: body.ciudadMunicipio,
                departamento: body.departamento,
                pais: body.pais,
                telefono: body.telefonoLaboral,
                ext: body.extension,
                celular: body.celular,
                correo: body.correoLaboral
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
