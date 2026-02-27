# Base de Datos - Sistema Bancario Banca Uno

## 📋 Descripción
Base de datos para el sistema de apertura de cuentas de ahorro.

## 🚀 Instalación

### 1. Crear la base de datos
Ejecuta el script `schema.sql` en MySQL Workbench

### 2. Configurar conexión
Edita el archivo `src/config/database.ts` con tus credenciales


## 📊 Estructura de Tablas

### Clientes
Almacena información personal de los clientes.

### Contacto Personal
Información de contacto: dirección, teléfono, correo.

### Solicitudes de Apertura
Solicitudes enviadas por asesores y aprobadas/rechazadas por el director.

### Cuentas de Ahorro
Cuentas activas en el sistema.

### Transacciones
Registro de todas las transacciones (apertura, depósitos, retiros).

## 🧪 Datos de Prueba

| Documento | Tipo | Número | Estado Solicitud |
|-----------|------|--------|------------------|
| CC | 1012345678 | Aprobada | ✅ Puede aperturar |
| CC | 1023456789 | Aprobada | ✅ Puede aperturar |
| CE | 234567890 | Rechazada | ❌ No puede aperturar |
| CC | 1034567890 | Devuelta | ⚠️ Debe completar info |

## 🔧 Consultas Útiles
SELECT * FROM cuentas_ahorro;


Ver clientes con solicitudes aprobadas:
SELECT c.*, s.estado
FROM clientes c
JOIN solicitudes_apertura s ON c.id_cliente = s.id_cliente
WHERE s.estado = 'Aprobada';