// src/modules/asesor/controllers/consultarController.ts
import { Request, Response } from 'express';
import { ClienteService } from '../services/consultarService';
import { RegistrarClienteService } from '../services/registrarClienteService'; // ← AGREGAR
import { ObtenerClienteResponse, ActualizarClienteResponse, ClienteCompleto } from '../../../shared/interfaces';
import pool from '../../../config/database';

const clienteService = new ClienteService();
const registrarClienteService = new RegistrarClienteService(); // ← AGREGAR

function safeDateToISO(date: any): string {
  try {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function toBoolEsSi(value: any): boolean {
  return value === 'Sí' || value === 'SI' || value === 'si' || value === true;
}

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

  async buscarEmpresa(req: Request, res: Response) {
    try {
      const { nit } = req.params;

      if (!nit) {
        return res.status(400).json({
          mensaje: 'El NIT es requerido',
          existe: false
        });
      }

      const resultado = await clienteService.buscarPorNit(nit);

      if (!resultado.existe) {
        return res.status(404).json({
          mensaje: 'Empresa no encontrada',
          existe: false
        });
      }

      return res.json({
        mensaje: 'Empresa encontrada correctamente',
        existe: true,
        empresa: resultado.empresa
      });

    } catch (error) {
      console.error('Error en ClienteController.buscarEmpresa:', error);

      return res.status(500).json({
        mensaje: 'Error interno del servidor',
        existe: false
      });
    }
  }

  async obtenerEmpresaPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const idEmpresa = parseInt(id);
      if (isNaN(idEmpresa)) {
        return res.status(400).json({ success: false, message: 'ID de empresa inválido' });
      }

      // 1) info_empresas + naturaleza
      const empresaRowQuery = `
  SELECT 
    ie.*,

    te.naturaleza,
    te.codigo_ciiu,
    te.actividad_economia,
    te.num_empleados,
    te.tipo_sociedad,
    te.otra_sociedad,
    te.tipo_asociacion,
    te.otra_asociacion,
    te.ent_estatal,
    te.otra_ent_estatal,
    te.ent_estatal_descentralizada

  FROM info_empresas ie

  LEFT JOIN tipo_entidad te
    ON ie.id_tipo_entidad = te.id_tipo_entidad

  WHERE ie.id_info_empresas = ?
  LIMIT 1
`;
      const [empresaRows]: any = await pool.query(empresaRowQuery, [idEmpresa]);
      if (!empresaRows || empresaRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
      }
      const empresa = empresaRows[0];

      // 2) Representante Legal y Contacto Entidad

      let representanteLegalData = null;
      let contactoEntidadData = null;

      if (empresa.id_info_repre_legal) {
        const [repRows]: any = await pool.query(
          `
    SELECT *
    FROM personas_asociadas
    WHERE id_representante = ?
    LIMIT 1
    `,
          [empresa.id_info_repre_legal]
        );

        representanteLegalData = repRows?.[0] || null;
      }

      if (empresa.id_cont_entidad) {
        const [contactoRows]: any = await pool.query(
          `
    SELECT *
    FROM personas_asociadas
    WHERE id_representante = ?
    LIMIT 1
    `,
          [empresa.id_cont_entidad]
        );

        contactoEntidadData = contactoRows?.[0] || null;
      }

      // 3) info_financiera_emp + info_tributaria + pais_tributar
      const idsQuery = `
        SELECT
          ife.id_info_financiera,
          itb.id_info_tributaria
        FROM info_empresas ie
        LEFT JOIN info_financiera_emp ife ON ife.id_info_financiera = ie.id_info_financiera
        LEFT JOIN info_tributaria itb ON itb.id_info_tributaria = ie.id_info_tributaria
        WHERE ie.id_info_empresas = ?
        LIMIT 1
      `;

      const [idsRows]: any = await pool.query(idsQuery, [idEmpresa]);
      const idInfoFinanciera = idsRows?.[0]?.id_info_financiera ?? null;
      const idInfoTributaria = idsRows?.[0]?.id_info_tributaria ?? null;

      // info_financiera_emp
      let infoFinancieraEmp: any = undefined;
      if (idInfoFinanciera) {
        const [rowsFin]: any = await pool.query(
          `SELECT * FROM info_financiera_emp WHERE id_info_financiera = ? LIMIT 1`,
          [idInfoFinanciera]
        );
        if (rowsFin?.[0]) {
          const r = rowsFin[0];
          infoFinancieraEmp = {
            ingresos_op: Number(r.ingresos_op),
            ingresos_no_op: Number(r.ingresos_no_op),
            detalle_ingresos: r.detalle_ingresos,
            ventas_anuales: Number(r.ventas_anuales),
            fecha_cierre_ventas: safeDateToISO(r.fecha_cierre_ventas),
            egresos_mensuales: Number(r.egresos_mensuales),
            utilidad_neta: Number(r.utilidad_neta),
            total_activos: Number(r.total_activos),
            total_pasivos: Number(r.total_pasivos),
            total_patrimonio: Number(r.total_patrimonio)
          };
        }
      }

      // info_tributaria
      let infoTributaria: any = undefined;
      let paisesTributarios: any[] = [];
      if (idInfoTributaria) {
        const [rowsTrib]: any = await pool.query(
          `SELECT * FROM info_tributaria WHERE id_info_tributaria = ? LIMIT 1`,
          [idInfoTributaria]
        );
        if (rowsTrib?.[0]) {
          const r = rowsTrib[0];
          infoTributaria = {
            tipo_contribuyente: r.tipo_contribuyente,
            clase_contribuyente: r.clase_contribuyente,
            responsable_iva: r.responsable_iva,
            autorretenedor: r.autorretenedor,
            intermediario_mercado: r.intermediario_mercado,
            vigilado_superintendencia: r.vigilado_superintendencia,
            tributa_exterior: r.tributa_exterior
          };
        }

        const [rowsPaises]: any = await pool.query(
          `SELECT pais, tin FROM pais_tributar WHERE id_info_tributaria = ?`,
          [idInfoTributaria]
        );
        paisesTributarios = (rowsPaises || []).map((p: any) => ({
          pais: p.pais,
          tin: p.tin
        }));
      }

      const infoFinancieraTributaria = {
        ...(infoFinancieraEmp || {}),
        ...(infoTributaria || {})
      };

      // 4) declaracion_bienes + info_socios
      // declaracion_bienes
      let declaracion: any = undefined;
      let infoSocios: any = undefined;

      // Obtener IDs por FK desde info_empresas
      const [declarIdsRows]: any = await pool.query(
        `
          SELECT
            ie.id_declaracion,
            ie.id_info_socios
          FROM info_empresas ie
          WHERE ie.id_info_empresas = ?
          LIMIT 1
        `,
        [idEmpresa]
      );
      const idDeclaracion = declarIdsRows?.[0]?.id_declaracion ?? null;
      const idInfoSocios = declarIdsRows?.[0]?.id_info_socios ?? null;

      if (idDeclaracion) {
        const [rowsDecl]: any = await pool.query(
          `SELECT * FROM declaracion_bienes WHERE id_declaracion = ? LIMIT 1`,
          [idDeclaracion]
        );
        if (rowsDecl?.[0]) {
          const r = rowsDecl[0];
          declaracion = {
            origen_bienes: r.origen_bienes,
            otro_origen_bienes: r.otro_origen_bienes,
            fuente_recursos: r.fuente_recursos,
            otra_fuente_recursos: r.otra_fuente_recursos,
            pais_origen_bienes: r.pais_origen_bienes,
            ciudad_origen_bienes: r.ciudad_origen_bienes,
            recursos_inembargables: r.recursos_inembargables,
            op_moneda_extj: r.op_moneda_extj
          };
        }
      }

      if (idInfoSocios) {
        const [rowsSoc]: any = await pool.query(
          `SELECT * FROM info_socios WHERE id_info_socios = ? LIMIT 1`,
          [idInfoSocios]
        );
        if (rowsSoc?.[0]) {
          const r = rowsSoc[0];
          infoSocios = {
            rnve: r.rnve,
            hay_socios_accionistas: r.hay_socios_accionistas,
            personas_control: r.personas_control,
            personas_expuestas: r.personas_expuestas,
            bolsa_valores: r.bolsa_valores
          };
        }
      }

      // 5) ensamblar para front
      const datosIniciales = {
        infoGeneral: {
          ...empresa,
          fecha_constitución: safeDateToISO(empresa.fecha_constitución),
          naturalezaEntidad: empresa.naturaleza,
          naturaleza: empresa.naturaleza
        },
        representanteLegal: {
          representantes: [
            ...(representanteLegalData ? [representanteLegalData] : []),
            ...(contactoEntidadData ? [contactoEntidadData] : [])
          ],
          contacto_adicional: contactoEntidadData ? 'Sí' : 'No'
        },
        naturalezaEntidad: {
          naturaleza: empresa.naturaleza,
          codigo_ciiu: empresa.codigo_ciiu,
          actividad_economia: empresa.actividad_economia,
          num_empleados: empresa.num_empleados,
          tipo_sociedad: empresa.tipo_sociedad,
          otra_sociedad: empresa.otra_sociedad,
          tipo_asociacion: empresa.tipo_asociacion,
          otra_asociacion: empresa.otra_asociacion,
          ent_estatal: empresa.ent_estatal,
          otra_ent_estatal: empresa.otra_ent_estatal,
          ent_estatal_descentralizada:
            empresa.ent_estatal_descentralizada
        },
        infoFinancieraTributaria: {
          ...infoFinancieraTributaria,
          // el componente guarda países en localStorage al vuelo;
          // aquí solo retornamos un campo auxiliar para que el padre pueda setearlo si lo ajustas luego.
          paisesTributarios
        },
        declaracionBienesInfoSocios: {
          ...(declaracion || {}),
          ...(infoSocios || {})
        }
      };

      return res.json({ success: true, data: datosIniciales });
    } catch (error: any) {
      console.error('Error en obtenerEmpresaPorId (id=' + req.params?.id + '):', error);
      return res.status(500).json({ success: false, message: error?.message || error });
    }
  }

  async actualizarEmpresa(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const idEmpresa = parseInt(id);
      if (isNaN(idEmpresa)) {
        return res.status(400).json({ success: false, message: 'ID de empresa inválido' });
      }

      const payload = req.body;

      await pool.beginTransaction();
      try {
        // 1) info_empresas: actualizar columnas principales que use el formulario
        const infoGeneral = payload?.infoGeneral || {};

        await pool.query(
          `UPDATE info_empresas SET
            nit = ?,
            razon_social = ?,
            nombre_corto = ?,
            fecha_constitución = ?,
            ciudad_constitución = ?,
            pais_constitucion = ?,
            dir_sede_principal = ?,
            barrio = ?,
            ciudad_municipio = ?,
            departamento = ?,
            pais = ?,
            telefono = ?,
            ext = ?,
            correo = ?
          WHERE id_info_empresas = ?`,
          [
            infoGeneral.nit,
            infoGeneral.razon_social,
            infoGeneral.nombre_corto,
            infoGeneral.fecha_constitución ? safeDateToISO(infoGeneral.fecha_constitución) : null,
            infoGeneral.ciudad_constitución,
            infoGeneral.pais_constitucion || infoGeneral.pais_constitución,
            infoGeneral.dir_sede_principal,
            infoGeneral.barrio,
            infoGeneral.ciudad_municipio,
            infoGeneral.departamento,
            infoGeneral.pais,
            infoGeneral.telefono,
            infoGeneral.ext,
            infoGeneral.correo,
            idEmpresa
          ]
        );

        // 2) personas_asociadas (representante legal y contacto adicional)
        const [empresaFKRows]: any = await pool.query(
          `
  SELECT
      id_info_repre_legal,
      id_cont_entidad
  FROM info_empresas
  WHERE id_info_empresas = ?
  LIMIT 1
  `,
          [idEmpresa]
        );

        const idRepresentanteLegal =
          empresaFKRows?.[0]?.id_info_repre_legal;

        const idContactoEntidad =
          empresaFKRows?.[0]?.id_cont_entidad;

        const representantePayload =
          payload?.representanteLegal?.representanteLegal;

        const contactoPayload =
          payload?.representanteLegal?.contactoEntidad;

        if (idRepresentanteLegal && representantePayload) {
          await pool.query(
            `
    UPDATE personas_asociadas SET
      tipo_documento = ?,
      num_documento = ?,
      primer_nombre = ?,
      segundo_nombre = ?,
      primer_apellido = ?,
      segundo_apellido = ?,
      cargo = ?,
      dir_laboral = ?,
      barrio = ?,
      ciudad_municipio = ?,
      departamento = ?,
      pais = ?,
      telefono = ?,
      ext = ?,
      celular = ?,
      correo = ?
    WHERE id_representante = ?
    `,
            [
              representantePayload.tipo_documento,
              representantePayload.num_documento,
              representantePayload.primer_nombre,
              representantePayload.segundo_nombre,
              representantePayload.primer_apellido,
              representantePayload.segundo_apellido,
              representantePayload.cargo,
              representantePayload.dir_laboral,
              representantePayload.barrio,
              representantePayload.ciudad_municipio,
              representantePayload.departamento,
              representantePayload.pais,
              representantePayload.telefono,
              representantePayload.ext,
              representantePayload.celular,
              representantePayload.correo,
              idRepresentanteLegal
            ]
          );
        }

        if (idContactoEntidad && contactoPayload) {
          await pool.query(
            `
    UPDATE personas_asociadas SET
      tipo_documento = ?,
      num_documento = ?,
      primer_nombre = ?,
      segundo_nombre = ?,
      primer_apellido = ?,
      segundo_apellido = ?,
      cargo = ?,
      dir_laboral = ?,
      barrio = ?,
      ciudad_municipio = ?,
      departamento = ?,
      pais = ?,
      telefono = ?,
      ext = ?,
      celular = ?,
      correo = ?
    WHERE id_representante = ?
    `,
            [
              contactoPayload.tipo_documento,
              contactoPayload.num_documento,
              contactoPayload.primer_nombre,
              contactoPayload.segundo_nombre,
              contactoPayload.primer_apellido,
              contactoPayload.segundo_apellido,
              contactoPayload.cargo,
              contactoPayload.dir_laboral,
              contactoPayload.barrio,
              contactoPayload.ciudad_municipio,
              contactoPayload.departamento,
              contactoPayload.pais,
              contactoPayload.telefono,
              contactoPayload.ext,
              contactoPayload.celular,
              contactoPayload.correo,
              idContactoEntidad
            ]
          );
        }

        // 3) naturalezaEntidad / tipo_entidad
        const naturalezaEntidad = payload?.naturalezaEntidad || {};
        if (naturalezaEntidad?.naturaleza != null) {
          // Encontrar id_tipo_entidad por naturaleza
          const [tipoEntidadRows]: any = await pool.query(
            `
  SELECT id_tipo_entidad
  FROM info_empresas
  WHERE id_info_empresas = ?
  LIMIT 1
  `,
            [idEmpresa]
          );

          const idTipoEntidad =
            tipoEntidadRows?.[0]?.id_tipo_entidad;

          if (idTipoEntidad) {
            await pool.query(
              `
    UPDATE tipo_entidad SET
      naturaleza = ?
    WHERE id_tipo_entidad = ?
    `,
              [naturalezaEntidad.naturaleza, idTipoEntidad]
            );
          }
        }

        // 4) infoFinancieraTributaria: actualizar info_financiera_emp + info_tributaria + países
        const infoFin = payload?.infoFinancieraTributaria || {};

        const [fkFinRows]: any = await pool.query(
          `SELECT id_info_financiera, id_info_tributaria, id_info_empresas FROM info_empresas WHERE id_info_empresas = ? LIMIT 1`,
          [idEmpresa]
        );
        const idInfoFinanciera = fkFinRows?.[0]?.id_info_financiera;
        const idInfoTributaria = fkFinRows?.[0]?.id_info_tributaria;

        if (idInfoFinanciera) {
          await pool.query(
            `UPDATE info_financiera_emp SET
              ingresos_op = ?,
              ingresos_no_op = ?,
              detalle_ingresos = ?,
              ventas_anuales = ?,
              fecha_cierre_ventas = ?,
              egresos_mensuales = ?,
              utilidad_neta = ?,
              total_activos = ?,
              total_pasivos = ?,
              total_patrimonio = ?
            WHERE id_info_financiera = ?`,
            [
              infoFin.ingresos_op,
              infoFin.ingresos_no_op,
              infoFin.detalle_ingresos,
              infoFin.ventas_anuales,
              infoFin.fecha_cierre_ventas ? safeDateToISO(infoFin.fecha_cierre_ventas) : null,
              infoFin.egresos_mensuales,
              infoFin.utilidad_neta,
              infoFin.total_activos,
              infoFin.total_pasivos,
              infoFin.total_patrimonio,
              idInfoFinanciera
            ]
          );
        }

        if (idInfoTributaria) {
          await pool.query(
            `UPDATE info_tributaria SET
              tipo_contribuyente = ?,
              clase_contribuyente = ?,
              responsable_iva = ?,
              autorretenedor = ?,
              intermediario_mercado = ?,
              vigilado_superintendencia = ?,
              tributa_exterior = ?
            WHERE id_info_tributaria = ?`,
            [
              infoFin.tipo_contribuyente,
              infoFin.clase_contribuyente,
              infoFin.responsable_iva,
              infoFin.autorretenedor,
              infoFin.intermediario_mercado,
              infoFin.vigilado_superintendencia,
              infoFin.tributa_exterior,
              idInfoTributaria
            ]
          );

          // pais_tributar: borrar e insertar si llega en payload
          if (Array.isArray(infoFin.paisesTributarios)) {
            await pool.query(`DELETE FROM pais_tributar WHERE id_info_tributaria = ?`, [idInfoTributaria]);
            for (const p of infoFin.paisesTributarios) {
              await pool.query(
                `INSERT INTO pais_tributar (pais, tin, id_info_tributaria) VALUES (?, ?, ?)`,
                [p.pais, p.tin, idInfoTributaria]
              );
            }
          }
        }

        // 5) declaracionBienesInfoSocios: actualizar declaracion_bienes + info_socios
        const decl = payload?.declaracionBienesInfoSocios || {};

        const [fkDeclRows]: any = await pool.query(
          `SELECT id_declaracion, id_info_socios FROM info_empresas WHERE id_info_empresas = ? LIMIT 1`,
          [idEmpresa]
        );
        const idDeclaracion = fkDeclRows?.[0]?.id_declaracion;
        const idInfoSocios = fkDeclRows?.[0]?.id_info_socios;

        if (idDeclaracion) {
          await pool.query(
            `UPDATE declaracion_bienes SET
              origen_bienes = ?,
              otro_origen_bienes = ?,
              fuente_recursos = ?,
              otra_fuente_recursos = ?,
              pais_origen_bienes = ?,
              ciudad_origen_bienes = ?,
              recursos_inembargables = ?,
              op_moneda_extj = ?
            WHERE id_declaracion = ?`,
            [
              decl.origen_bienes,
              decl.otro_origen_bienes,
              decl.fuente_recursos,
              decl.otra_fuente_recursos,
              decl.pais_origen_bienes,
              decl.ciudad_origen_bienes,
              decl.recursos_inembargables,
              decl.op_moneda_extj,
              idDeclaracion
            ]
          );
        }

        if (idInfoSocios) {
          await pool.query(
            `UPDATE info_socios SET
              rnve = ?,
              hay_socios_accionistas = ?,
              personas_control = ?,
              personas_expuestas = ?,
              bolsa_valores = ?
            WHERE id_info_socios = ?`,
            [
              decl.rnve,
              decl.hay_socios_accionistas,
              decl.personas_control,
              decl.personas_expuestas,
              decl.bolsa_valores,
              idInfoSocios
            ]
          );
        }

        await pool.commit();
        return res.json({ success: true, message: 'Empresa actualizada correctamente', idEmpresa });
      } catch (err: any) {
        await pool.rollback();
        return res.status(500).json({ success: false, message: err.message || 'Error al actualizar empresa' });
      }
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
  }

}