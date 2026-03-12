-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: banca-uno-santiago2006ortizp-5f86.b.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35
CREATE DATABASE IF NOT EXISTS `defaultdb`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `defaultdb`;


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
  `archivo` longblob,
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
INSERT INTO `clientes` VALUES (1,'1012345678','CC','Bogotá','Bogotá','1990-05-15','2008-05-15','Juan','Carlos','Pérez','Gómez','M','Colombiano',NULL,'Soltero','Ninguna',NULL,'2025-11-24 01:40:49'),(2,'1023456789','CC','Medellín','Medellín','1985-08-22','2003-08-22','Laura','Marcela','Ramírez','López','F','Colombiano',NULL,'Casado','Ninguna',NULL,'2025-11-24 01:40:49'),(3,'1034567890','CC','Cali','Cali','1995-03-30','2013-03-30','Andrea','Carolina','Martínez','Vargas','F','Colombiano',NULL,'Unión Libre','Ninguna',NULL,'2025-11-24 01:40:49'),(4,'1045678901','CC','Bogotá','Bogotá','1992-07-18','2010-07-18','Carlos','Alberto','Rodríguez','Torres','M','Colombiano',NULL,'Soltero','Ninguna',NULL,'2025-11-24 01:40:49'),(5,'1056789012','CC','Bogotá','Bogotá','1998-11-25','2016-11-25','María','José','García','Hernández','F','Colombiano',NULL,'Soltero','Ninguna',NULL,'2025-11-24 01:40:49'),(8,'123123123','CC','adasdasd','adasd','2025-11-25','2025-11-01','adsasd','asdasd','asdasd','asdads','M','Colombiano','asdasdsa','Soltero','Indígena',NULL,'2025-11-25 04:15:21'),(12,'114567896','CC','asdasas','adsasdasd','2025-11-01','2025-11-26','Santiago ','','Pacheco','','M','Colombiano','','Soltero','Ninguna',NULL,'2025-11-27 01:34:15');
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
INSERT INTO `solicitudes_apertura` VALUES (1,1,2,'Ahorros','Aprobada','Cliente cumple con todos los requisitos. Aprobado.',NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(2,2,2,'Ahorros','Aprobada','Documentación completa. Aprobado.',NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(3,3,2,'Ahorros','Rechazada','Información financiera incompleta. Rechazado.',NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(4,4,2,'Ahorros','Aprobada','Todo en orden. Aprobado.',NULL,'2025-11-24 01:40:52','2025-11-24 01:40:52'),(8,8,5,'Ahorros','Aperturada',NULL,'Prueba','2025-11-27 01:00:34','2025-11-27 01:15:30'),(9,12,5,'Ahorros','Aperturada',NULL,'Prueba de apertura ','2025-11-27 01:38:22','2025-11-27 01:39:05'),(10,12,26,'Ahorros','Pendiente',NULL,'cosidpaosdi','2025-11-27 20:18:07',NULL);
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