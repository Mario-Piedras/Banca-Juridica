-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: banca-uno-santiago2006ortizp-5f86.b.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35
CREATE DATABASE IF NOT EXISTS `pruebadb`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `pruebadb`;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

--
-- Table structure for table `Facta_Crs`
--

DROP TABLE IF EXISTS `Facta_Crs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Facta_Crs` (
  `id_facta_crs` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `es_residente_extranjero` enum('Sí','No') NOT NULL DEFAULT 'No',
  `pais` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_facta_crs`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `Facta_Crs_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Facta_Crs`
--

LOCK TABLES `Facta_Crs` WRITE;
/*!40000 ALTER TABLE `Facta_Crs` DISABLE KEYS */;
INSERT INTO `Facta_Crs` VALUES (1,1,'No',NULL),(2,2,'No',NULL),(3,3,'No',NULL),(4,4,'No',NULL),(5,5,'No',NULL),(6,8,'No',''),(7,12,'No','');
/*!40000 ALTER TABLE `Facta_Crs` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_economica`
--

LOCK TABLES `actividad_economica` WRITE;
/*!40000 ALTER TABLE `actividad_economica` DISABLE KEYS */;
INSERT INTO `actividad_economica` VALUES (1,'Ingeniero de Sistemas','Desarrollador','6201','Desarrollo de software',0,'No',1),(2,'Contador','Contadora','6920','Contabilidad y auditoría',0,'No',2),(3,'Administradora','Gerente','7020','Administración de empresas',5,'No',3),(4,'Abogado','Abogado','6910','Servicios jurídicos',0,'No',4),(5,'Diseñadora','Diseñadora GrÃ¡fica','7410','Diseño gráfico y publicidad',0,'No',5),(8,'asdasdads','asdas','123112','adasd',0,'No',8),(12,'adasd','asda','123123','sssss',0,'No',12);
/*!40000 ALTER TABLE `actividad_economica` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boveda`
--

LOCK TABLES `boveda` WRITE;
/*!40000 ALTER TABLE `boveda` DISABLE KEYS */;
/*!40000 ALTER TABLE `boveda` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas`
--

LOCK TABLES `cajas` WRITE;
/*!40000 ALTER TABLE `cajas` DISABLE KEYS */;
INSERT INTO `cajas` VALUES (1,'Caja 1','OCUPADA',7,'2025-11-27 20:29:49'),(2,'Caja 2','LIBRE',NULL,NULL),(3,'Caja 3','LIBRE',NULL,NULL),(4,'Caja 4','LIBRE',NULL,NULL),(5,'Caja 5','LIBRE',NULL,NULL),(6,'Caja Principal','LIBRE',NULL,NULL);
/*!40000 ALTER TABLE `cajas` ENABLE KEYS */;
UNLOCK TABLES;

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
  `genero` enum('M','F') NOT NULL,
  `nacionalidad` enum('Colombiano','Estadounidense','Otra') NOT NULL,
  `otra_nacionalidad` varchar(100) DEFAULT NULL,
  `estado_civil` enum('Soltero','Casado','Unión Libre') NOT NULL,
  `grupo_etnico` enum('Indígena','Gitano','Raizal','Palenquero','Afrocolombiano','Ninguna') NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  KEY `idx_documento` (`tipo_documento`,`numero_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'1012345678','CC','Bogotá','Bogotá','1990-05-15','2008-05-15','Juan','Carlos','Pérez','Gómez','M','Colombiano',NULL,'Soltero','Ninguna','2025-11-24 01:40:49'),(2,'1023456789','CC','Medellín','Medellín','1985-08-22','2003-08-22','Laura','Marcela','Ramírez','López','F','Colombiano',NULL,'Casado','Ninguna','2025-11-24 01:40:49'),(3,'1034567890','CC','Cali','Cali','1995-03-30','2013-03-30','Andrea','Carolina','Martínez','Vargas','F','Colombiano',NULL,'Unión Libre','Ninguna','2025-11-24 01:40:49'),(4,'1045678901','CC','Bogotá','Bogotá','1992-07-18','2010-07-18','Carlos','Alberto','Rodríguez','Torres','M','Colombiano',NULL,'Soltero','Ninguna','2025-11-24 01:40:49'),(5,'1056789012','CC','Bogotá','Bogotá','1998-11-25','2016-11-25','María','José','García','Hernández','F','Colombiano',NULL,'Soltero','Ninguna','2025-11-24 01:40:49'),(8,'123123123','CC','adasdasd','adasd','2025-11-25','2025-11-01','adsasd','asdasd','asdasd','asdads','M','Colombiano','asdasdsa','Soltero','Indígena','2025-11-25 04:15:21'),(12,'114567896','CC','asdasas','adsasdasd','2025-11-01','2025-11-26','Santiago ','','Pacheco','','M','Colombiano','','Soltero','Ninguna','2025-11-27 01:34:15');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacto_personal`
--

LOCK TABLES `contacto_personal` WRITE;
/*!40000 ALTER TABLE `contacto_personal` DISABLE KEYS */;
INSERT INTO `contacto_personal` VALUES (1,'Calle 100 # 20-30','Chicó','Cundinamarca','3001234567','Bogotá','Colombia','juan.perez@email.com',NULL,NULL,1),(2,'Carrera 50 # 80-45','Laureles','Antioquia','3109876543','Medellín','Colombia','laura.ramirez@email.com',NULL,NULL,2),(3,'Avenida 5N # 25-50','Granada','Valle del Cauca','3154445566','Cali','Colombia','andrea.martinez@email.com',NULL,NULL,3),(4,'Calle 72 # 10-15','Chapinero','Cundinamarca','3167778899','Bogotá','Colombia','carlos.rodriguez@email.com',NULL,NULL,4),(5,'Carrera 7 # 45-67','Centro','Cundinamarca','3178889900','Bogotá','Colombia','maria.garcia@email.com',NULL,NULL,5),(8,'adsasdas','dasd','adsasd','123123123','adsasdads','asdasd','qq@gmail.com','adasd','adasdasd',8),(12,'ADSasdaD','DASDASD','ASDA','123312123122','SDAS','asdasda','sssp@gmail.com','','',12);
/*!40000 ALTER TABLE `contacto_personal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_ahorro`
--

DROP TABLE IF EXISTS `cuentas_ahorro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_ahorro` (
  `id_cuenta` int NOT NULL AUTO_INCREMENT,
  `numero_cuenta` varchar(20) NOT NULL,
  `id_cliente` int NOT NULL,
  `id_solicitud` int DEFAULT NULL,
  `saldo` decimal(15,2) NOT NULL DEFAULT '0.00',
  `estado_cuenta` enum('Activa','Inactiva','Bloqueada','Cerrada') NOT NULL DEFAULT 'Activa',
  `fecha_apertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cuenta`),
  UNIQUE KEY `numero_cuenta` (`numero_cuenta`),
  KEY `idx_cta_numero` (`numero_cuenta`),
  KEY `idx_cta_cliente` (`id_cliente`),
  KEY `idx_cta_solicitud` (`id_solicitud`),
  KEY `idx_estado` (`estado_cuenta`),
  CONSTRAINT `fk_cta_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_cta_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_apertura` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_ahorro`
--

LOCK TABLES `cuentas_ahorro` WRITE;
/*!40000 ALTER TABLE `cuentas_ahorro` DISABLE KEYS */;
INSERT INTO `cuentas_ahorro` VALUES (1,'4001000001',1,1,590000.00,'Activa','2025-11-24 01:40:52'),(2,'4001000002',2,2,1200000.00,'Activa','2025-11-24 01:40:52'),(3,'4001000003',4,4,350000.00,'Activa','2025-11-24 01:40:52'),(4,'4001000004',1,NULL,0.00,'Cerrada','2025-11-24 01:40:52'),(8,'2001420613023600',8,8,100000.00,'Activa','2025-11-27 01:15:30'),(9,'2001420621178929',5,5,100000.00,'Activa','2025-11-27 01:16:51'),(10,'2001420754512600',12,NULL,0.00,'Cerrada','2025-11-27 01:39:05');
/*!40000 ALTER TABLE `cuentas_ahorro` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `gestion_cuentas`
--

LOCK TABLES `gestion_cuentas` WRITE;
/*!40000 ALTER TABLE `gestion_cuentas` DISABLE KEYS */;
/*!40000 ALTER TABLE `gestion_cuentas` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_financiera`
--

LOCK TABLES `info_financiera` WRITE;
/*!40000 ALTER TABLE `info_financiera` DISABLE KEYS */;
INSERT INTO `info_financiera` VALUES (1,5000000.00,2500000.00,50000000.00,10000000.00,1),(2,8000000.00,4000000.00,120000000.00,30000000.00,2),(3,6000000.00,3000000.00,80000000.00,20000000.00,3),(4,4500000.00,2200000.00,40000000.00,8000000.00,4),(5,3500000.00,1800000.00,25000000.00,5000000.00,5),(8,222.00,333.00,44.00,45.00,8),(12,222.00,333.00,4.00,44.00,12);
/*!40000 ALTER TABLE `info_financiera` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_laboral`
--

LOCK TABLES `info_laboral` WRITE;
/*!40000 ALTER TABLE `info_laboral` DISABLE KEYS */;
INSERT INTO `info_laboral` VALUES (1,'Tech Solutions SAS','Calle 50 # 10-20','Colombia','Cundinamarca','Bogotá','6011234567','101','3001234567','juan@techsolutions.com',1),(2,'Contadores Unidos','Carrera 70 # 45-10','Colombia','Antioquia','Medellín','6042345678','202','3109876543','laura@contadores.com',2),(3,'Empresas del Valle','Avenida 6N # 30-15','Colombia','Valle del Cauca','Cali','6023456789','303','3154445566','andrea@empresasvalle.com',3),(4,'Bufete Jurídico Ltda','Calle 85 # 15-30','Colombia','Cundinamarca','Bogotá','6014567890','404','3167778899','carlos@bufete.com',4),(5,'Diseños Creativos','Carrera 15 # 80-25','Colombia','Cundinamarca','Bogotá','6015678901','505','3178889900','maria@disenoscreativos.com',5),(8,'dsasd','asdads','adsa','adsasd','ssss','123123123','21312','12312312322','qqqq@gmail.com',8),(12,'asdasd','asdasd','asdasd','asdas','adsasd','1231222222','1232222','42312444422','pp@mail.com',12);
/*!40000 ALTER TABLE `info_laboral` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `oficina`
--

LOCK TABLES `oficina` WRITE;
/*!40000 ALTER TABLE `oficina` DISABLE KEYS */;
/*!40000 ALTER TABLE `oficina` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Cajero','Realiza operaciones de ventanilla (apertura, consignación, retiro, etc.)'),(2,'Asesor','Gestiona clientes y solicitudes de apertura'),(3,'Director-operativo','Revisa y aprueba/rechaza solicitudes de apertura de cuentas'),(5,'Cajero-Principal','Supervisor de cajeros y saldo');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saldos_cajero`
--

LOCK TABLES `saldos_cajero` WRITE;
/*!40000 ALTER TABLE `saldos_cajero` DISABLE KEYS */;
INSERT INTO `saldos_cajero` VALUES (1,1,'María GonzÃ¡lez',2000000.00,150000.00,NULL,'2025-11-24 01:40:52','2025-11-27 04:39:59'),(2,NULL,'Cajero Auxiliar 01',1500000.00,50000.00,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(3,NULL,'Cajero Auxiliar 02',800000.00,200000.00,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(4,NULL,'Cajero Principal',5000000.00,300000.00,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(5,5,'santiago',150000.00,140000.00,2,'2025-11-25 03:24:24','2025-11-27 20:30:55'),(6,7,'Isabel',0.00,0.00,1,'2025-11-25 14:01:26','2025-11-27 19:38:19'),(7,8,'Plimplim lalala',0.00,0.00,NULL,'2025-11-25 14:03:17','2025-11-27 04:39:59'),(8,9,'Luz Karen Leal Barbosa',0.00,0.00,NULL,'2025-11-25 22:37:33','2025-11-27 04:39:59'),(9,11,'julian suarez giron',0.00,0.00,2,'2025-11-27 19:33:32','2025-11-27 19:36:38'),(10,12,'pachecoS',0.00,0.00,2,'2025-11-27 19:34:12','2025-11-27 19:34:12'),(11,13,'Isabel Cristina',0.00,0.00,2,'2025-11-27 20:25:12','2025-11-27 20:25:12');
/*!40000 ALTER TABLE `saldos_cajero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_apertura`
--

DROP TABLE IF EXISTS `solicitudes_apertura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_apertura` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_usuario_rol` int DEFAULT NULL COMMENT 'Asesor que creó la solicitud (opcional)',
  `tipo_cuenta` enum('Ahorros') NOT NULL DEFAULT 'Ahorros',
  `estado` enum('Pendiente','Aprobada','Rechazada','Devuelta','Aperturada') NOT NULL DEFAULT 'Pendiente',
  `comentario_director` text,
  `comentario_asesor` text,
  `archivo` longblob,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  KEY `idx_sol_estado` (`estado`),
  KEY `idx_sol_cliente` (`id_cliente`),
  KEY `idx_sol_usuario_rol` (`id_usuario_rol`),
  CONSTRAINT `fk_sol_usuario_rol` FOREIGN KEY (`id_usuario_rol`) REFERENCES `usuario_rol` (`id_usuario_rol`) ON DELETE SET NULL,
  CONSTRAINT `solicitudes_apertura_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `solicitudes_apertura_ibfk_2` FOREIGN KEY (`id_usuario_rol`) REFERENCES `usuario_rol` (`id_usuario_rol`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_apertura`
--

LOCK TABLES `solicitudes_apertura` WRITE;
/*!40000 ALTER TABLE `solicitudes_apertura` DISABLE KEYS */;
INSERT INTO `solicitudes_apertura` VALUES (1,1,2,'Ahorros','Aprobada','Cliente cumple con todos los requisitos. Aprobado.',NULL,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(2,2,2,'Ahorros','Aprobada','Documentación completa. Aprobado.',NULL,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(3,3,2,'Ahorros','Rechazada','Información financiera incompleta. Rechazado.',NULL,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(4,4,2,'Ahorros','Aprobada','Todo en orden. Aprobado.',NULL,NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(5,5,2,'Ahorros','Aperturada','Cliente verificado. Listo para apertura de cuenta.',NULL,NULL,'2025-11-24 01:40:52','2025-11-27 01:16:52'),(6,3,5,'Ahorros','Rechazada','RECHAZADA 1','url solicitud',_binary '%PDF-1.4\n%\â\ã\Ï\Ó\n3 0 obj <</Type/XObject/ColorSpace[/Indexed/DeviceRGB 15(ðn\\nÌú¿qùó_\Ó÷.Vd]©hª\ÉT¿õRf¶Se\'_&£ð;¾+ytw)]/Subtype/Image/BitsPerComponent 4/Width 85/Length 1191/Height 83/Filter/FlateDecode>>stream\nÙ¦þù~Ú\ã\Ì\ç0\Ã_,\×b,a*[kãVô\à£\Æ{£Y¿y\×\ëG¶Wo°£\Ô\ÝÂ`Y\î<Æ¼\Ð@\ï\Ó2>®\Ö\\·²]°64ý»¯\ÌLoæµ\æDu\Õ\Îcù¾8\é\æ\ä{?\çÉ¬´\Ôl±gñJ\ßdÿ\ëW\Þ\âiCØ»Có®\Ó0¡qóN%¥Iü\Ú\ÕfG\ïø\äJ\0\Ó ª´n\ì\é\Ö\àÀ$!É÷º2²¶»5qt\ë/J\ïij/j{ªy©`l\ÉV~/:,M:º\åA³nUV¥)j¸þ;k\æþºOFkdÀRªôªN\Z\Çq{¡Vl}\\?j<§ðE$j&\\8O\\ÿw¢\çNQ\rµ\Õ\n\æø4\Ç5:DaQ\á\Ñ1¿\â\ç\Þ\Ì5\Þe d×¯ý>-`\ÓS~RÅ¿Di\Ðþ½L¬\Ø5¯\á¡+\Ýt\ÃX\ÝbZ\Íu\ÈY²´°S¦P\ÕÄ³ù¥B6~}H?H¯W\à$VeÜ.eÃöQ¡+ú>þY´gK¨]®8\ê$4C\Ô=Àú¼øk6\Ç9U= Me\íY_å±¨8\é)\"|sw \ÖL \í	úÃ´aj\ÒHõ\Ò\Å| ð\áú	\0û£0h\à5vÂ\Ñ\à¬_¥HFx°VrIV£Ð®öIõº°§\nl¹\í¡8=T\í\ÉR½xÐòÐ¹B\îø¤M%4 !X\äCÀÌ. e/\Í^T\è\ér3n\íQ\ÎùL\'\Æ\Ê\ÓE\Ù\Ñ~y¤^¡N!ÿô:Ø\ìÇ\é\0}\ÔóO\Í\Î÷ëª²i\ß$l¯M`-R&\Öö8¦¤*e¥ùZ\Ör7\ë\ãU¶z¸\àª^+j<^\Þ\æjX`©÷(kªvùÿnr¢û%Bÿt¼<\âG	\Ç\é/Í«.q·öõ:\ÚlºELZ<\'Q>&SVªfjö:\Z¯%Ò\nK*I-ll¸\Ø*º^ \í\ÓM\ÆP_bÈ®km+=i¦þ\Û\âòÜ½\ÕL±/8÷¡®aì±k\áAóü®\'$A}TKR®¤\Ô\á!\ä-\ÊkÞ¡´ª¢K! B?\è\Æ÷¦l\ZE¤0Q,L\Ï\'Á%£9\ã\á8J\áp\Ëw\á\è8\ØTo\"­G	°ñl\æ\ÅÓ÷K\n8:e²ZP:Bfú¨\Ê\Ùh_\ÆC;h£dy&;\'Aõû\äý/¡\Ù9e\ít{I;¹\ç\ê\ê?C~Dß\Æ\'þ\ÅÖ©=\"¾	x\Êþ&Åºð<Á\Ä\Ê\ÊT1ÿ;÷KýF\ÒÎª| Fnñ\ì(S\"t\Ü}Mv\ÜÚ¾dóÛ¸i&v 3\Û)¥ÂwV)z¨Ä°Ns8\ÏÖM9\n\Ã\ëUµ¾\Ï\ßÛFj\î)`d¨&t	VÖ­1\à\ÄN¹þ¾,6uØ7Í\åE:s/sªE=\çÿÁn¹Lµ\Z\ç`I \ß(h¿LþC)\å*\Æo«¶\Þá¶\ä}z¯\èFzi\nendstream\nendobj\n5 0 obj <</Type/XObject/ColorSpace/DeviceGray/Subtype/Image/BitsPerComponent 8/Width 143/Length 36/Height 99/Filter/FlateDecode>>stream\nZZhø©(¬\ny¸\"¹Ä«³D&\æ\Î/\\\èaienº\nendstream\nendobj\n6 0 obj <</Intent/Perceptual/Type/XObject/ColorSpace[/CalRGB<</Matrix[0.41239 0.21264 0.01933 0.35758 0.71517 0.11919 0.18045 0.07218 0.9504]/Gamma[2.2 2.2 2.2]/WhitePoint[0.95043 1 1.09]>>]/SMask 5 0 R/Subtype/Image/BitsPerComponent 8/Width 143/Length 6811/Height 99/Filter/FlateDecode>>stream\nf½w\ÐR86«Á¹§.9\ä=\ÈÞù«ðð\ßõ­\Ãúp!&LÏ`\ÓÞ^\Ò~=mQS\n\ä\ÊT½\Þ:\\{H§ª#\ÏC²\Þ\\\ë)Sfÿð\"S±OR\rÿÁxut\Ës\áw^!O³añ[d\ê\Ù\îe\Î}òD¼GõZK*2¶·\ê<À\Õg 2´E\Ó\Üü\Ëñ°´~¶©Å²bb½±ÿº(\ÖW0\ËÙ\âñ¥¸øm.³zò\â`\îe£a¶)pTùck| \ë`0Ë¶=_©\ï\ÇV.@bÚ g\èX^\ÞO:Á\ïå® I¼j¢T°BC³kG*\r·:(J0\æj\ÆY\ÝýBd­§\00\Æ\îxs#Qmÿe\î\êÓ\Ü>³ø°q3]¯\r\0<\Ùd+\É!\\«\Z\Ät÷\Ô\â\èÝ²ý\×f¤hEÁ\ÕÁÂDO§¤r$]\í\Ò*TD\Úû\';$wÈR)\ÃeYóD8grj©\Ðó©ð\íV\×\ç 0;½0nÃ\"Mù# =`<WDDÀ»h\ÐK»L\ï\Ã`\àô(\í#ª#¹RSûC£:W\ÓÿÁôu¥¦k¯þ¼\îhö«\äR-\ßjô\íÍ®\Ð¿G{\Ç4\Íy\ã\nC\'©A\ZÙø\ãµ\ÓTÆm\Û÷¢\ê\ênH\àöv0§P\ãEk\èkR÷\à¾5#gl³^JÁj%s±d\å\Å=<\ßE#¡ÂZ\áØ ~D¾´G£C,÷)T\Ïer\ÛÍ½ØÛ^\à\ãx«6D/S¡í¬q)zýM\ì¯\ìn6¹_¦\ì\È\à1ÙT\"Ô°KJ¥h/þ Y¿[AÍy\Ë\ÂR&\í·Nº\É\ÜV`e\Z\íÿûª=hAG\Â$Àÿ=@h·[X\éµBõYE½MxP¹\ÒÈ@©\ÖgG ~\risûQ³\äud¿aJ>\Ð\Õ@83\Ól^ULCZ\Ñ\r\rø\\*1C\æýrpwsº]}o\Z[\îû\éi\Z»ù&§\ãEb¶P·ù}]+\è\àÓª/dïú±¹\Ô.rXp0\Ý\ÝJ\×|u\ã;ó\\\Z£­\â$0t\Æ1WqP\î\Ö+W\è2\r\"\Â¹¨!ue\r¥b&ª=\nüNð)¢Ûª=oBþe?0¸.le\æË½K_\Ò\Ô\Ù!»M^\ËY\ã\æ\Û<s×»´V:E\Ý\Ânª\ÎQ¨/\í\åz£cC8y®t««´#\"øÉÀº°< ü\çH\rK.·j\ÇKS¬wZ\îóºòôC±>EEo±r¹\æ°ý c\æz\Ò6z*¢>¹$\é~¾»PM\Û\Ûm\áùg£QU·¶^6Ì©PºHüTq\Ã9w\Þ\Å\á\ß2¨M«£{ö­\Øø\"úwµü~ôº±°\ÇS\Ì\ë\äR2Ä¤\Ûd©@Ù¤3AqN,Å­9®ûu­ùX¯H-\Òm\ÊbPw\"4\ÚaU_H±\â\Ö{r\ê\Ë\0¢¾÷ ÁN\ÍF\rCÎr¤,d¨ ¬gþ\Òþ>\ÃõÛ¤d2±¥n*=[k\Í^ vñ[\"M6<W¿|Y\ÉüU\ë÷q¹h³9Ï5Y\Ó9¼­/\ÙH\Ê^:1â£G\Ñ\Ì\r¿/N5|¿\ã\È\ìk°MÀFð!«­\äQ¾4\Ù+V7u½vÙWµdñ\îLbYN\êzw{m\\~B£t~6õ:PrMZø\Ï+:e\Üáª\\lÏ©\Ôj\"1Dÿ\àqüÛÆ®Ohú}ó%\ßkÐñ8uúO£84\n@±ñ\éù1s®Xu\Ô}\Z\ÝÿkH-\ì\Ï)}ô_\ÛÍ\æ\Z\Óx\ÂN©·y\×[i»`\Üò\Üvz9l¥@\ë-:]\ï;*?À*5%hk@¬a\Å\Ç3¢\Ïó÷D(±<ù\ß`½1&®\Ð\î\Ò 3\é\Ã\ï¬&_]\Ø­\â\ÐPc¤Tú©\Êp_÷´\r\àl\"Ã°^\ä`¼Dn[»a©©\ê=±m\Ên}@4Ö°¹/^[\äh\Ùö\ìÄ¿2O5\ÊN\ÏYÏ·.±Ñ¥\ÂGþhU½r\Ð8SE<´Ï¿\ÂðØQ{ ´d¦~a9ÆKfª|\ÃtF·F\î³ìW¸ª1ô3[cx©¦5J\â5rJ\ìÿ²\Ô\æQPd%OÐ\íH#\"ûûÚªI ÁÉO^§\è1q\Z/#k¤³0ñyxß¥P¨\Û\ÇÅ®Á²§,1\ÛRQlK7+º\âmov\×Ti\ã-$9aôüÃ¾\ÉÄ<\è\æ-\á¶ùvÁ\àb©JD^/\Æ;S\Ì\ê¨\0S£à±©\ÓCû\Ì9\ë&ô/ k<)´~y0S°	·&Î·­\äl+PöõÞi%\Û\ê\Ë\ç\ß\ß\Ï\"\çrO\çÖiÃNx,Vgö¸\Â\ÚI+úò­À\×Mú2º\éÖ¼\ÙdvtpiAØ­IÃFWp\\	ð9:V\é\Òwi\Â\êûjÅ¦·t|¯Ó\à<ñTE\é\åmEL*\ä:!¥-\ãýN±\Õ:w!0\Ý:\ïHðßµ2\Ù}\îX|N`ý>1E[ \Æ\Z½»9_R´s\çNT\Ò¸·vþz\'\"{\\Fk¶,¸¿\åzß¥\édgÀµ!\Ö\Ù-\Z\â¼mK\Ì5ZoJ\ÄÛª\nO%ø=\Ìo´M«,B¼G\ã6ôò³À½þ\îT=x²\Ùj\r^\"4t?Á)½#Xo³DIR\"mVý¢§¯À\åd\'²|½[ª·MD¿@T®\å\Ó\Ú\íl\èÀÎ´`qê¬\í}PSÓ·Ù\ÎÉ>+=*\\ò©< §Eôq$O\énql«-È\Î:)¡LÃ°\ÚHÆ\Æ\Æ{0ñ\í|¹o:\Þw\î>¯®\è(\Úm±\æµ\Ëùk\äy\Ýc\ÄeÁ\"G/wX]Ñ©\ÒGòS@\ÚÌ¾\Ûö²V?\æ ZC8Ñüh¼Rõm:·C\Óø²¼ñò¥\ÜEK÷uq®\Ï\Óg\à|	#v\ä}KIùÏVmýøY\Ð\×\éþxk\íh\ÌFÀz©\Ò\×tV|cL\ïÇ®4\Ï\Ã\Î\Ý=«\îz:Q\Ã\çc\ê½y§\Å\înýñoA%X¸ûv¢o°~?\ä\Ø\à<S\ïv\Ðð\×\ày1Dq{\á°/gGq1ðLSkÞ \æ4 ¢û­L.«~Lð6·²6ùÊ4)\ç`e5\0\Ë\ÇxZyÛs;su\"¬V>È>©¨ËÕbX-\ÔQ0½÷_Hps4\Ûa\ÈW\Åq\ã&ú[\ê!\ÜV>û7÷]¯E2Î\nYª\áñzR\ÊU\àòU°7¦ÿ:D<\ÅD\Ý\Î\á\n\Ú|¾*m&$­ñÐg\Ñ\Â*tª¢¡&wk	]ö2º\îúQw»òRK\çdY2|hv)@Uh\î\Û<ó<÷°øy]\'\înöp+\á[\Ý*pç.²&}\äF[\Âoµæ¶¬\Î9úlµ\Öc\r\"D;uZÁ\ÝL!dó±ü\Åx\ß\Èj(b<÷ûÀÒ¦¡\ÙWº	\Ïa\ÎOôj\Zü¥>¼&²ú\î®0¼\Î%Pù+°ZZý.\Ä&iIyð¶»\î\Z0gå­¤\ãwa?T;\ãÑª³ò\Î\î2±Vú°\î\ê\rÒ>J$\Üu{ö¸\\KÝ£$£r+d¸µkÓ©\á®1úùH8~S\'e?\îO\Öîük@T3\è¼e\Ñ\âR*ú\ãQsõ²R\Ò÷¶)¸U\äASxT3À0²]Bd\n²PA)vÙ¹zI\0Qß g9\å\í\\ü\Ò4\ç3y©)\Ò48P_À|}\\\ÜPS=¨°c\ágJµ3{ F@C4¿ð\Î5ú®«I\Ø\çBÂ¨²§º\Z\Ä\ê\ä5j\Ï\î9Igù\Ê\Ðv¹MC2\âµ\Éô\Í\"Z	{V[\Ö,4W¯Ñ³£©\Â\Z\Í4c\ÒjK\Ë!a§Y\"Hq{>yO\â1[\Ï~\å\çñr9\æMNd\Ò: w´\×\Þ\Ú0Ð® ß\å\Íqa\Û¸Q%1:ú¸\îb°\ág\Ýù\n}\åOD÷\ß\Þùµ½\èW\ìI]x\ÔE\Æ\È\í¶\îZ\×\nAv1jH÷W7\×1\Û}Rû\Ëa%O¿Y,/\Z9z§\Ê(øU\Ì5b4Bj¬¥M#ÕDRD\æT³yóu³=½K\n4¿½\å\ß\Ô\"-D¸Q\ï;1\ê\ÓwÀp¡EAÊÀIò8§\Ð@ni\Ï\æÄ±z,E\Ée#Ô<%UÌù½&]p]5K@t\ÓÓ¨±\Ókk±\Û9\Â~3ðLM:DJq\Ã1úª±\Í>I\Ö5¶CaN\\¬&½þl\rÁ	»yb\0a\\\å\0k\Ý_\É#0À^G\"--\Ðx¼\ÈSRt¡²­A\ëQP\Ê\îö¸øßª{u+L\Ñÿó\Ëvú9}P\Õ\ã\Ë\ßsVeo\êO.\Â\Ê\â\Älh,w#\r3}¼<¶½Þ1ðS\'7.\é0\ÃJ\Ðt\Ú6\Ér³\Øõ&\\}mðJ0§¥O¢©Â*X:n»\îe{Aü\Zå£ª\ÞÛ¤Æ][ÿ*)§ ®FPÉ¾\ïmQó \Î¥±K×¦©Í?	\'ÿ\êuÞ Ã»mt\ZñS\åÃ\á­\áZ\ÈF\ÙN\ípl%\Í;H*ð\Þ\0\éºs\ßÉ¼¸g§½wZf\í\ÂöOC=õ\ä÷§\"\Ï\Ø\×û4\Ëm_\ÄEÓ½±;s\ßWt¯ å·h½ý\Ý \Ü\ÆCBoÝx	#\ëj\\ |Ýþ\Ñ2\Ût\ßy> :\Ö\ÛTõ=¶¥oNÿ\ê0üMZ\ra\ÃØ E«¬\Ð=\È\r\êQ58X\ÑÆkb\'¯nû»û\àU\âÏªiÎ¿\":¹¨\ä\ÕÝ\ËòLz\ÐP«\è[XK±G_ó\ÇóETz,\n¹\É\Õ2Q÷\Ó\nm0Ztl[\æ÷Lû~\Ëjª\é7ðÝ·\Â\ÞJzl¶»výùbU*nV\âK}jôl\Ùþµ®KZP\Ü2Mb\\8]¸A<gZ?\ç.ö§\ÉD¸\Ïs]\ÄDµ\ën¼ô5{¥+/\â·+\ËBWDUr\r\ÚIý4¬a=BfpõB\í\ç\×Ú¹G eO\âFW\Ívd÷«4;·ñQ\ïó )_@¼½eOcõ\ÃM\á0ÿ;}±¹º÷òôÝ¨@[O^¿÷º)jR\à\\ylB\ïBP8ZKÌ§.°\î÷½*UÛS©ýº²­\×ý\ÅC#+¡Pl­;\0#eø?\Ïÿ\ØG6j§%g÷\æR\íe\åA®V¯º\Ò5^\0hõ©\Å>º\ä(>|*ö4õ_<\Z\ãfX3tY7½h¬«<8¥ù`\Ý\Ñ\íZªºåÓ1ùFñ\Ñ@\Ý\"S4¼X\'\àÛAn\Ý\Þÿ¸\'\áÔ±	^aB\àÁ\ê\åô´ù;4Lü¡dScb/JO\åP9úý\Ñ\Ï\n]×\Ì\Ö22\Ç\Ë&¬NÝ±?qñMSñ\Õ\Õóÿ°Xô/C\Ì¥µ\'¢\î0B\à\Z,µo<eBÙ´*ñù¿)Ýü-\îG\É\ä\Ú1õ³S­¸\Ô\ÅZ\\¼Ô¬¥\ìM\ïY\Æ-RÊ¦\ä#*\ÒV\Î]R\'\âv\Å\Ç]j¶^ªEX\Ñx§>\'\Zw)aÀ1T\Í¸#\äÇ¼O¼¢ \Ä$þ\"Axju\Ó[rP·\Ã\Ì\Ï.\Ø\ïÀ\Ú\Âri­\æ\ç7CjÄ§Eªø+ú´û«$(MgE¯«\èw¿ô·/wÅssG¢\ät!(vJ¯B\Ìm\Î\ÆCS!\ïÏO\ÄE{ùé·_û>yümÿª¾\0e}mHÆºEyÛ¾\Ùn\Üø8\ä\×rù]= \\OKh-F}úæ¿\×øÁ7\ê\Å\âÊ\æWeHZL-ÿó_r·À»\æ\Æiû^\î±W©.\ë*H¸V	¯Gu¿D\Å{\Õ\ÖÍ§)§|\\\Ü$øeM\ådFî§¥\Ëó>Xòò¹¸v[ß¹#\Îý4\08úAV±©ð try´7|>u¨D®\Ò`Gwþÿ¢¢W]t%cpz:Áó\ßõk.\Ï\ËMIjG\ß&·	02zyÎ4\Õ&4\Ë\é\Õû¼\ÝýOs_~nÜo¬aG\Â.rs\ÍU%Áx)J:5l\0qª\0\Æ3*M\ÒGÈ¹w^\æ\î¢oúnðR ûn>Sbz¼\è´ø¦ò÷\É´\Ç\\b\í&#Î\ì«spûPi9\ï8§\ë#´	=û¥\×<ix°+{\áüÿ\ì\êO/\êEQÏu©~8x$öW\Ù\Ú1¬\Z<g\éõôõmo\ÕoÔ\ê\ê\à¤.*k\Ê3ý6Q]^Vð¸\ÎV%c¹hô`¨­Bý¹j\Ø\ÍZ¶\ÄZFfBlù+\Ê%Zµb5¶¿[\\\Ñý¼1/\írAV8j\ÚÉ´U8»+ °Þn¯p(|\Ã¼\á<vw\Ë%ª«bn=ú\ã\É\ØÊh-\ã\ê\ß&¿_jY~V¢(g¤«hgô¥¨6\ÃµxµD®^\Ñ Ï±;eø¯*ùq\Ä3³\Íu¬þ<	UJ3\á|\ÊYÀ÷¸{\0\\Kü¶¼þMÀ~wÉRJzÆx\Û{Yò\Ë\È\Ô=\\\ëô\ãÍ«m»!\Ðÿ¶±+g\ÜÞ¿R3LEPf\è¤ýl\Ë/O~\ÛO \î	\Å};ºQ\é#ôfÖ±1ú¢Hm Ã¥\ÜÒ¦«q3f	÷ñ4_NPN \Ùîµ¼_R\Ý\\û\ë\Ô[\ÙÎ¿ø7Y¿<)ýÏ«?,\âC\Þù5tw ;75\Ç\Âó?\\ý:ÿèy\ä¦\Ó\ê\Æ1¥?/S\ÈQ\\¢µR&ui\Ç\íd\"B;¾-%ÒT\0\å\nbè£ºJ4µ7\nºNªN\\\Û9_¸\Ò\ìF¸\æ\ÓK\Ç\ÓB=W¥\îúj7>U~\à^¨ /3d²\r\è%4ª\Â<K&\Ê==u~_~j\Í:^\Äß±7Á>\äZð\á\Ù!c\ËÅ\Ú\ÒiCl?\ÕSS²\Ú9Q&¢·<m¶­«\á>µ(\âQ\ÝýÖ§B\Åg¸\á®Ñ­¿d\êTØu\Z\Û;ÖR~pC¿Iu^\nD)Q8l\"\ê\0-]\Ë{£U\ê2Z\ÓÃÿañ²÷\0¸.\Ä\Ê\Ð÷½4\ì5º `ú+)°{Zµ\ì²|ES-ô¨ þ\"\0´	\è\'\Þ^©±F ù¹\Ý\Ï[\ËQ\Õ\ß\0+\îi\Â<Dø\ã\Zx\éLv¡IrýZ\Ó\ßf¢:\Í<\ã?\ë\Ï)?,²\ÆN»2\È\Ùu<Mr¦ \à3q7s\Ø?Ri½°GJÜ§ªn½£¬M­d0\Ò~\Zò\\[·iÁ\àúÿwh\ÃI­)é©¡}YF\Ö6\Çã¥±c\ì\à\'ñNóñaUþ¸7­CxUa¥Ú¼³û\èüÁ\ÈiV\é\ã\ìÊ¥\É\ä\\õýý¬9px!i»	)Õ¤\ïû¯8òh!Vüm\å*µ¨þ 5cu³¬E°¡+¸\ìxz+\îj/\Æ\á¡­\âQ\Ç\Å\Ë-vÆ¨\Ö\ßù\n^-£¢U6¸	t(¯;^^þ\ÆB\ã¼\Ñk~¤5áº¤\ê¢j\Â^ý\rÇ9É³Ij\Úo À$\ê¸8~F.ô¡³:\ZyO\Âv,Û¨ 0÷Tló¢\í35ú\Ã\àú]ü7m\Ñ\ÞW«\Ùp»?ÓR\ã:y¯°éªµ\ì8¾¸§\ÕC/B<\Ï\0«¿oûsN\n¦xò«\Åú\ë¦Å\ÔO#\è\à0$P\'õøE@=H+qÿ.¢1õ(\ÝKt¡¦ª\í@\Ô\Ò#\Z~ü3\Â\Ã\Z39¨\ât·\Öd!^¤\Ûõdp\Ç\ÎO6Õ§\É\ÜÖ³©ÿÑF\ãf@h,nT±>©ù:V!yÿG½*M4\Ä0\Öp\ÈõI¿\à©\á÷µ593\'6\Ê$gdV»ä§\n\0>ú+h,½s½¿]JõcR¿Q\×\ÈU-\0\Ô9aÏª91\æ»\Ð\×\Ë-Y\'v~»¡\Ý\ÂûJW£\ÆI\Z\ÐO.ñ_[Dö0vªñ32¸\í&¨+xj\Ò\Ï7e¶\Û\Ê#$¬\Ú\êö_[Ò¨\ä\\x6§\ßþµ¨.K[¦Y\ÚU¢ÀÍ¯ØSO\Ä\ÉtMÂ\Ýl¨¿=\ÙV\ç%3ðþjRBNc3»Ä±tÀ>0TJ[=°^\ÈGT\É²û?\Ý7dþúªÿ@\Ü[JD«I²Z©4ôQ`\ÏüËg£òô¿\ß\ÃTV~¯\na\"¼E/=Vò ¶° \ÏZk_$¾\Ã=LD?0 ¯W$Nrùq->@\Æ,s5|Ô¤öD\ÍwI©\åò/÷u/s\0¢ú«$þh£hS:b\ìuÙ\áZý\0·\Ðõøcy_´\è5ß¶8s\ÅÓ¿t­\ì\Æp¥\ã {D\0X<cn\ë\ÔXTP»(¢-\ã\æTYºÏ¤ü¿øU¹¯\Ù\0±µó\nendstream\nendobj\n7 0 obj <</Length 1340/Filter/FlateDecode>>stream\n\Üa¹RÌæ¹I=lia¶¤\îE\Íö¡\È\Z\ï\ÇyÍ¼¢¯ó#ö©a#U\Ýe¶\ÓýQpõºqÁß¤5û&y¬®\Æ`4\r»¡½\Ú7¿Ø¶8-û-Ev·Vüÿýh\ì\Ú\Í7Os¥ºù|O\n¯_[Ó¯C)lÄa6\Ïö#ù<\×@·\é\×n\Úð¯\ì\Â6³\Ï2x\ÞÓªf(F\"°I£\éºñ!\íH\n5;Sý\×\é\ÛÍ¾\Ð\èc»õs\äø¾^ã\á\Ø °\æ¦\"¤Ux\0mç·¡\ÆFI|I*\Ù\n³$wp÷Êºl¼ü<2\ã%\É	.E\æm\ÕéÅ®2÷9\î(-,÷Rk<b[VF\ç\ØF9\ÄTý ®\ægé´.\ß\é\î\Ë,;\åM\Ù^9Á`w\Â\Ú\'\Äø\ËT½\Ò\n\ín@\Â9\ã¡7\ÝPoWa5\Ï+{Q\å\àd\Â9­\\þÉ£¢9y\ÉÀ \Î%²Á\áp:\×\ÓIÎ«a\è(Cö¶{\ìðAÁ¼¶ºQ¸ºa)&lz\Æztä¤¸\ÓÄ±F@0\ÈlL÷r\ÈhC,c\Ô\ÕZ\êñð©¹x=8%;þ0Â¶\Ð\ä&4\ì\âa\rzt01p±/ÿ\ÂEgö,ø\æMS\ídÁN|WWDa\0\Æ\Äq:dze\Õ\Ø\r4\Ìvû&2B\Ú\\_yô\Ùÿ§j÷Ci½¦@à®ZnZTølÉ¬â I(Fq\ï\ØE\îlPW§\É\'iGI\Ù\Ý+êµ&¤R;T0úø¼1\0²y\Ö<~¿)\äÂqA\Ë-&\Ç8NÂ´ðû§Ï\Å2ù¯+\Ý=us£p×¬\Ú\ßG\ÆÖ¾Ø³\"þ-Ø«¯O\Ç/\Ý y´\ßö0\Æbõû\à¶ò;ð+\Ön\ç\Í{\æµ\Ûü( )h¾\Ò,ø@\è¾\áÙ\ã\Ø\0{k d0Ym\Û/À.!0\ËX\ç!\Â\×Ds\á\0º}K7V}[)s~\Ü\ìF ¨È\åø\í·i£7me­9Õ§]¶¿O³Zi·×büU«\ãt\Ö6õ1	YR\ÖC¸#½±ß\àV¶4¢²=\Ú\Ý\Z}85¯lo¼j|â´a¯]µ\å}¼@ú§Rûf\ë~\ß\âZ,\Ùq^ûDNB\ä/\àÂ\Ú\Ã?Ê¼¿0,¼£¦M Dmµ±=2\Z6¸ ­¬_{~µøÀjn§o1£\Ö\Ì0wy¯Ph)§\\\îe¤Mu\Ê/\Ü>\Äö\Ü%1_<\Ù*\Ëï­þö:¾¡\Ú®~jQWÍ\Î&÷V0\êZ\ë-6ý9\ìö	òwu¾\ÄtÑ£Í/ý\Ý\ä\'ýV\âE3\ÕQ¬Þ¤È·\Öú¼îý\î\Ì*CgjrþV\Î\ÏwP\Úý° 57¼\æ#ci\Äcj,b\n\ÑO^Ôª\Ê\'ùB\Z\ë\'»0i\äôAH¤`ê¸­<.|xp_w¢m¸\Öfüz¼X\Èb<{{\ÅO~\Æñf\Õ\ÍSn×»[K\Î\nC¼Z«»\Ït\ÏÀ\í\ÌuÀ8m)1l\Î2»¬ýôEb\"R9}a)\ï\ÅRÅ³¿FH\Zy\âo@þVYÁ/V[ÉÝÿ\×\ã\r\0B¹f\àp!\r½Á\Ë\'f9d	\ì\ë\Æ>?=lKý\å$\ÉßPiTÚ«A}\Ð	\Õ]µ\ÈÀ¸©	m\ép\Ì1Á\\Øs©AøðP][ðª\ÒûEG­þx[ÿ8\nendstream\nendobj\n1 0 obj<</Parent 8 0 R/Contents 7 0 R/Type/Page/Resources<</XObject<</img2 6 0 R/img1 5 0 R/img0 3 0 R>>/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]/Font<</F1 2 0 R/F2 4 0 R>>>>/MediaBox[0 0 612 800]>>\nendobj\n9 0 obj[1 0 R/XYZ 0 812 0]\nendobj\n4 0 obj<</BaseFont/Helvetica-Bold/Type/Font/Encoding/WinAnsiEncoding/Subtype/Type1>>\nendobj\n2 0 obj<</BaseFont/Helvetica/Type/Font/Encoding/WinAnsiEncoding/Subtype/Type1>>\nendobj\n8 0 obj<</Type/Pages/Count 1/Kids[1 0 R]>>\nendobj\n10 0 obj<</Names[(òw%£qsOÃYü\Z?\ÏD³\É) 9 0 R]>>\nendobj\n11 0 obj<</Dests 10 0 R>>\nendobj\n12 0 obj<</Names 11 0 R/Type/Catalog/Pages 8 0 R>>\nendobj\n13 0 obj<</Creator(l`ý\î;¬ö¥\íg0UfP\ã\ÔRp.ó>\'_Ð\Ø\ê\\b\\\\*E·\Ó\ç`ö\ï\\\\\Êp*4\Ô-08¨.ÿü¸\äù\Ú|*?v@¾ó\ë)/Producer(OU\ë\æ*þ\Ì\á¬-\Õk73\ê\ÉZq.õq\'Y\Ò\Å)/ModDate(b;¼®l\ë\Ò\ç³\'\Åv@~!«C&w·)/CreationDate(b;¼®l\ë\Ò\ç³\'\Åv@~!«C&w·)>>\nendobj\n14 0 obj<</U (qÁ=¥Õ»f%\Ô\\f\ä^duòÇ¡\È\Ûk¨\×A\ÄÌ¥)/V 1/O (!¹·\Ñ\äB\\)\í¡1\Ñ\ÆKW{<\ã¥\êÌ·\èn\'¿a¨K\\f)/P -60/Filter/Standard/R 2>>\nendobj\nxref\n0 15\n0000000000 65535 f \n0000010146 00000 n \n0000010482 00000 n \n0000000015 00000 n \n0000010390 00000 n \n0000001424 00000 n \n0000001614 00000 n \n0000008738 00000 n \n0000010569 00000 n \n0000010356 00000 n \n0000010619 00000 n \n0000010673 00000 n \n0000010706 00000 n \n0000010764 00000 n \n0000010981 00000 n \ntrailer\n<</Root 12 0 R/ID [<bc9e45fa2d75f14f895b0c7dda8bf328><7ecc7b4254da0cf7778ae26e5444d8c0>]/Encrypt 14 0 R/Info 13 0 R/Size 15>>\nstartxref\n11108\n%%EOF\n','2025-11-25 02:33:48','2025-11-25 03:20:43'),(7,3,5,'Ahorros','Aprobada',NULL,'url solicitud',_binary '%PDF-1.4\n%\â\ã\Ï\Ó\n3 0 obj <</Type/XObject/ColorSpace[/Indexed/DeviceRGB 15(ðn\\nÌú¿qùó_\Ó÷.Vd]©hª\ÉT¿õRf¶Se\'_&£ð;¾+ytw)]/Subtype/Image/BitsPerComponent 4/Width 85/Length 1191/Height 83/Filter/FlateDecode>>stream\nÙ¦þù~Ú\ã\Ì\ç0\Ã_,\×b,a*[kãVô\à£\Æ{£Y¿y\×\ëG¶Wo°£\Ô\ÝÂ`Y\î<Æ¼\Ð@\ï\Ó2>®\Ö\\·²]°64ý»¯\ÌLoæµ\æDu\Õ\Îcù¾8\é\æ\ä{?\çÉ¬´\Ôl±gñJ\ßdÿ\ëW\Þ\âiCØ»Có®\Ó0¡qóN%¥Iü\Ú\ÕfG\ïø\äJ\0\Ó ª´n\ì\é\Ö\àÀ$!É÷º2²¶»5qt\ë/J\ïij/j{ªy©`l\ÉV~/:,M:º\åA³nUV¥)j¸þ;k\æþºOFkdÀRªôªN\Z\Çq{¡Vl}\\?j<§ðE$j&\\8O\\ÿw¢\çNQ\rµ\Õ\n\æø4\Ç5:DaQ\á\Ñ1¿\â\ç\Þ\Ì5\Þe d×¯ý>-`\ÓS~RÅ¿Di\Ðþ½L¬\Ø5¯\á¡+\Ýt\ÃX\ÝbZ\Íu\ÈY²´°S¦P\ÕÄ³ù¥B6~}H?H¯W\à$VeÜ.eÃöQ¡+ú>þY´gK¨]®8\ê$4C\Ô=Àú¼øk6\Ç9U= Me\íY_å±¨8\é)\"|sw \ÖL \í	úÃ´aj\ÒHõ\Ò\Å| ð\áú	\0û£0h\à5vÂ\Ñ\à¬_¥HFx°VrIV£Ð®öIõº°§\nl¹\í¡8=T\í\ÉR½xÐòÐ¹B\îø¤M%4 !X\äCÀÌ. e/\Í^T\è\ér3n\íQ\ÎùL\'\Æ\Ê\ÓE\Ù\Ñ~y¤^¡N!ÿô:Ø\ìÇ\é\0}\ÔóO\Í\Î÷ëª²i\ß$l¯M`-R&\Öö8¦¤*e¥ùZ\Ör7\ë\ãU¶z¸\àª^+j<^\Þ\æjX`©÷(kªvùÿnr¢û%Bÿt¼<\âG	\Ç\é/Í«.q·öõ:\ÚlºELZ<\'Q>&SVªfjö:\Z¯%Ò\nK*I-ll¸\Ø*º^ \í\ÓM\ÆP_bÈ®km+=i¦þ\Û\âòÜ½\ÕL±/8÷¡®aì±k\áAóü®\'$A}TKR®¤\Ô\á!\ä-\ÊkÞ¡´ª¢K! B?\è\Æ÷¦l\ZE¤0Q,L\Ï\'Á%£9\ã\á8J\áp\Ëw\á\è8\ØTo\"­G	°ñl\æ\ÅÓ÷K\n8:e²ZP:Bfú¨\Ê\Ùh_\ÆC;h£dy&;\'Aõû\äý/¡\Ù9e\ít{I;¹\ç\ê\ê?C~Dß\Æ\'þ\ÅÖ©=\"¾	x\Êþ&Åºð<Á\Ä\Ê\ÊT1ÿ;÷KýF\ÒÎª| Fnñ\ì(S\"t\Ü}Mv\ÜÚ¾dóÛ¸i&v 3\Û)¥ÂwV)z¨Ä°Ns8\ÏÖM9\n\Ã\ëUµ¾\Ï\ßÛFj\î)`d¨&t	VÖ­1\à\ÄN¹þ¾,6uØ7Í\åE:s/sªE=\çÿÁn¹Lµ\Z\ç`I \ß(h¿LþC)\å*\Æo«¶\Þá¶\ä}z¯\èFzi\nendstream\nendobj\n5 0 obj <</Type/XObject/ColorSpace/DeviceGray/Subtype/Image/BitsPerComponent 8/Width 143/Length 36/Height 99/Filter/FlateDecode>>stream\nZZhø©(¬\ny¸\"¹Ä«³D&\æ\Î/\\\èaienº\nendstream\nendobj\n6 0 obj <</Intent/Perceptual/Type/XObject/ColorSpace[/CalRGB<</Matrix[0.41239 0.21264 0.01933 0.35758 0.71517 0.11919 0.18045 0.07218 0.9504]/Gamma[2.2 2.2 2.2]/WhitePoint[0.95043 1 1.09]>>]/SMask 5 0 R/Subtype/Image/BitsPerComponent 8/Width 143/Length 6811/Height 99/Filter/FlateDecode>>stream\nf½w\ÐR86«Á¹§.9\ä=\ÈÞù«ðð\ßõ­\Ãúp!&LÏ`\ÓÞ^\Ò~=mQS\n\ä\ÊT½\Þ:\\{H§ª#\ÏC²\Þ\\\ë)Sfÿð\"S±OR\rÿÁxut\Ës\áw^!O³añ[d\ê\Ù\îe\Î}òD¼GõZK*2¶·\ê<À\Õg 2´E\Ó\Üü\Ëñ°´~¶©Å²bb½±ÿº(\ÖW0\ËÙ\âñ¥¸øm.³zò\â`\îe£a¶)pTùck| \ë`0Ë¶=_©\ï\ÇV.@bÚ g\èX^\ÞO:Á\ïå® I¼j¢T°BC³kG*\r·:(J0\æj\ÆY\ÝýBd­§\00\Æ\îxs#Qmÿe\î\êÓ\Ü>³ø°q3]¯\r\0<\Ùd+\É!\\«\Z\Ät÷\Ô\â\èÝ²ý\×f¤hEÁ\ÕÁÂDO§¤r$]\í\Ò*TD\Úû\';$wÈR)\ÃeYóD8grj©\Ðó©ð\íV\×\ç 0;½0nÃ\"Mù# =`<WDDÀ»h\ÐK»L\ï\Ã`\àô(\í#ª#¹RSûC£:W\ÓÿÁôu¥¦k¯þ¼\îhö«\äR-\ßjô\íÍ®\Ð¿G{\Ç4\Íy\ã\nC\'©A\ZÙø\ãµ\ÓTÆm\Û÷¢\ê\ênH\àöv0§P\ãEk\èkR÷\à¾5#gl³^JÁj%s±d\å\Å=<\ßE#¡ÂZ\áØ ~D¾´G£C,÷)T\Ïer\ÛÍ½ØÛ^\à\ãx«6D/S¡í¬q)zýM\ì¯\ìn6¹_¦\ì\È\à1ÙT\"Ô°KJ¥h/þ Y¿[AÍy\Ë\ÂR&\í·Nº\É\ÜV`e\Z\íÿûª=hAG\Â$Àÿ=@h·[X\éµBõYE½MxP¹\ÒÈ@©\ÖgG ~\risûQ³\äud¿aJ>\Ð\Õ@83\Ól^ULCZ\Ñ\r\rø\\*1C\æýrpwsº]}o\Z[\îû\éi\Z»ù&§\ãEb¶P·ù}]+\è\àÓª/dïú±¹\Ô.rXp0\Ý\ÝJ\×|u\ã;ó\\\Z£­\â$0t\Æ1WqP\î\Ö+W\è2\r\"\Â¹¨!ue\r¥b&ª=\nüNð)¢Ûª=oBþe?0¸.le\æË½K_\Ò\Ô\Ù!»M^\ËY\ã\æ\Û<s×»´V:E\Ý\Ânª\ÎQ¨/\í\åz£cC8y®t««´#\"øÉÀº°< ü\çH\rK.·j\ÇKS¬wZ\îóºòôC±>EEo±r¹\æ°ý c\æz\Ò6z*¢>¹$\é~¾»PM\Û\Ûm\áùg£QU·¶^6Ì©PºHüTq\Ã9w\Þ\Å\á\ß2¨M«£{ö­\Øø\"úwµü~ôº±°\ÇS\Ì\ë\äR2Ä¤\Ûd©@Ù¤3AqN,Å­9®ûu­ùX¯H-\Òm\ÊbPw\"4\ÚaU_H±\â\Ö{r\ê\Ë\0¢¾÷ ÁN\ÍF\rCÎr¤,d¨ ¬gþ\Òþ>\ÃõÛ¤d2±¥n*=[k\Í^ vñ[\"M6<W¿|Y\ÉüU\ë÷q¹h³9Ï5Y\Ó9¼­/\ÙH\Ê^:1â£G\Ñ\Ì\r¿/N5|¿\ã\È\ìk°MÀFð!«­\äQ¾4\Ù+V7u½vÙWµdñ\îLbYN\êzw{m\\~B£t~6õ:PrMZø\Ï+:e\Üáª\\lÏ©\Ôj\"1Dÿ\àqüÛÆ®Ohú}ó%\ßkÐñ8uúO£84\n@±ñ\éù1s®Xu\Ô}\Z\ÝÿkH-\ì\Ï)}ô_\ÛÍ\æ\Z\Óx\ÂN©·y\×[i»`\Üò\Üvz9l¥@\ë-:]\ï;*?À*5%hk@¬a\Å\Ç3¢\Ïó÷D(±<ù\ß`½1&®\Ð\î\Ò 3\é\Ã\ï¬&_]\Ø­\â\ÐPc¤Tú©\Êp_÷´\r\àl\"Ã°^\ä`¼Dn[»a©©\ê=±m\Ên}@4Ö°¹/^[\äh\Ùö\ìÄ¿2O5\ÊN\ÏYÏ·.±Ñ¥\ÂGþhU½r\Ð8SE<´Ï¿\ÂðØQ{ ´d¦~a9ÆKfª|\ÃtF·F\î³ìW¸ª1ô3[cx©¦5J\â5rJ\ìÿ²\Ô\æQPd%OÐ\íH#\"ûûÚªI ÁÉO^§\è1q\Z/#k¤³0ñyxß¥P¨\Û\ÇÅ®Á²§,1\ÛRQlK7+º\âmov\×Ti\ã-$9aôüÃ¾\ÉÄ<\è\æ-\á¶ùvÁ\àb©JD^/\Æ;S\Ì\ê¨\0S£à±©\ÓCû\Ì9\ë&ô/ k<)´~y0S°	·&Î·­\äl+PöõÞi%\Û\ê\Ë\ç\ß\ß\Ï\"\çrO\çÖiÃNx,Vgö¸\Â\ÚI+úò­À\×Mú2º\éÖ¼\ÙdvtpiAØ­IÃFWp\\	ð9:V\é\Òwi\Â\êûjÅ¦·t|¯Ó\à<ñTE\é\åmEL*\ä:!¥-\ãýN±\Õ:w!0\Ý:\ïHðßµ2\Ù}\îX|N`ý>1E[ \Æ\Z½»9_R´s\çNT\Ò¸·vþz\'\"{\\Fk¶,¸¿\åzß¥\édgÀµ!\Ö\Ù-\Z\â¼mK\Ì5ZoJ\ÄÛª\nO%ø=\Ìo´M«,B¼G\ã6ôò³À½þ\îT=x²\Ùj\r^\"4t?Á)½#Xo³DIR\"mVý¢§¯À\åd\'²|½[ª·MD¿@T®\å\Ó\Ú\íl\èÀÎ´`qê¬\í}PSÓ·Ù\ÎÉ>+=*\\ò©< §Eôq$O\énql«-È\Î:)¡LÃ°\ÚHÆ\Æ\Æ{0ñ\í|¹o:\Þw\î>¯®\è(\Úm±\æµ\Ëùk\äy\Ýc\ÄeÁ\"G/wX]Ñ©\ÒGòS@\ÚÌ¾\Ûö²V?\æ ZC8Ñüh¼Rõm:·C\Óø²¼ñò¥\ÜEK÷uq®\Ï\Óg\à|	#v\ä}KIùÏVmýøY\Ð\×\éþxk\íh\ÌFÀz©\Ò\×tV|cL\ïÇ®4\Ï\Ã\Î\Ý=«\îz:Q\Ã\çc\ê½y§\Å\înýñoA%X¸ûv¢o°~?\ä\Ø\à<S\ïv\Ðð\×\ày1Dq{\á°/gGq1ðLSkÞ \æ4 ¢û­L.«~Lð6·²6ùÊ4)\ç`e5\0\Ë\ÇxZyÛs;su\"¬V>È>©¨ËÕbX-\ÔQ0½÷_Hps4\Ûa\ÈW\Åq\ã&ú[\ê!\ÜV>û7÷]¯E2Î\nYª\áñzR\ÊU\àòU°7¦ÿ:D<\ÅD\Ý\Î\á\n\Ú|¾*m&$­ñÐg\Ñ\Â*tª¢¡&wk	]ö2º\îúQw»òRK\çdY2|hv)@Uh\î\Û<ó<÷°øy]\'\înöp+\á[\Ý*pç.²&}\äF[\Âoµæ¶¬\Î9úlµ\Öc\r\"D;uZÁ\ÝL!dó±ü\Åx\ß\Èj(b<÷ûÀÒ¦¡\ÙWº	\Ïa\ÎOôj\Zü¥>¼&²ú\î®0¼\Î%Pù+°ZZý.\Ä&iIyð¶»\î\Z0gå­¤\ãwa?T;\ãÑª³ò\Î\î2±Vú°\î\ê\rÒ>J$\Üu{ö¸\\KÝ£$£r+d¸µkÓ©\á®1úùH8~S\'e?\îO\Öîük@T3\è¼e\Ñ\âR*ú\ãQsõ²R\Ò÷¶)¸U\äASxT3À0²]Bd\n²PA)vÙ¹zI\0Qß g9\å\í\\ü\Ò4\ç3y©)\Ò48P_À|}\\\ÜPS=¨°c\ágJµ3{ F@C4¿ð\Î5ú®«I\Ø\çBÂ¨²§º\Z\Ä\ê\ä5j\Ï\î9Igù\Ê\Ðv¹MC2\âµ\Éô\Í\"Z	{V[\Ö,4W¯Ñ³£©\Â\Z\Í4c\ÒjK\Ë!a§Y\"Hq{>yO\â1[\Ï~\å\çñr9\æMNd\Ò: w´\×\Þ\Ú0Ð® ß\å\Íqa\Û¸Q%1:ú¸\îb°\ág\Ýù\n}\åOD÷\ß\Þùµ½\èW\ìI]x\ÔE\Æ\È\í¶\îZ\×\nAv1jH÷W7\×1\Û}Rû\Ëa%O¿Y,/\Z9z§\Ê(øU\Ì5b4Bj¬¥M#ÕDRD\æT³yóu³=½K\n4¿½\å\ß\Ô\"-D¸Q\ï;1\ê\ÓwÀp¡EAÊÀIò8§\Ð@ni\Ï\æÄ±z,E\Ée#Ô<%UÌù½&]p]5K@t\ÓÓ¨±\Ókk±\Û9\Â~3ðLM:DJq\Ã1úª±\Í>I\Ö5¶CaN\\¬&½þl\rÁ	»yb\0a\\\å\0k\Ý_\É#0À^G\"--\Ðx¼\ÈSRt¡²­A\ëQP\Ê\îö¸øßª{u+L\Ñÿó\Ëvú9}P\Õ\ã\Ë\ßsVeo\êO.\Â\Ê\â\Älh,w#\r3}¼<¶½Þ1ðS\'7.\é0\ÃJ\Ðt\Ú6\Ér³\Øõ&\\}mðJ0§¥O¢©Â*X:n»\îe{Aü\Zå£ª\ÞÛ¤Æ][ÿ*)§ ®FPÉ¾\ïmQó \Î¥±K×¦©Í?	\'ÿ\êuÞ Ã»mt\ZñS\åÃ\á­\áZ\ÈF\ÙN\ípl%\Í;H*ð\Þ\0\éºs\ßÉ¼¸g§½wZf\í\ÂöOC=õ\ä÷§\"\Ï\Ø\×û4\Ëm_\ÄEÓ½±;s\ßWt¯ å·h½ý\Ý \Ü\ÆCBoÝx	#\ëj\\ |Ýþ\Ñ2\Ût\ßy> :\Ö\ÛTõ=¶¥oNÿ\ê0üMZ\ra\ÃØ E«¬\Ð=\È\r\êQ58X\ÑÆkb\'¯nû»û\àU\âÏªiÎ¿\":¹¨\ä\ÕÝ\ËòLz\ÐP«\è[XK±G_ó\ÇóETz,\n¹\É\Õ2Q÷\Ó\nm0Ztl[\æ÷Lû~\Ëjª\é7ðÝ·\Â\ÞJzl¶»výùbU*nV\âK}jôl\Ùþµ®KZP\Ü2Mb\\8]¸A<gZ?\ç.ö§\ÉD¸\Ïs]\ÄDµ\ën¼ô5{¥+/\â·+\ËBWDUr\r\ÚIý4¬a=BfpõB\í\ç\×Ú¹G eO\âFW\Ívd÷«4;·ñQ\ïó )_@¼½eOcõ\ÃM\á0ÿ;}±¹º÷òôÝ¨@[O^¿÷º)jR\à\\ylB\ïBP8ZKÌ§.°\î÷½*UÛS©ýº²­\×ý\ÅC#+¡Pl­;\0#eø?\Ïÿ\ØG6j§%g÷\æR\íe\åA®V¯º\Ò5^\0hõ©\Å>º\ä(>|*ö4õ_<\Z\ãfX3tY7½h¬«<8¥ù`\Ý\Ñ\íZªºåÓ1ùFñ\Ñ@\Ý\"S4¼X\'\àÛAn\Ý\Þÿ¸\'\áÔ±	^aB\àÁ\ê\åô´ù;4Lü¡dScb/JO\åP9úý\Ñ\Ï\n]×\Ì\Ö22\Ç\Ë&¬NÝ±?qñMSñ\Õ\Õóÿ°Xô/C\Ì¥µ\'¢\î0B\à\Z,µo<eBÙ´*ñù¿)Ýü-\îG\É\ä\Ú1õ³S­¸\Ô\ÅZ\\¼Ô¬¥\ìM\ïY\Æ-RÊ¦\ä#*\ÒV\Î]R\'\âv\Å\Ç]j¶^ªEX\Ñx§>\'\Zw)aÀ1T\Í¸#\äÇ¼O¼¢ \Ä$þ\"Axju\Ó[rP·\Ã\Ì\Ï.\Ø\ïÀ\Ú\Âri­\æ\ç7CjÄ§Eªø+ú´û«$(MgE¯«\èw¿ô·/wÅssG¢\ät!(vJ¯B\Ìm\Î\ÆCS!\ïÏO\ÄE{ùé·_û>yümÿª¾\0e}mHÆºEyÛ¾\Ùn\Üø8\ä\×rù]= \\OKh-F}úæ¿\×øÁ7\ê\Å\âÊ\æWeHZL-ÿó_r·À»\æ\Æiû^\î±W©.\ë*H¸V	¯Gu¿D\Å{\Õ\ÖÍ§)§|\\\Ü$øeM\ådFî§¥\Ëó>Xòò¹¸v[ß¹#\Îý4\08úAV±©ð try´7|>u¨D®\Ò`Gwþÿ¢¢W]t%cpz:Áó\ßõk.\Ï\ËMIjG\ß&·	02zyÎ4\Õ&4\Ë\é\Õû¼\ÝýOs_~nÜo¬aG\Â.rs\ÍU%Áx)J:5l\0qª\0\Æ3*M\ÒGÈ¹w^\æ\î¢oúnðR ûn>Sbz¼\è´ø¦ò÷\É´\Ç\\b\í&#Î\ì«spûPi9\ï8§\ë#´	=û¥\×<ix°+{\áüÿ\ì\êO/\êEQÏu©~8x$öW\Ù\Ú1¬\Z<g\éõôõmo\ÕoÔ\ê\ê\à¤.*k\Ê3ý6Q]^Vð¸\ÎV%c¹hô`¨­Bý¹j\Ø\ÍZ¶\ÄZFfBlù+\Ê%Zµb5¶¿[\\\Ñý¼1/\írAV8j\ÚÉ´U8»+ °Þn¯p(|\Ã¼\á<vw\Ë%ª«bn=ú\ã\É\ØÊh-\ã\ê\ß&¿_jY~V¢(g¤«hgô¥¨6\ÃµxµD®^\Ñ Ï±;eø¯*ùq\Ä3³\Íu¬þ<	UJ3\á|\ÊYÀ÷¸{\0\\Kü¶¼þMÀ~wÉRJzÆx\Û{Yò\Ë\È\Ô=\\\ëô\ãÍ«m»!\Ðÿ¶±+g\ÜÞ¿R3LEPf\è¤ýl\Ë/O~\ÛO \î	\Å};ºQ\é#ôfÖ±1ú¢Hm Ã¥\ÜÒ¦«q3f	÷ñ4_NPN \Ùîµ¼_R\Ý\\û\ë\Ô[\ÙÎ¿ø7Y¿<)ýÏ«?,\âC\Þù5tw ;75\Ç\Âó?\\ý:ÿèy\ä¦\Ó\ê\Æ1¥?/S\ÈQ\\¢µR&ui\Ç\íd\"B;¾-%ÒT\0\å\nbè£ºJ4µ7\nºNªN\\\Û9_¸\Ò\ìF¸\æ\ÓK\Ç\ÓB=W¥\îúj7>U~\à^¨ /3d²\r\è%4ª\Â<K&\Ê==u~_~j\Í:^\Äß±7Á>\äZð\á\Ù!c\ËÅ\Ú\ÒiCl?\ÕSS²\Ú9Q&¢·<m¶­«\á>µ(\âQ\ÝýÖ§B\Åg¸\á®Ñ­¿d\êTØu\Z\Û;ÖR~pC¿Iu^\nD)Q8l\"\ê\0-]\Ë{£U\ê2Z\ÓÃÿañ²÷\0¸.\Ä\Ê\Ð÷½4\ì5º `ú+)°{Zµ\ì²|ES-ô¨ þ\"\0´	\è\'\Þ^©±F ù¹\Ý\Ï[\ËQ\Õ\ß\0+\îi\Â<Dø\ã\Zx\éLv¡IrýZ\Ó\ßf¢:\Í<\ã?\ë\Ï)?,²\ÆN»2\È\Ùu<Mr¦ \à3q7s\Ø?Ri½°GJÜ§ªn½£¬M­d0\Ò~\Zò\\[·iÁ\àúÿwh\ÃI­)é©¡}YF\Ö6\Çã¥±c\ì\à\'ñNóñaUþ¸7­CxUa¥Ú¼³û\èüÁ\ÈiV\é\ã\ìÊ¥\É\ä\\õýý¬9px!i»	)Õ¤\ïû¯8òh!Vüm\å*µ¨þ 5cu³¬E°¡+¸\ìxz+\îj/\Æ\á¡­\âQ\Ç\Å\Ë-vÆ¨\Ö\ßù\n^-£¢U6¸	t(¯;^^þ\ÆB\ã¼\Ñk~¤5áº¤\ê¢j\Â^ý\rÇ9É³Ij\Úo À$\ê¸8~F.ô¡³:\ZyO\Âv,Û¨ 0÷Tló¢\í35ú\Ã\àú]ü7m\Ñ\ÞW«\Ùp»?ÓR\ã:y¯°éªµ\ì8¾¸§\ÕC/B<\Ï\0«¿oûsN\n¦xò«\Åú\ë¦Å\ÔO#\è\à0$P\'õøE@=H+qÿ.¢1õ(\ÝKt¡¦ª\í@\Ô\Ò#\Z~ü3\Â\Ã\Z39¨\ât·\Öd!^¤\Ûõdp\Ç\ÎO6Õ§\É\ÜÖ³©ÿÑF\ãf@h,nT±>©ù:V!yÿG½*M4\Ä0\Öp\ÈõI¿\à©\á÷µ593\'6\Ê$gdV»ä§\n\0>ú+h,½s½¿]JõcR¿Q\×\ÈU-\0\Ô9aÏª91\æ»\Ð\×\Ë-Y\'v~»¡\Ý\ÂûJW£\ÆI\Z\ÐO.ñ_[Dö0vªñ32¸\í&¨+xj\Ò\Ï7e¶\Û\Ê#$¬\Ú\êö_[Ò¨\ä\\x6§\ßþµ¨.K[¦Y\ÚU¢ÀÍ¯ØSO\Ä\ÉtMÂ\Ýl¨¿=\ÙV\ç%3ðþjRBNc3»Ä±tÀ>0TJ[=°^\ÈGT\É²û?\Ý7dþúªÿ@\Ü[JD«I²Z©4ôQ`\ÏüËg£òô¿\ß\ÃTV~¯\na\"¼E/=Vò ¶° \ÏZk_$¾\Ã=LD?0 ¯W$Nrùq->@\Æ,s5|Ô¤öD\ÍwI©\åò/÷u/s\0¢ú«$þh£hS:b\ìuÙ\áZý\0·\Ðõøcy_´\è5ß¶8s\ÅÓ¿t­\ì\Æp¥\ã {D\0X<cn\ë\ÔXTP»(¢-\ã\æTYºÏ¤ü¿øU¹¯\Ù\0±µó\nendstream\nendobj\n7 0 obj <</Length 1340/Filter/FlateDecode>>stream\n\Üa¹RÌæ¹I=lia¶¤\îE\Íö¡\È\Z\ï\ÇyÍ¼¢¯ó#ö©a#U\Ýe¶\ÓýQpõºqÁß¤5û&y¬®\Æ`4\r»¡½\Ú7¿Ø¶8-û-Ev·Vüÿýh\ì\Ú\Í7Os¥ºù|O\n¯_[Ó¯C)lÄa6\Ïö#ù<\×@·\é\×n\Úð¯\ì\Â6³\Ï2x\ÞÓªf(F\"°I£\éºñ!\íH\n5;Sý\×\é\ÛÍ¾\Ð\èc»õs\äø¾^ã\á\Ø °\æ¦\"¤Ux\0mç·¡\ÆFI|I*\Ù\n³$wp÷Êºl¼ü<2\ã%\É	.E\æm\ÕéÅ®2÷9\î(-,÷Rk<b[VF\ç\ØF9\ÄTý ®\ægé´.\ß\é\î\Ë,;\åM\Ù^9Á`w\Â\Ú\'\Äø\ËT½\Ò\n\ín@\Â9\ã¡7\ÝPoWa5\Ï+{Q\å\àd\Â9­\\þÉ£¢9y\ÉÀ \Î%²Á\áp:\×\ÓIÎ«a\è(Cö¶{\ìðAÁ¼¶ºQ¸ºa)&lz\Æztä¤¸\ÓÄ±F@0\ÈlL÷r\ÈhC,c\Ô\ÕZ\êñð©¹x=8%;þ0Â¶\Ð\ä&4\ì\âa\rzt01p±/ÿ\ÂEgö,ø\æMS\ídÁN|WWDa\0\Æ\Äq:dze\Õ\Ø\r4\Ìvû&2B\Ú\\_yô\Ùÿ§j÷Ci½¦@à®ZnZTølÉ¬â I(Fq\ï\ØE\îlPW§\É\'iGI\Ù\Ý+êµ&¤R;T0úø¼1\0²y\Ö<~¿)\äÂqA\Ë-&\Ç8NÂ´ðû§Ï\Å2ù¯+\Ý=us£p×¬\Ú\ßG\ÆÖ¾Ø³\"þ-Ø«¯O\Ç/\Ý y´\ßö0\Æbõû\à¶ò;ð+\Ön\ç\Í{\æµ\Ûü( )h¾\Ò,ø@\è¾\áÙ\ã\Ø\0{k d0Ym\Û/À.!0\ËX\ç!\Â\×Ds\á\0º}K7V}[)s~\Ü\ìF ¨È\åø\í·i£7me­9Õ§]¶¿O³Zi·×büU«\ãt\Ö6õ1	YR\ÖC¸#½±ß\àV¶4¢²=\Ú\Ý\Z}85¯lo¼j|â´a¯]µ\å}¼@ú§Rûf\ë~\ß\âZ,\Ùq^ûDNB\ä/\àÂ\Ú\Ã?Ê¼¿0,¼£¦M Dmµ±=2\Z6¸ ­¬_{~µøÀjn§o1£\Ö\Ì0wy¯Ph)§\\\îe¤Mu\Ê/\Ü>\Äö\Ü%1_<\Ù*\Ëï­þö:¾¡\Ú®~jQWÍ\Î&÷V0\êZ\ë-6ý9\ìö	òwu¾\ÄtÑ£Í/ý\Ý\ä\'ýV\âE3\ÕQ¬Þ¤È·\Öú¼îý\î\Ì*CgjrþV\Î\ÏwP\Úý° 57¼\æ#ci\Äcj,b\n\ÑO^Ôª\Ê\'ùB\Z\ë\'»0i\äôAH¤`ê¸­<.|xp_w¢m¸\Öfüz¼X\Èb<{{\ÅO~\Æñf\Õ\ÍSn×»[K\Î\nC¼Z«»\Ït\ÏÀ\í\ÌuÀ8m)1l\Î2»¬ýôEb\"R9}a)\ï\ÅRÅ³¿FH\Zy\âo@þVYÁ/V[ÉÝÿ\×\ã\r\0B¹f\àp!\r½Á\Ë\'f9d	\ì\ë\Æ>?=lKý\å$\ÉßPiTÚ«A}\Ð	\Õ]µ\ÈÀ¸©	m\ép\Ì1Á\\Øs©AøðP][ðª\ÒûEG­þx[ÿ8\nendstream\nendobj\n1 0 obj<</Parent 8 0 R/Contents 7 0 R/Type/Page/Resources<</XObject<</img2 6 0 R/img1 5 0 R/img0 3 0 R>>/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]/Font<</F1 2 0 R/F2 4 0 R>>>>/MediaBox[0 0 612 800]>>\nendobj\n9 0 obj[1 0 R/XYZ 0 812 0]\nendobj\n4 0 obj<</BaseFont/Helvetica-Bold/Type/Font/Encoding/WinAnsiEncoding/Subtype/Type1>>\nendobj\n2 0 obj<</BaseFont/Helvetica/Type/Font/Encoding/WinAnsiEncoding/Subtype/Type1>>\nendobj\n8 0 obj<</Type/Pages/Count 1/Kids[1 0 R]>>\nendobj\n10 0 obj<</Names[(òw%£qsOÃYü\Z?\ÏD³\É) 9 0 R]>>\nendobj\n11 0 obj<</Dests 10 0 R>>\nendobj\n12 0 obj<</Names 11 0 R/Type/Catalog/Pages 8 0 R>>\nendobj\n13 0 obj<</Creator(l`ý\î;¬ö¥\íg0UfP\ã\ÔRp.ó>\'_Ð\Ø\ê\\b\\\\*E·\Ó\ç`ö\ï\\\\\Êp*4\Ô-08¨.ÿü¸\äù\Ú|*?v@¾ó\ë)/Producer(OU\ë\æ*þ\Ì\á¬-\Õk73\ê\ÉZq.õq\'Y\Ò\Å)/ModDate(b;¼®l\ë\Ò\ç³\'\Åv@~!«C&w·)/CreationDate(b;¼®l\ë\Ò\ç³\'\Åv@~!«C&w·)>>\nendobj\n14 0 obj<</U (qÁ=¥Õ»f%\Ô\\f\ä^duòÇ¡\È\Ûk¨\×A\ÄÌ¥)/V 1/O (!¹·\Ñ\äB\\)\í¡1\Ñ\ÆKW{<\ã¥\êÌ·\èn\'¿a¨K\\f)/P -60/Filter/Standard/R 2>>\nendobj\nxref\n0 15\n0000000000 65535 f \n0000010146 00000 n \n0000010482 00000 n \n0000000015 00000 n \n0000010390 00000 n \n0000001424 00000 n \n0000001614 00000 n \n0000008738 00000 n \n0000010569 00000 n \n0000010356 00000 n \n0000010619 00000 n \n0000010673 00000 n \n0000010706 00000 n \n0000010764 00000 n \n0000010981 00000 n \ntrailer\n<</Root 12 0 R/ID [<bc9e45fa2d75f14f895b0c7dda8bf328><7ecc7b4254da0cf7778ae26e5444d8c0>]/Encrypt 14 0 R/Info 13 0 R/Size 15>>\nstartxref\n11108\n%%EOF\n','2025-11-25 02:33:48','2025-11-25 03:20:53'),(8,8,5,'Ahorros','Aperturada',NULL,'Prueba',NULL,'2025-11-27 01:00:34','2025-11-27 01:15:30'),(9,12,5,'Ahorros','Aperturada',NULL,'Prueba de apertura ',NULL,'2025-11-27 01:38:22','2025-11-27 01:39:05'),(10,12,26,'Ahorros','Pendiente',NULL,'cosidpaosdi',NULL,'2025-11-27 20:18:07',NULL);
/*!40000 ALTER TABLE `solicitudes_apertura` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transacciones`
--

LOCK TABLES `transacciones` WRITE;
/*!40000 ALTER TABLE `transacciones` DISABLE KEYS */;
INSERT INTO `transacciones` VALUES (1,1,'Apertura',NULL,0.00,NULL,NULL,0.00,0.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(2,1,'Depósito','Efectivo',500000.00,NULL,NULL,0.00,500000.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(3,2,'Apertura',NULL,0.00,NULL,NULL,0.00,0.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(4,2,'Depósito','Efectivo',1000000.00,NULL,NULL,0.00,1000000.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(5,2,'Depósito','Cheque',200000.00,NULL,NULL,1000000.00,1200000.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(6,3,'Apertura',NULL,0.00,NULL,NULL,0.00,0.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(7,3,'Depósito','Efectivo',500000.00,NULL,NULL,0.00,500000.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(8,3,'Retiro',NULL,150000.00,NULL,NULL,500000.00,350000.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(9,4,'Apertura',NULL,0.00,NULL,NULL,0.00,0.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez',NULL),(10,4,'Cancelación',NULL,0.00,NULL,NULL,0.00,0.00,1,NULL,'2025-11-24 01:40:52','María GonzÃ¡lez','Solicitud del cliente por mudanza al exterior'),(11,1,'Depósito','Efectivo',100.00,NULL,NULL,500000.00,500100.00,NULL,NULL,'2025-11-25 03:42:45',NULL,NULL),(12,1,'Depósito','Efectivo',50000.00,NULL,NULL,500100.00,550100.00,NULL,NULL,'2025-11-27 00:17:50',NULL,NULL),(13,1,'Depósito','Efectivo',60000.00,NULL,NULL,550100.00,610100.00,NULL,NULL,'2025-11-27 00:18:22',NULL,NULL),(14,1,'Retiro',NULL,10100.00,NULL,NULL,610100.00,600000.00,NULL,NULL,'2025-11-27 00:53:24',NULL,NULL),(15,1,'Retiro',NULL,10000.00,NULL,NULL,600000.00,590000.00,NULL,NULL,'2025-11-27 00:57:00',NULL,NULL),(19,8,'Apertura','Efectivo',100000.00,NULL,NULL,0.00,100000.00,5,NULL,'2025-11-27 01:15:30','santiago',NULL),(20,9,'Apertura','Cheque',100000.00,'45','58',0.00,100000.00,5,NULL,'2025-11-27 01:16:51','santiago',NULL),(21,10,'Apertura','Efectivo',60000.00,NULL,NULL,0.00,60000.00,5,NULL,'2025-11-27 01:39:05','santiago',NULL),(22,10,'Depósito','Cheque',40000.00,'456','788',60000.00,100000.00,NULL,NULL,'2025-11-27 01:40:39',NULL,NULL),(23,10,'Retiro',NULL,68000.00,NULL,NULL,100000.00,32000.00,NULL,NULL,'2025-11-27 01:41:03',NULL,NULL),(24,10,'Retiro',NULL,2000.00,NULL,NULL,32000.00,30000.00,NULL,NULL,'2025-11-27 01:41:15',NULL,NULL),(25,10,'Retiro',NULL,2000.00,NULL,NULL,30000.00,28000.00,NULL,NULL,'2025-11-27 01:41:16',NULL,NULL),(26,10,'Retiro',NULL,28000.00,NULL,NULL,28000.00,0.00,NULL,NULL,'2025-11-27 01:41:36',NULL,NULL),(27,10,'Cancelación',NULL,0.00,NULL,NULL,0.00,0.00,NULL,NULL,'2025-11-27 01:55:37',NULL,'Cancelacion');
/*!40000 ALTER TABLE `transacciones` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `traslados_cajero`
--

LOCK TABLES `traslados_cajero` WRITE;
/*!40000 ALTER TABLE `traslados_cajero` DISABLE KEYS */;
INSERT INTO `traslados_cajero` VALUES (1,NULL,1,'Cajero Auxiliar 01','María GonzÃ¡lez',50000.00,'Pendiente','2025-11-24 01:40:52',NULL),(2,NULL,1,'Cajero Principal','María GonzÃ¡lez',100000.00,'Pendiente','2025-11-24 01:40:52',NULL),(3,NULL,NULL,'Cajero Auxiliar 02','Cajero Principal',200000.00,'Aceptado','2025-11-23 01:40:52','2025-11-23 01:40:52');
/*!40000 ALTER TABLE `traslados_cajero` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES (1,1,1,'2025-11-24 01:40:48'),(2,2,2,'2025-11-24 01:40:48'),(3,3,3,'2025-11-24 01:40:48'),(4,4,4,'2025-11-24 01:40:49'),(5,5,2,'2025-11-24 21:16:10'),(6,6,3,'2025-11-24 21:18:25'),(7,5,3,'2025-11-25 03:17:14'),(8,5,1,'2025-11-25 03:24:22'),(9,7,2,'2025-11-25 14:00:13'),(10,7,1,'2025-11-25 14:01:25'),(11,7,3,'2025-11-25 14:01:38'),(12,8,2,'2025-11-25 14:02:25'),(13,8,1,'2025-11-25 14:03:15'),(14,9,2,'2025-11-25 22:29:50'),(15,9,3,'2025-11-25 22:34:23'),(16,9,1,'2025-11-25 22:37:31'),(17,10,5,'2025-11-27 05:01:33'),(18,10,1,'2025-11-27 05:44:18'),(19,5,5,'2025-11-27 05:45:25'),(20,10,2,'2025-11-27 05:46:30'),(21,7,5,'2025-11-27 18:21:27'),(22,11,1,'2025-11-27 19:10:25'),(23,12,1,'2025-11-27 19:14:10'),(24,13,1,'2025-11-27 19:16:18'),(25,12,2,'2025-11-27 19:20:43'),(26,13,2,'2025-11-27 19:21:08'),(27,13,5,'2025-11-27 19:33:19'),(28,13,3,'2025-11-27 19:56:01');
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'María GonzÃ¡lez','maria.cajero@bancauno.com','$2b$10$roq3wNFqZbrNiy59smH.xOQBcj2RiG8uzsGeRUx.cOMJJLbcW7hRi','2025-11-24 01:40:47',1),(2,'Carlos Ramírez','carlos.asesor@bancauno.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','2025-11-24 01:40:47',1),(3,'Luis Fernández','luis.director@bancauno.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','2025-11-24 01:40:47',1),(4,'Ana Martínez','ana.admin@bancauno.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW','2025-11-24 01:40:47',1),(5,'santiago','santiago@gmail.com','$2b$10$hUS/h1uRd9UKHBqqhWRcNe1G.NYYJk2yGcTGcqblXn5Y0k6f9DVDS','2025-11-24 21:15:59',1),(6,'Santiago ortiz','santiago2006ortizp@gmail.com','$2b$10$vzTQEfxaw22rE2MUgfch3.WS6A5dobAeMthwIdViVCztl6Yty.ZIO','2025-11-24 21:18:03',1),(7,'Isabel','isa@gmail.com','$2b$10$anM7KMIoemk92248GYjGz.ymdupip8wdHalsTpfkBPlhzF6A5QJIq','2025-11-25 13:59:56',1),(8,'Plimplim lalala','plimplim@gmail.com','$2b$10$njSAq5uX.YxqKHxCnaQCsevXMVDhbf0MARUewdJQasTIDPVNFoDRa','2025-11-25 14:01:55',1),(9,'Luz Karen Leal Barbosa','lleal@sena.edu.co','$2b$10$FkoflJSjgUJgD3AVNiUuHeC0hlh5Z3ru2tduceVvhW5wwrPee4mo.','2025-11-25 22:29:23',1),(10,'Principal','cajeroprincipal@gmail.com','$2b$10$cSb1S1lppkP6YgUQOEfuheO9rKEt59TJnQyHDNUOf6U4vg.XET03y','2025-11-27 05:01:24',1),(11,'julian suarez giron','julian123@gmail.com','$2b$10$77GXV2m2DXmnhcju1lnPhuXIhnCVhBU9TaX2PKppsWKOxO46KinrG','2025-11-27 19:10:05',1),(12,'pachecoS','pacheco99@gmail.com','$2b$10$F.CGCME1WkgkGSYKKNrDWuklIWJzMNBXTe87jNggOwDt9WiNPTpAq','2025-11-27 19:13:51',1),(13,'Isabel Cristina','cris@gmail.com','$2b$10$HYqBNYPWWnFfcOOw5gekBeJO.GYkWTRANIZzybnN3LMJ2Ip7K/Q5G','2025-11-27 19:16:10',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27 17:34:48


INSERT INTO boveda (
  id_boveda, 
  saldo_efectivo, 
  saldo_cheques, 
  ultima_actualizacion_por
) VALUES (
  1,
  500000000.00,   
  150000000.00,    
  3                -- Usuario "Luis Fernández" (Director operativo)
);
