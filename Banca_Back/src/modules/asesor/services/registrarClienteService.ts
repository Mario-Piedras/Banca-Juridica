import pool from '../../../config/database'; // La ruta a la base de datos
import { ClienteCompleto } from '../../../shared/interfaces'; // ← AGREGAR

export class RegistrarClienteService {
  async registrarClienteCompleto(data: any) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 🧹 LIMPIEZA DE DATOS: convierte undefined en null para evitar errores de MySQL
      for (const key in data) {
        if (data[key] === undefined) {
          data[key] = null;
        }
      }

      // También limpia los subobjetos (contacto, actividad, laboral, financiera, facta)
      const secciones = ['contacto', 'actividad', 'laboral', 'financiera', 'facta'];
      for (const seccion of secciones) {
        if (data[seccion]) {
          for (const key in data[seccion]) {
            if (data[seccion][key] === undefined) {
              data[seccion][key] = null;
            }
          }
        }
      }

      console.log('🧩 Datos limpios antes del INSERT:', JSON.stringify(data, null, 2));


      // === 1. Insertar cliente ===
      const [clienteResult]: any = await connection.execute(
        `
        INSERT INTO clientes (
          tipo_documento, numero_documento, lugar_expedicion,
          ciudad_nacimiento, fecha_nacimiento, fecha_expedicion,
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          genero, nacionalidad, otra_nacionalidad, estado_civil, grupo_etnico
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.tipoDocumento,
          data.numeroDocumento,
          data.lugarExpedicion,
          data.ciudadNacimiento,
          data.fechaNacimiento,
          data.fechaExpedicion,
          data.primerNombre,
          data.segundoNombre,
          data.primerApellido,
          data.segundoApellido,
          data.genero,
          data.nacionalidad,
          data.otraNacionalidad,
          data.estadoCivil,
          data.grupoEtnico,
        ]
      );

      const idCliente = clienteResult.insertId;

      // === 2. Insertar contacto personal ===
      await connection.execute(
        `
        INSERT INTO contacto_personal (
          direccion, barrio, departamento, telefono, ciudad,
          pais, correo, bloque_torre, apto_casa, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.contacto?.direccion,
          data.contacto?.barrio,
          data.contacto?.departamento,
          data.contacto?.telefono,
          data.contacto?.ciudad,
          data.contacto?.pais,
          data.contacto?.correo,
          data.contacto?.bloqueTorre,
          data.contacto?.aptoCasa,
          idCliente,
        ]
      );
      // como la base de datos usa 'Sí'/'No' en vez de booleanos esta linea hace la conversion
      const factaCrsEconomica = data.actividad.factaCrs ? 'Sí' : 'No';
       // === ⚠️ 3. Insertar actividad económica (faltante totalmente) ===
      await connection.execute(
        `
        INSERT INTO actividad_economica (
          profesion, ocupacion, codigo_CIIU, detalle_actividad,
          numero_empleados, Facta_Crs, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.actividad?.profesion,
          data.actividad?.ocupacion,
          data.actividad?.codigoCiiu,
          data.actividad?.detalleActividad,
          data.actividad?.numeroEmpleados,
          factaCrsEconomica,
          idCliente,
        ]
      );

      // === 3. Insertar información laboral ===
      await connection.execute(
        `
        INSERT INTO info_laboral (
          nombre_empresa, direccion_empresa, pais_empresa,
          departamento_empresa, ciudad_empresa, telefono_empresa,
          ext, celular_empresa, correo_laboral, id_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.laboral?.nombreEmpresa,
          data.laboral?.direccionEmpresa,
          data.laboral?.paisEmpresa,
          data.laboral?.departamentoEmpresa,
          data.laboral?.ciudadEmpresa,
          data.laboral?.telefonoEmpresa,
          data.laboral?.ext,
          data.laboral?.celularEmpresa,
          data.laboral?.correoLaboral,
          idCliente,
        ]
      );

      // === ⚠️ 5. Insertar información financiera (faltante totalmente) ===
      await connection.execute(
        `
        INSERT INTO info_financiera (
          ingresos_mensuales, egresos_mensuales, total_activos,
          total_pasivos, id_cliente
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          data.financiera?.ingresosMensuales,
          data.financiera?.egresosMensuales,
          data.financiera?.totalActivos,
          data.financiera?.totalPasivos,
          idCliente,
        ]
      );
  
      const esResidente = data.facta.esResidenteExtranjero ? 'Sí' : 'No';
      // === 4. Insertar FACTA/CRS ===
      await connection.execute(
        `
        INSERT INTO Facta_Crs (id_cliente, es_residente_extranjero, pais)
        VALUES (?, ?, ?)
        `,
        [idCliente,esResidente, data.facta?.pais]
      );

      await connection.commit();

      return { success: true, message: 'Cliente registrado correctamente', idCliente };
    } catch (error) {
      await connection.rollback();
      console.error('Error al registrar cliente:', error);
      throw new Error('Error al registrar cliente');
    } finally {
      connection.release();
    }
  }

  async obtenerClienteCompletoPorId(idCliente: number): Promise<ClienteCompleto> {
    const connection = await pool.getConnection();

    try {
      // === 1. Obtener datos principales del cliente ===
      const [clienteRows]: any = await connection.execute(
        `SELECT * FROM clientes WHERE id_cliente = ?`,
        [idCliente]
      );

      if (clienteRows.length === 0) {
        throw new Error('Cliente no encontrado');
      }

      const cliente = clienteRows[0];

      // === 2. Obtener contacto personal ===
      const [contactoRows]: any = await connection.execute(
        `SELECT * FROM contacto_personal WHERE id_cliente = ?`,
        [idCliente]
      );

      // === 3. Obtener actividad económica ===
      const [actividadRows]: any = await connection.execute(
        `SELECT * FROM actividad_economica WHERE id_cliente = ?`,
        [idCliente]
      );

      // === 4. Obtener información laboral ===
      const [laboralRows]: any = await connection.execute(
        `SELECT * FROM info_laboral WHERE id_cliente = ?`,
        [idCliente]
      );

      // === 5. Obtener información financiera ===
      const [financieraRows]: any = await connection.execute(
        `SELECT * FROM info_financiera WHERE id_cliente = ?`,
        [idCliente]
      );

      // === 6. Obtener FACTA/CRS ===
      const [factaRows]: any = await connection.execute(
        `SELECT * FROM Facta_Crs WHERE id_cliente = ?`,
        [idCliente]
      );

      // 🧩 Estructurar los datos con las interfaces
      const datosCompletos: ClienteCompleto = {
        // Datos personales
        tipoDocumento: cliente.tipo_documento,
        numeroDocumento: cliente.numero_documento,
        lugarExpedicion: cliente.lugar_expedicion,
        ciudadNacimiento: cliente.ciudad_nacimiento,
        fechaNacimiento: cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toISOString().split('T')[0] : '',
        fechaExpedicion: cliente.fecha_expedicion ? new Date(cliente.fecha_expedicion).toISOString().split('T')[0] : '',
        primerNombre: cliente.primer_nombre,
        segundoNombre: cliente.segundo_nombre,
        primerApellido: cliente.primer_apellido,
        segundoApellido: cliente.segundo_apellido,
        genero: cliente.genero,
        nacionalidad: cliente.nacionalidad,
        otraNacionalidad: cliente.otra_nacionalidad,
        estadoCivil: cliente.estado_civil,
        grupoEtnico: cliente.grupo_etnico,

        // Contacto personal
        contacto: contactoRows.length > 0 ? {
          direccion: contactoRows[0].direccion,
          barrio: contactoRows[0].barrio,
          departamento: contactoRows[0].departamento,
          telefono: contactoRows[0].telefono,
          ciudad: contactoRows[0].ciudad,
          pais: contactoRows[0].pais,
          correo: contactoRows[0].correo,
          bloqueTorre: contactoRows[0].bloque_torre,
          aptoCasa: contactoRows[0].apto_casa
        } : undefined,

        // Actividad económica
        actividad: actividadRows.length > 0 ? {
          profesion: actividadRows[0].profesion,
          ocupacion: actividadRows[0].ocupacion,
          codigoCiiu: actividadRows[0].codigo_ciiu,
          detalleActividad: actividadRows[0].detalle_actividad,
          numeroEmpleados: actividadRows[0].numero_empleados,
          factaCrs: actividadRows[0].facta_crs === 'Sí'
        } : undefined,

        // Información laboral
        laboral: laboralRows.length > 0 ? {
          nombreEmpresa: laboralRows[0].nombre_empresa,
          direccionEmpresa: laboralRows[0].direccion_empresa,
          paisEmpresa: laboralRows[0].pais_empresa,
          departamentoEmpresa: laboralRows[0].departamento_empresa,
          ciudadEmpresa: laboralRows[0].ciudad_empresa,
          telefonoEmpresa: laboralRows[0].telefono_empresa,
          ext: laboralRows[0].ext,
          celularEmpresa: laboralRows[0].celular_empresa,
          correoLaboral: laboralRows[0].correo_laboral
        } : undefined,

        // Información financiera
        financiera: financieraRows.length > 0 ? {
          ingresosMensuales: financieraRows[0].ingresos_mensuales,
          egresosMensuales: financieraRows[0].egresos_mensuales,
          totalActivos: financieraRows[0].total_activos,
          totalPasivos: financieraRows[0].total_pasivos
        } : undefined ,// ← CAMBIAR de null a undefined,

        // FACTA/CRS
        facta: factaRows.length > 0 ? {
          esResidenteExtranjero: factaRows[0].es_residente_extranjero === 'Sí', // Convertir a boolean
          pais: factaRows[0].pais
        } : undefined // ← CAMBIAR de null a undefined
      };

      return datosCompletos;

    } catch (error) {
      console.error('Error al obtener cliente completo:', error);
      throw new Error('Error al obtener los datos del cliente');
    } finally {
      connection.release();
    }
  }

  async actualizarClienteCompleto(idCliente: number, data: ClienteCompleto) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 🧹 LIMPIEZA DE DATOS (versión tipada)
    const cleanData: any = { ...data };
    
    // Limpiar datos principales
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        cleanData[key] = null;
      }
    });

    // Limpiar subobjetos
    const secciones = ['contacto', 'actividad', 'laboral', 'financiera', 'facta'];
    secciones.forEach(seccion => {
      if (cleanData[seccion]) {
        Object.keys(cleanData[seccion]).forEach(key => {
          if (cleanData[seccion][key] === undefined) {
            cleanData[seccion][key] = null;
          }
        });
      }
    });

      console.log('🔄 Actualizando cliente ID:', idCliente);

    // === 1. Actualizar tabla clientes ===
    await connection.execute(
      `UPDATE clientes SET
        tipo_documento = ?, lugar_expedicion = ?, ciudad_nacimiento = ?,
        fecha_nacimiento = ?, fecha_expedicion = ?, primer_nombre = ?,
        segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
        genero = ?, nacionalidad = ?, otra_nacionalidad = ?, estado_civil = ?,
        grupo_etnico = ?
      WHERE id_cliente = ?`,
      [
        cleanData.tipoDocumento,
        cleanData.lugarExpedicion,
        cleanData.ciudadNacimiento,
        cleanData.fechaNacimiento,
        cleanData.fechaExpedicion,
        cleanData.primerNombre,
        cleanData.segundoNombre,
        cleanData.primerApellido,
        cleanData.segundoApellido,
        cleanData.genero,
        cleanData.nacionalidad,
        cleanData.otraNacionalidad,
        cleanData.estadoCivil,
        cleanData.grupoEtnico,
        idCliente
      ]
    );

    // === 2. Actualizar contacto personal ===
    await connection.execute(
      `UPDATE contacto_personal SET
        direccion = ?, barrio = ?, departamento = ?, telefono = ?,
        ciudad = ?, pais = ?, correo = ?, bloque_torre = ?, apto_casa = ?
      WHERE id_cliente = ?`,
      [
        cleanData.contacto?.direccion,
        cleanData.contacto?.barrio,
        cleanData.contacto?.departamento,
        cleanData.contacto?.telefono,
        cleanData.contacto?.ciudad,
        cleanData.contacto?.pais,
        cleanData.contacto?.correo,
        cleanData.contacto?.bloqueTorre,
        cleanData.contacto?.aptoCasa,
        idCliente
      ]
    );

    // === 3. Actualizar actividad económica ===
    const factaCrsEconomica = cleanData.actividad?.factaCrs ? 'Sí' : 'No';
    await connection.execute(
      `UPDATE actividad_economica SET
        profesion = ?, ocupacion = ?, codigo_CIIU = ?, detalle_actividad = ?,
        numero_empleados = ?, Facta_Crs = ?
      WHERE id_cliente = ?`,
      [
        cleanData.actividad?.profesion,
        cleanData.actividad?.ocupacion,
        cleanData.actividad?.codigoCiiu,
        cleanData.actividad?.detalleActividad,
        cleanData.actividad?.numeroEmpleados,
        factaCrsEconomica,
        idCliente
      ]
    );

    // === 4. Actualizar información laboral ===
    await connection.execute(
      `UPDATE info_laboral SET
        nombre_empresa = ?, direccion_empresa = ?, pais_empresa = ?,
        departamento_empresa = ?, ciudad_empresa = ?, telefono_empresa = ?,
        ext = ?, celular_empresa = ?, correo_laboral = ?
      WHERE id_cliente = ?`,
      [
        cleanData.laboral?.nombreEmpresa,
        cleanData.laboral?.direccionEmpresa,
        cleanData.laboral?.paisEmpresa,
        cleanData.laboral?.departamentoEmpresa,
        cleanData.laboral?.ciudadEmpresa,
        cleanData.laboral?.telefonoEmpresa,
        cleanData.laboral?.ext,
        cleanData.laboral?.celularEmpresa,
        cleanData.laboral?.correoLaboral,
        idCliente
      ]
    );

    // === 5. Actualizar información financiera ===
    await connection.execute(
      `UPDATE info_financiera SET
        ingresos_mensuales = ?, egresos_mensuales = ?,
        total_activos = ?, total_pasivos = ?
      WHERE id_cliente = ?`,
      [
        cleanData.financiera?.ingresosMensuales,
        cleanData.financiera?.egresosMensuales,
        cleanData.financiera?.totalActivos,
        cleanData.financiera?.totalPasivos,
        idCliente
      ]
    );

    // === 6. Actualizar FACTA/CRS ===
    const esResidente = cleanData.facta?.esResidenteExtranjero ? 'Sí' : 'No';
    await connection.execute(
      `UPDATE Facta_Crs SET
        es_residente_extranjero = ?, pais = ?
      WHERE id_cliente = ?`,
      [esResidente, cleanData.facta?.pais, idCliente]
    );

    await connection.commit();

    return { success: true, message: 'Cliente actualizado correctamente', idCliente };

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar cliente:', error);
    throw new Error('Error al actualizar cliente');
  } finally {
    connection.release();
  }
  }

}
