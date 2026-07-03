CREATE DATABASE  IF NOT EXISTS `defaultdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `defaultdb`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividad_economica`
--

DROP TABLE IF EXISTS `actividad_economica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad_economica` (
  `id_actividad_economica` int NOT NULL AUTO_INCREMENT,
  `profesion` varchar(100) DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `codigo_CIIU` varchar(20) DEFAULT NULL,
  `detalle_actividad` text,
  `numero_empleados` int DEFAULT NULL,
  `facta_crs` enum('Sí','No') DEFAULT 'No',
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_actividad_economica`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  KEY `idx_cliente` (`id_cliente`),
  CONSTRAINT `actividad_economica_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boveda`
--

DROP TABLE IF EXISTS `boveda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boveda` (
  `id_boveda` int NOT NULL AUTO_INCREMENT,
  `saldo_efectivo` decimal(15,2) DEFAULT '0.00',
  `saldo_cheques` decimal(15,2) DEFAULT '0.00',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultima_actualizacion_por` int DEFAULT NULL,
  PRIMARY KEY (`id_boveda`),
  KEY `ultima_actualizacion_por` (`ultima_actualizacion_por`),
  CONSTRAINT `boveda_ibfk_1` FOREIGN KEY (`ultima_actualizacion_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cajas`
--

DROP TABLE IF EXISTS `cajas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajas` (
  `id_caja` int NOT NULL AUTO_INCREMENT,
  `nombre_caja` varchar(50) NOT NULL,
  `estado` enum('LIBRE','OCUPADA') NOT NULL DEFAULT 'LIBRE',
  `usuario_asignado` int DEFAULT NULL,
  `fecha_asignacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_caja`),
  KEY `idx_estado` (`estado`),
  KEY `idx_usuario_asignado` (`usuario_asignado`),
  CONSTRAINT `fk_cajas_usuario` FOREIGN KEY (`usuario_asignado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `numero_documento` varchar(20) NOT NULL,
  `tipo_documento` enum('CC','TI','R.Civil','PPT','Pasaporte','CarneDiplomatico','CedulaExtranjeria') NOT NULL,
  `lugar_expedicion` varchar(100) DEFAULT NULL,
  `ciudad_nacimiento` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_expedicion` date DEFAULT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `segundo_nombre` varchar(50) DEFAULT NULL,
  `primer_apellido` varchar(50) NOT NULL,
  `segundo_apellido` varchar(50) DEFAULT NULL,
  `genero` enum('Masculino','Femenino') NOT NULL,
  `nacionalidad` enum('Colombiano','Estadounidense','Otra') NOT NULL,
  `otra_nacionalidad` varchar(100) DEFAULT NULL,
  `estado_civil` enum('Soltero','Casado','Unión Libre') NOT NULL,
  `grupo_etnico` enum('Indígena','Gitano','Raizal','Palenquero','Afrocolombiano','Ninguno') NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  KEY `idx_documento` (`tipo_documento`,`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contacto_personal`
--

DROP TABLE IF EXISTS `contacto_personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacto_personal` (
  `id_contacto` int NOT NULL AUTO_INCREMENT,
  `direccion` varchar(255) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `bloque_torre` varchar(50) DEFAULT NULL,
  `apto_casa` varchar(50) DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_contacto`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `contacto_personal_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuentas_ahorro`
--

DROP TABLE IF EXISTS `cuentas_ahorro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_ahorro` (
  `id_cuenta` int NOT NULL AUTO_INCREMENT,
  `numero_cuenta` varchar(20) NOT NULL,
  `id_cliente` int DEFAULT NULL,
  `id_solicitud` int DEFAULT NULL,
  `saldo` decimal(15,2) NOT NULL DEFAULT '0.00',
  `estado_cuenta` enum('Activa','Inactiva','Bloqueada','Cerrada') NOT NULL DEFAULT 'Activa',
  `fecha_apertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_empresa` int DEFAULT NULL,
  PRIMARY KEY (`id_cuenta`),
  UNIQUE KEY `numero_cuenta` (`numero_cuenta`),
  UNIQUE KEY `id_solicitud_UNIQUE` (`id_solicitud`),
  KEY `idx_cta_numero` (`numero_cuenta`),
  KEY `idx_cta_cliente` (`id_cliente`),
  KEY `idx_cta_solicitud` (`id_solicitud`),
  KEY `idx_estado` (`estado_cuenta`),
  KEY `cuentas_ahorro_fk_1_idx` (`id_empresa`),
  CONSTRAINT `cuentas_ahorro_fk_1` FOREIGN KEY (`id_empresa`) REFERENCES `info_empresas` (`id_info_empresas`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_cta_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_apertura` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `declaracion_bienes`
--

DROP TABLE IF EXISTS `declaracion_bienes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `declaracion_bienes` (
  `id_declaracion` int NOT NULL AUTO_INCREMENT,
  `origen_bienes` enum('Compraventa','Aporte de socios','Utilidades','Otro') NOT NULL,
  `otro_origen_bienes` varchar(100) DEFAULT NULL,
  `fuente_recursos` enum('Capitalización por parte de socios','Utilidades del negocio','Desarrollo del objeto social','Otra') NOT NULL,
  `otra_fuente_recursos` varchar(100) DEFAULT NULL,
  `pais_origen_bienes` varchar(100) NOT NULL,
  `ciudad_origen_bienes` varchar(100) NOT NULL,
  `recursos_inembargables` enum('Sí','No') DEFAULT 'No',
  `op_moneda_extj` enum('Sí','No') DEFAULT 'No',
  PRIMARY KEY (`id_declaracion`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facta_crs`
--

DROP TABLE IF EXISTS `facta_crs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facta_crs` (
  `id_facta_crs` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `es_residente_extranjero` enum('Sí','No') NOT NULL DEFAULT 'No',
  `pais` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_facta_crs`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `Facta_Crs_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gestion_cuentas`
--

DROP TABLE IF EXISTS `gestion_cuentas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestion_cuentas` (
  `id_gestion_cuentas` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_cuenta` int NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `asignado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_gestion_cuentas`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_cuenta` (`id_cuenta`),
  CONSTRAINT `gestion_cuentas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `gestion_cuentas_ibfk_2` FOREIGN KEY (`id_cuenta`) REFERENCES `cuentas_ahorro` (`id_cuenta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_empresas`
--

DROP TABLE IF EXISTS `info_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_empresas` (
  `id_info_empresas` int NOT NULL AUTO_INCREMENT,
  `nit` varchar(20) NOT NULL,
  `razon_social` varchar(100) NOT NULL,
  `nombre_corto` varchar(20) DEFAULT NULL,
  `fecha_constitución` date NOT NULL,
  `ciudad_constitución` varchar(100) NOT NULL,
  `pais_constitucion` varchar(100) NOT NULL,
  `dir_sede_principal` varchar(100) NOT NULL,
  `barrio` varchar(50) NOT NULL,
  `ciudad_municipio` varchar(100) NOT NULL,
  `departamento` varchar(50) NOT NULL,
  `pais` varchar(50) NOT NULL,
  `telefono` varchar(13) DEFAULT NULL,
  `ext` varchar(10) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `id_info_financiera` int DEFAULT NULL,
  `id_info_repre_legal` int DEFAULT NULL,
  `id_cont_entidad` int DEFAULT NULL,
  `id_info_socios` int DEFAULT NULL,
  `id_tipo_entidad` int DEFAULT NULL,
  `id_declaracion` int DEFAULT NULL,
  `id_info_tributaria` int DEFAULT NULL,
  PRIMARY KEY (`id_info_empresas`),
  UNIQUE KEY `nit_UNIQUE` (`nit`),
  KEY `info_empresas_fk_1` (`id_info_financiera`),
  KEY `info_empresas_fk_2` (`id_info_repre_legal`),
  KEY `info_empresas_fk_3` (`id_cont_entidad`),
  KEY `info_empresas_fk_4` (`id_info_socios`),
  KEY `info_empresas_fk_5` (`id_tipo_entidad`),
  KEY `info_empresas_fk_6` (`id_declaracion`),
  KEY `info_empresas_fk_7` (`id_info_tributaria`),
  CONSTRAINT `info_empresas_fk_1` FOREIGN KEY (`id_info_financiera`) REFERENCES `info_financiera_emp` (`id_info_financiera`),
  CONSTRAINT `info_empresas_fk_2` FOREIGN KEY (`id_info_repre_legal`) REFERENCES `personas_asociadas` (`id_representante`),
  CONSTRAINT `info_empresas_fk_3` FOREIGN KEY (`id_cont_entidad`) REFERENCES `personas_asociadas` (`id_representante`),
  CONSTRAINT `info_empresas_fk_4` FOREIGN KEY (`id_info_socios`) REFERENCES `info_socios` (`id_info_socios`),
  CONSTRAINT `info_empresas_fk_5` FOREIGN KEY (`id_tipo_entidad`) REFERENCES `tipo_entidad` (`id_tipo_entidad`),
  CONSTRAINT `info_empresas_fk_6` FOREIGN KEY (`id_declaracion`) REFERENCES `declaracion_bienes` (`id_declaracion`),
  CONSTRAINT `info_empresas_fk_7` FOREIGN KEY (`id_info_tributaria`) REFERENCES `info_tributaria` (`id_info_tributaria`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_financiera`
--

DROP TABLE IF EXISTS `info_financiera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_financiera` (
  `id_info_financiera` int NOT NULL AUTO_INCREMENT,
  `ingresos_mensuales` decimal(15,2) DEFAULT NULL,
  `egresos_mensuales` decimal(15,2) DEFAULT NULL,
  `total_activos` decimal(15,2) DEFAULT NULL,
  `total_pasivos` decimal(15,2) DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_info_financiera`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `info_financiera_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_financiera_emp`
--

DROP TABLE IF EXISTS `info_financiera_emp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_financiera_emp` (
  `id_info_financiera` int NOT NULL AUTO_INCREMENT,
  `ingresos_op` decimal(15,2) DEFAULT '0.00',
  `ingresos_no_op` decimal(15,2) DEFAULT '0.00',
  `detalle_ingresos` varchar(100) DEFAULT NULL,
  `ventas_mensuales` decimal(15,2) DEFAULT '0.00',
  `fecha_cierre_ventas` date NOT NULL,
  `egresos_mensuales` decimal(15,2) DEFAULT '0.00',
  `utilidad_neta` decimal(15,2) DEFAULT '0.00',
  `total_activos` decimal(15,2) DEFAULT '0.00',
  `total_pasivos` decimal(15,2) DEFAULT '0.00',
  `total_patrimonio` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id_info_financiera`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_laboral`
--

DROP TABLE IF EXISTS `info_laboral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_laboral` (
  `id_info_laboral` int NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(100) NOT NULL,
  `direccion_empresa` varchar(150) DEFAULT NULL,
  `pais_empresa` varchar(100) DEFAULT NULL,
  `departamento_empresa` varchar(100) DEFAULT NULL,
  `ciudad_empresa` varchar(100) DEFAULT NULL,
  `telefono_empresa` varchar(20) DEFAULT NULL,
  `ext` varchar(10) DEFAULT NULL,
  `celular_empresa` varchar(20) DEFAULT NULL,
  `correo_laboral` varchar(100) DEFAULT NULL,
  `id_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_info_laboral`),
  UNIQUE KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `info_laboral_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_socios`
--

DROP TABLE IF EXISTS `info_socios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_socios` (
  `id_info_socios` int NOT NULL AUTO_INCREMENT,
  `rnve` enum('Sí','No') DEFAULT 'No',
  `hay_socios_accionistas` enum('Sí','No') DEFAULT 'No',
  `personas_control` enum('Sí','No') DEFAULT 'No',
  `personas_expuestas` enum('Sí','No') DEFAULT 'No',
  `bolsa_valores` enum('Sí','No') DEFAULT 'No',
  PRIMARY KEY (`id_info_socios`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `info_tributaria`
--

DROP TABLE IF EXISTS `info_tributaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_tributaria` (
  `id_info_tributaria` int NOT NULL AUTO_INCREMENT,
  `tipo_contribuyente` enum('Personas jurídicas, comerciales y civiles, consorcios y uniones temporales','Corporaciones, fundaciones y asociaciones sin ánimo de lucro','Entidad pública nacional o territorial','Cooperativa','No contribuyente') DEFAULT 'No contribuyente',
  `clase_contribuyente` enum('Gran contribuyente','No gran contribuyente') DEFAULT 'No gran contribuyente',
  `responsable_iva` enum('Sí','No') DEFAULT 'No',
  `autorretenedor` enum('Sí','No') DEFAULT 'No',
  `intermediario_mercado` enum('Sí','No') DEFAULT 'No',
  `vigilado_superintendencia` enum('Sí','No') DEFAULT 'No',
  `tributa_exterior` enum('Sí','No') DEFAULT 'No',
  PRIMARY KEY (`id_info_tributaria`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `oficina`
--

DROP TABLE IF EXISTS `oficina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oficina` (
  `id_oficina` int NOT NULL AUTO_INCREMENT,
  `saldo_efectivo` decimal(15,2) DEFAULT '0.00',
  `saldo_cheques` decimal(15,2) DEFAULT '0.00',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultima_actualizacion_por` int DEFAULT NULL,
  PRIMARY KEY (`id_oficina`),
  KEY `ultima_actualizacion_por` (`ultima_actualizacion_por`),
  CONSTRAINT `oficina_ibfk_1` FOREIGN KEY (`ultima_actualizacion_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pais_tributar`
--

DROP TABLE IF EXISTS `pais_tributar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pais_tributar` (
  `id_pais_tributar` int NOT NULL AUTO_INCREMENT,
  `pais` varchar(50) NOT NULL,
  `tin` varchar(20) NOT NULL,
  `id_info_tributaria` int NOT NULL,
  PRIMARY KEY (`id_pais_tributar`),
  KEY `pais_tributar_fk_1` (`id_info_tributaria`),
  CONSTRAINT `pais_tributar_fk_1` FOREIGN KEY (`id_info_tributaria`) REFERENCES `info_tributaria` (`id_info_tributaria`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personas_asociadas`
--

DROP TABLE IF EXISTS `personas_asociadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas_asociadas` (
  `id_representante` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` enum('CC','Pasaporte','CarnetDiplomatico','CedulaExtranjeria') NOT NULL,
  `num_documento` varchar(20) NOT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `segundo_nombre` varchar(50) DEFAULT '',
  `primer_apellido` varchar(50) NOT NULL,
  `segundo_apellido` varchar(50) DEFAULT '',
  `cargo` varchar(50) NOT NULL,
  `dir_laboral` varchar(50) NOT NULL,
  `barrio` varchar(50) NOT NULL,
  `ciudad_municipio` varchar(50) NOT NULL,
  `departamento` varchar(50) NOT NULL,
  `pais` varchar(50) NOT NULL,
  `telefono` varchar(13) DEFAULT NULL,
  `ext` varchar(10) DEFAULT NULL,
  `celular` varchar(10) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  PRIMARY KEY (`id_representante`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saldos_cajero`
--

DROP TABLE IF EXISTS `saldos_cajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saldos_cajero` (
  `id_saldo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL COMMENT 'Referencia al usuario (cajero)',
  `cajero` varchar(50) NOT NULL COMMENT 'Nombre del cajero',
  `saldo_efectivo` decimal(15,2) DEFAULT '0.00',
  `saldo_cheques` decimal(15,2) DEFAULT '0.00',
  `id_caja` int DEFAULT NULL COMMENT 'Caja asignada al cajero',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_saldo`),
  UNIQUE KEY `cajero` (`cajero`),
  KEY `idx_cajero` (`cajero`),
  KEY `idx_fecha` (`fecha_actualizacion`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_caja` (`id_caja`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_apertura`
--

DROP TABLE IF EXISTS `solicitudes_apertura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_apertura` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int DEFAULT NULL,
  `id_usuario_rol` int DEFAULT NULL COMMENT 'Asesor que creó la solicitud (opcional)',
  `tipo_cuenta` enum('Ahorros') NOT NULL DEFAULT 'Ahorros',
  `estado` enum('Pendiente','Aprobada','Rechazada','Devuelta','Aperturada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `comentario_director` text,
  `comentario_asesor` text,
  `archivo` longblob,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  `id_empresa` int DEFAULT NULL,
  `tipo_cliente` enum('Natural','Jurídica') NOT NULL DEFAULT 'Natural',
  `proposito_cuenta` enum('Ahorrar','Invertir','Servicios financieros en negocios fiduciarios','Realizar transacciones','Financiación','Recibir servicios especializados Banca de Inversión') DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  KEY `idx_sol_estado` (`estado`),
  KEY `idx_sol_cliente` (`id_cliente`),
  KEY `idx_sol_usuario_rol` (`id_usuario_rol`),
  KEY `solicitudes_apertura_fk_1_idx` (`id_empresa`),
  CONSTRAINT `fk_sol_usuario_rol` FOREIGN KEY (`id_usuario_rol`) REFERENCES `usuario_rol` (`id_usuario_rol`) ON DELETE SET NULL,
  CONSTRAINT `solicitudes_apertura_fk_1` FOREIGN KEY (`id_empresa`) REFERENCES `info_empresas` (`id_info_empresas`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `solicitudes_apertura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `solicitudes_apertura_ibfk_2` FOREIGN KEY (`id_usuario_rol`) REFERENCES `usuario_rol` (`id_usuario_rol`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_entidad`
--

DROP TABLE IF EXISTS `tipo_entidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_entidad` (
  `id_tipo_entidad` int NOT NULL AUTO_INCREMENT,
  `naturaleza` enum('Privada','Pública','Mixta') NOT NULL,
  `codigo_ciiu` varchar(10) NOT NULL,
  `actividad_economia` varchar(200) NOT NULL,
  `num_empleados` int NOT NULL,
  `tipo_sociedad` enum('Por acciones simplificadas S.A.S','Anónima','Limitada','En comandita simple','En comandita por acciones','Sin animo de lucro','Sucursal de sociedad extranjera','Empresa unipersonal','Asociación civil','Sociedad de hecho','Colectiva','Otra') NOT NULL,
  `otra_sociedad` varchar(100) DEFAULT NULL,
  `tipo_asociacion` enum('Establecimiento público','Empresa industrial y comercial del estado','Sociedad de economía mixta','Empresa social del estado','Empresa servicios públicos domiciliario','Entidades financieras','Fondos mutuos de inversión','Fondos de empleados','Cooperativas','Precooperativas','Copropiedades','Personas jurídicas de derecho canónico','Entidades religiosas no católicas','Sindicatos','Fundaciones','Corporaciones y asociaciones','Partido político','Consorcio','Unión temporal','Otra') NOT NULL,
  `otra_asociacion` varchar(100) DEFAULT NULL,
  `ent_estatal` enum('Nación','Departamento','Municipio','Otra') DEFAULT NULL,
  `otra_ent_estatal` varchar(100) DEFAULT NULL,
  `ent_estatal_descentralizada` enum('Naciónal','Departamental','Municipal') DEFAULT NULL,
  PRIMARY KEY (`id_tipo_entidad`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacciones`
--

DROP TABLE IF EXISTS `transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacciones` (
  `id_transaccion` int NOT NULL AUTO_INCREMENT,
  `id_cuenta` int NOT NULL,
  `tipo_transaccion` enum('Apertura','Depósito','Retiro','Nota Débito','Cancelación','Transferencia','Pago','Otro') NOT NULL,
  `tipo_deposito` enum('Efectivo','Cheque','Transferencia','Otro') DEFAULT NULL,
  `monto` decimal(15,2) NOT NULL,
  `codigo_cheque` varchar(50) DEFAULT NULL,
  `numero_cheque` varchar(50) DEFAULT NULL,
  `saldo_anterior` decimal(15,2) DEFAULT NULL,
  `saldo_nuevo` decimal(15,2) DEFAULT NULL,
  `id_usuario` int DEFAULT NULL COMMENT 'Usuario (cajero) que realizó la transacción',
  `id_caja` int DEFAULT NULL COMMENT 'Caja en la que se realizó la transacción',
  `fecha_transaccion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cajero` varchar(50) DEFAULT NULL COMMENT 'Cajero que realizó la transacción',
  `motivo_cancelacion` varchar(500) DEFAULT NULL COMMENT 'Motivo de cancelación de cuenta',
  PRIMARY KEY (`id_transaccion`),
  KEY `idx_cuenta_trans` (`id_cuenta`),
  KEY `idx_tipo_trans` (`tipo_transaccion`),
  KEY `idx_fecha` (`fecha_transaccion`),
  KEY `idx_cajero` (`cajero`),
  KEY `id_caja` (`id_caja`),
  KEY `idx_usuario` (`id_usuario`),
  CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`id_cuenta`) REFERENCES `cuentas_ahorro` (`id_cuenta`) ON DELETE CASCADE,
  CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `transacciones_ibfk_3` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `traslados_cajero`
--

DROP TABLE IF EXISTS `traslados_cajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `traslados_cajero` (
  `id_traslado` int NOT NULL AUTO_INCREMENT,
  `id_usuario_origen` int DEFAULT NULL COMMENT 'Cajero que envía',
  `id_usuario_destino` int DEFAULT NULL COMMENT 'Cajero que recibe',
  `cajero_origen` varchar(50) NOT NULL,
  `cajero_destino` varchar(50) NOT NULL,
  `monto` decimal(15,2) NOT NULL,
  `estado` enum('Pendiente','Aceptado') DEFAULT 'Pendiente',
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_aceptacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_traslado`),
  KEY `idx_estado` (`estado`),
  KEY `idx_destino_estado` (`id_usuario_destino`,`estado`),
  KEY `idx_origen` (`id_usuario_origen`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `id_usuario_rol` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  `asignado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario_rol`),
  UNIQUE KEY `unique_usuario_rol` (`id_usuario`,`id_rol`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_rol` (`id_rol`),
  CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Cajero','Realiza operaciones de ventanilla (apertura, consignación, retiro, etc.)'),(2,'Asesor','Gestiona clientes y solicitudes de apertura'),(3,'Director-operativo','Revisa y aprueba/rechaza solicitudes de apertura de cuentas'),(5,'Cajero-Principal','Supervisor de cajeros y saldo');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('1', 'Caja 1', 'LIBRE');
INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('2', 'Caja 2', 'LIBRE');
INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('3', 'Caja 3', 'LIBRE');
INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('4', 'Caja 4', 'LIBRE');
INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('5', 'Caja 5', 'LIBRE');
INSERT INTO `defaultdb`.`cajas` (`id_caja`, `nombre_caja`, `estado`) VALUES ('6', 'Caja Principal', 'LIBRE');


-- Dump completed on 2026-07-03 15:24:14
