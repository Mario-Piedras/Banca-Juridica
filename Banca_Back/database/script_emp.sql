INSERT INTO info_socios
	(rnve, hay_socios_accionistas, personas_control, personas_expuestas, 
    bolsa_valores) 
VALUES
	("Sí", "Sí", "Sí", "No","No"),
    ("No", "Sí", "Sí", "No","Sí"),
    ("Sí", "No", "Sí", "No","No"),
    ("No", "No", "No", "Sí","Sí"),
    ("Sí", "Sí", "No", "Sí","No"),
    ("No", "Sí", "No", "Sí","Sí"),
    ("Sí", "No", "Sí", "Sí","No"),
    ("No", "Sí", "Sí", "No","Sí"),
    ("Sí", "Sí", "Sí", "No","No");
    
INSERT INTO tipo_entidad (
	naturaleza, codigo_ciiu, actividad_economia, num_empleados,
    tipo_sociedad, otra_sociedad, tipo_asociacion, otra_asociacion, ent_estatal, 
    otra_ent_estatal, ent_estatal_descentralizada)
VALUES
-- Registro 1
	('Privada','6201','Desarrollo de software',120,'Por acciones simplificadas S.A.S',
	NULL,'Corporaciones y asociaciones',NULL,'Nación',NULL,'Nacional'),
-- Registro 2
	('Pública','8411','Administración pública',350,'Anónima',NULL,'Establecimiento público',
	NULL,'Departamento',NULL,'Departamental'),
-- Registro 3
	('Mixta','3511','Generación de energía eléctrica',520,'Limitada',NULL,
	'Sociedad de economía mixta',NULL,'Municipio',NULL,'Municipal'),
-- Registro 4 (usa otra_sociedad)
	('Privada','4711','Comercio al por menor',45,'Otra','Sociedad tecnológica emergente',
	'Fundaciones',NULL,'Nación',NULL,'Nacional'),
-- Registro 5
	('Privada','6920','Servicios contables',18,'Empresa unipersonal',NULL,
	'Entidades financieras',NULL,'Departamento',NULL,'Departamental'),
-- Registro 6 (usa otra_asociacion)
	('Pública','8610','Servicios hospitalarios',800,'Sin animo de lucro',NULL,
	'Otra','Organización interinstitucional','Municipio',NULL,'Municipal'),
-- Registro 7 (usa otra_ent_estatal)
	('Mixta','4110','Construcción de edificios',210,'En comandita por acciones',NULL,
	'Consorcio',NULL,'Otra','Entidad regional autónoma','Departamental'),
-- Registro 8
	('Privada','7310','Publicidad y mercadeo',65,'Asociación civil',NULL,
	'Cooperativas',NULL,'Nación',NULL,'Nacional'),
-- Registro 9 (usa otra_sociedad y otra_asociacion)
	('Mixta','5820','Edición de programas informáticos',95,'Otra','Sociedad de innovación digital',
    'Otra','Asociación empresarial especializada','Departamento',NULL,'Departamental');
    
INSERT INTO declaracion_bienes (
    origen_bienes,otro_origen_bienes,fuente_recursos,otra_fuente_recursos,
    pais_origen_bienes,ciudad_origen_bienes,recursos_inembargables,op_moneda_extj)
VALUES
-- Registro 1
	('Compraventa',NULL,'Utilidades del negocio',NULL,'Colombia','Cali','No','No'),
-- Registro 2
	('Aporte de socios',NULL,'Capitalización por parte de socios',NULL,'Colombia','Bogotá','Sí','No'),
-- Registro 3
	('Utilidades',NULL,'Desarrollo del objeto social',NULL,'México','Ciudad de México','No','Sí'),
-- Registro 4 (usa otro_origen_bienes)
	('Otro','Donación institucional','Utilidades del negocio',NULL,'Colombia','Medellín','Sí','No'),
-- Registro 5 (usa otra_fuente_recursos)
	('Compraventa',NULL,'Otra','Inversión extranjera directa','España','Madrid','No','Sí'),
-- Registro 6
	('Aporte de socios',NULL,'Desarrollo del objeto social',NULL,'Chile','Santiago','No','No'),
-- Registro 7 (usa ambos campos opcionales)
	('Otro','Cesión de activos','Otra','Recursos provenientes de convenio empresarial','Estados Unidos','Miami','Sí','Sí'),
-- Registro 8
	('Utilidades',NULL,'Capitalización por parte de socios',NULL,'Perú','Lima','No','No'),
-- Registro 9
	('Compraventa',NULL,'Otra','Ingresos por alianzas estratégicas','Argentina','Buenos Aires','Sí','No');

INSERT INTO info_financiera_emp (
    ingresos_op,ingresos_no_op,detalle_ingresos,ventas_mensuales,fecha_cierre_ventas,
    egresos_mensuales,utilidad_neta,total_activos,total_pasivos,total_patrimonio)
VALUES
-- Registro 1
	(150000000.00,12000000.00,'Servicios tecnológicos y consultoría',820000000.00,'2000-01-31',
	8500000.00,43000000.00,500000000.00,180000000.00,320000000.00),
-- Registro 2
	(85000000.00,5000000.00,'Comercialización de productos',450000000.00,'2000-02-28',6200000.00,
	21000000.00,320000000.00,110000000.00,210000000.00),
-- Registro 3
	(240000000.00,18000000.00,'Producción industrial',1350000000.00,'2000-03-31',14500000.00,
	76000000.00,950000000.00,340000000.00,610000000.00),
-- Registro 4
	(98000000.00,7000000.00,'Prestación de servicios financieros',690000000.00,'2000-04-30',
	7200000.00,32000000.00,430000000.00,170000000.00,260000000.00),
-- Registro 5
	(125000000.00,9000000.00,'Operación logística y transporte',780000000.00,'2000-05-31',
	9100000.00,41000000.00,600000000.00,220000000.00,380000000.00),
-- Registro 6
	(70000000.00,3000000.00,'Distribución de alimentos',390000000.00,'2000-06-30',
	4500000.00,16000000.00,260000000.00,95000000.00,165000000.00),
-- Registro 7
	(310000000.00,25000000.00,'Construcción e infraestructura',1900000000.00,'2000-07-31',
    21000000.00,92000000.00,1300000000.00,470000000.00,830000000.00),
-- Registro 8
	(54000000.00,4000000.00,'Servicios educativos',280000000.00,'2000-08-31',3900000.00,
    14500000.00,190000000.00,70000000.00,120000000.00),
-- Registro 9
	(178000000.00,11000000.00,'Consultoría empresarial',980000000.00,'2000-09-30',
    9800000.00,58000000.00,720000000.00,250000000.00,470000000.00);
    

    
INSERT INTO personas_asociadas (
    tipo_documento,num_documento,primer_nombre,segundo_nombre,primer_apellido,segundo_apellido,cargo,dir_laboral,
    barrio,ciudad_municipio,departamento,pais,telefono,ext,celular,correo)
VALUES
	('CC','1032456789','Carlos','Andrés','Gómez','Pérez','Gerente General','Cra 12 #45-20','San Fernando',
	'Cali','Valle del Cauca','Colombia','6024457890','101','3104567890','carlos.gomez@empresa.com'),
	('CC','1098765432','Laura','','Martínez','Rodríguez','Directora Financiera','Cl 18 #10-55','El Prado',
	'Barranquilla','Atlántico','Colombia','6053254478','205','3115678923','laura.martinez@empresa.com'),
	('Pasaporte','PA7845123','John','Michael','Smith','Brown','Representante Comercial','742 Madison Ave','Manhattan',
	'Nueva York','New York','Estados Unidos','12125567890','','3208765432','john.smith@empresa.com'),
	('CedulaExtranjeria','CE98745612','María','Fernanda','López','Ruiz','Subgerente','Av 30 #25-60','Belén',
	'Medellín','Antioquia','Colombia','6045547788','320','3156789021','maria.lopez@empresa.com'),
	('CC','801234567','Daniel','','Morales','Castro','Director Jurídico','Cl 72 #8-30','Chapinero',
	'Bogotá','Cundinamarca','Colombia','6014217845','110','3174456712','daniel.morales@empresa.com'),
	('CarnetDiplomatico','CD458796','Alejandro','José','Herrera','Molina','Delegado Internacional','Av Libertador 500','Centro',
	'Caracas','Distrito Capital','Venezuela','582124578963','','3124567891','alejandro.herrera@empresa.com'),
	('CC','1122334455','Paula','Andrea','Torres','Salazar','Coordinadora Administrativa','Cra 9 #22-80','Granada',
	'Cali','Valle del Cauca','Colombia','6024412365','415','3009876543','paula.torres@empresa.com'),
    ('Pasaporte','MX784512','José','Luis','Ramírez','Fernández','Gerente Operativo','Av Reforma 250','Juárez',
	'Ciudad de México','CDMX','México','525512345678','','3014569823','jose.ramirez@empresa.com'),
	('CC','1145678934','Natalia','','Vargas','Rincón','Contadora','Cl 40 #21-18','Cabecera',
	'Bucaramanga','Santander','Colombia','6076542312','150','3187854123','natalia.vargas@empresa.com'),
	('CedulaExtranjeria','CE14587963','Miguel','Ángel','Santos','Luna','Director Comercial','Cra 18 #80-15','La Castellana',
	'Bogotá','Cundinamarca','Colombia','6015478231','220','3168897456','miguel.santos@empresa.com'),
	('CC','1078456123','Sofía','Elena','Ramírez','Cruz','Analista Financiera','Cl 13 #44-28','Ciudad Jardín',
	'Cali','Valle del Cauca','Colombia','6023896541','','3221458796','sofia.ramirez@empresa.com'),
	('Pasaporte','ES9632587','Antonio','','García','Navarro','Presidente','Gran Vía 18','Centro',
	'Madrid','Madrid','España','34911234567','501','3197845632','antonio.garcia@empresa.com');

INSERT INTO info_tributaria (
    tipo_contribuyente,clase_contribuyente,responsable_iva,autorretenedor,
    intermediario_mercado,vigilado_superintendencia,tributa_exterior)
VALUES
-- ID 1
	('Personas jurídicas, comerciales y civiles, consorcios y uniones temporales',
	'Gran contribuyente','Sí','Sí','No','Sí','Sí'),
-- ID 2
	('Corporaciones, fundaciones y asociaciones sin ánimo de lucro',
	'No gran contribuyente','No','No','No','No','No'),
-- ID 3
	('Entidad pública nacional o territorial','No gran contribuyente',
	'No','No','No','Sí','No'),
-- ID 4
	('Cooperativa','No gran contribuyente','Sí','No','No','No','Sí'),
-- ID 5
	('Personas jurídicas, comerciales y civiles, consorcios y uniones temporales',
	'Gran contribuyente','Sí','Sí','Sí','Sí','Sí'),
-- ID 6
	('No contribuyente','No gran contribuyente','No','No','No','No','No'),
-- ID 7
	('Corporaciones, fundaciones y asociaciones sin ánimo de lucro',
	'No gran contribuyente','Sí','No','No','No','Sí'),
-- ID 8
	('Cooperativa','No gran contribuyente','Sí','Sí','No','Sí','No'),
-- ID 9
	('Personas jurídicas, comerciales y civiles, consorcios y uniones temporales',
	'Gran contribuyente','Sí','Sí','Sí','Sí','Sí');

INSERT INTO pais_tributar (pais,tin,id_info_tributaria)
VALUES
-- Para ID 1 (3 registros)
	('Estados Unidos','TIN-US-458712',1),
	('México','RFC-MX-985421',1),
	('España','NIF-ES-332145',1),
-- Para ID 4 (2 registros)
	('Chile','TIN-CL-754896',4),
	('Perú','RUC-PE-412578',4),

-- Para ID 5 (3 registros)
	('Canadá','TIN-CA-896532',5),
	('Panamá','RUC-PA-225478',5),
	('Argentina','CUIT-AR-774125',5),

-- Para ID 7 (1 registro)
	('Brasil','CPF-BR-663214',7),

-- Para ID 9 (2 registros)
	('Alemania','TIN-DE-336985',9),
	('Francia','TIN-FR-845217',9);
    
INSERT INTO info_empresas (
    nit,razon_social,nombre_corto,fecha_constitución,ciudad_constitución,pais_constitucion,dir_sede_principal,
    barrio,ciudad_municipio,departamento,pais,telefono,ext,correo,
    id_info_financiera, id_info_repre_legal, id_cont_entidad, id_info_socios, id_tipo_entidad, id_declaracion, id_info_tributaria)
VALUES
-- Registro 1 → Desarrollo de software
	('901234567','Soluciones Integrales de Software S.A.S','SOFTINT','2012-03-14','Cali','Colombia','Cra 45 #12-80',
	'Granada','Cali','Valle del Cauca','Colombia','6024567810','101','contacto@softintegral.com', 1, 1, NULL, 1, 1, 1, 1),
-- Registro 2 → Administración pública
	('800112233','Entidad Administrativa Territorial del Valle','EAT VALLE','2005-07-21','Cali','Colombia','Av 4 Norte #8-45',
	'Versalles','Cali','Valle del Cauca','Colombia','6025547789','220','gestion@eatvalle.gov.co', 2, 2, 10, 2, 2, 2, 2),
-- Registro 3 → Generación de energía eléctrica
	('890456789','Generadora Energética Nacional Ltda','GENERGIA','2008-11-08','Medellín','Colombia','Cl 20 #65-90','El Poblado',
	'Medellín','Antioquia','Colombia','6044478890','315','info@genergia.com', 3, 3, 11, 3, 3, 3, 3),
-- Registro 4 → Comercio al por menor
	('901555321','Comercializadora Punto Retail','PUNTORET','2018-01-17','Bogotá','Colombia','Cra 14 #98-22','Chapinero','Bogotá',
	'Cundinamarca','Colombia','6014123678','180','ventas@puntoretail.com', 4, 4, NULL, 4, 4, 4, 4),
-- Registro 5 → Servicios contables
	('900678123','Asesorías Contables Empresariales','ASECONT','2016-05-04','Barranquilla','Colombia','Cl 75 #42-18','El Prado',
	'Barranquilla','Atlántico','Colombia','6053214455','110','servicio@asecont.com', 5, 5, NULL, 5, 5, 5, 5),
-- Registro 6 → Servicios hospitalarios
	('890987654','Corporación Integral Hospitalaria','CORPHOSP','2001-09-10','Bucaramanga','Colombia','Av Quebradaseca #28-60',
	'Cabecera','Bucaramanga','Santander','Colombia','6076542231','420','contacto@corphospitalaria.org', 6, 6, 12, 6, 6, 6, 6),
-- Registro 7 → Construcción de edificios
	('900741852','Constructora Infraestructura Urbana S.A.','CIURBANA','2014-06-12','Bogotá','Colombia','Cl 127 #18-70','Usaquén',
	'Bogotá','Cundinamarca','Colombia','6015789632','510','proyectos@ciurbana.com', 7, 7, NULL, 7, 7, 7, 7),
-- Registro 8 → Publicidad y mercadeo
	('901369258','Grupo Estratégico de Publicidad y Mercadeo','GEPM','2019-02-25','Cali','Colombia','Cra 100 #16-55','Ciudad Jardín',
	'Cali','Valle del Cauca','Colombia','6023987412','105','info@gepm.com', 8, 8, NULL, 8, 8, 8, 8),
-- Registro 9 → Edición de programas informáticos
	('900852741','Editora Digital de Sistemas e Innovación','EDSI','2017-08-30','Medellín','Colombia','Cl 33 #74-19','Laureles',
	'Medellín','Antioquia','Colombia','6047845632','240','contacto@edsi.com', 9, 9, NULL, 9, 9, 9, 9);