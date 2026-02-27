[README.md](https://github.com/user-attachments/files/23968964/README.md)
#  Sistema Bancario - Banca Uno (Backend)

API REST para la gestión integral de operaciones bancarias desarrollada con Node.js, TypeScript y Express.  Sistema modular que permite gestionar solicitudes de crédito, apertura de cuentas, transacciones bancarias y control de saldos.

---

##  Descripción General

**Banca Uno Backend** es una API REST diseñada para gestionar las operaciones core de una entidad bancaria. El sistema está diseñado con arquitectura modular, permitiendo la gestión de múltiples roles (Asesores, Directores, Cajeros) y operaciones bancarias esenciales.

### Características Principales

-  **Autenticación y Autorización**: Sistema JWT para protección de rutas
-  **Gestión de Solicitudes**: Creación y aprobación de solicitudes de crédito
-  **Operaciones Bancarias**: Retiros, consignaciones, apertura de cuentas
-  **Control de Saldos**: Gestión de cajas, bóvedas y oficinas
-  **Sistema de Roles**: Asesor, Director Operativo, Cajero, Cajero Principal
-  **Arquitectura Modular**: Código organizado por módulos funcionales
-  **TypeScript**: Tipado fuerte para mayor seguridad

### Problema que Resuelve

Proporciona una solución backend completa para instituciones financieras que necesitan:
- Digitalizar procesos de solicitud de crédito
- Gestionar operaciones de caja de manera eficiente
- Controlar saldos en tiempo real
- Implementar control de acceso basado en roles

---

## 🛠️ Tecnologías Utilizadas

### Core
- **Node.js** >= 18.0.0
- **TypeScript** 5.9.3
- **Express. js** 5.1.0

### Base de Datos
- **MySQL2** 3.15.1

### Seguridad
- **bcryptjs** 3.0.3 - Encriptación de contraseñas
- **jsonwebtoken** 9.0.2 - Autenticación JWT

### Utilidades
- **cors** 2.8.5 - Cross-Origin Resource Sharing
- **dotenv** 17.2.3 - Variables de entorno
- **multer** 2.0.2 - Manejo de archivos

### Desarrollo
- **ts-node** 10.9. 2
- **nodemon** 3.1.11

---

##  Requerimientos Previos

Antes de instalar el proyecto, asegúrate de tener:

- **Node.js**: versión 18.0.0 o superior
- **npm**: versión 9.0.0 o superior
- **MySQL**: versión 8.0 o superior
- **Git**: para clonar el repositorio

---

##  Instalación

Sigue estos pasos para configurar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/pacheco333/banca_backend_1.git
cd banca_backend_1
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

Ejecuta el script SQL ubicado en `/database/bd_banca.sql` en tu servidor MySQL:

```bash
mysql -u tu_usuario -p < database/bd_banca.sql
```

O importa el archivo desde tu cliente MySQL preferido (MySQL Workbench, phpMyAdmin, etc.)

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=3000

# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=banca_uno
DB_PORT=3306

# JWT Secret
JWT_SECRET=tu_clave_secreta_super_segura

# CORS
CORS_ORIGIN=http://localhost:4200

# Entorno
NODE_ENV=development
```

### 5.  Compilar TypeScript (Producción)

```bash
npm run build
```

---

##  Uso

### Modo Desarrollo

```bash
npm run dev
```

El servidor se iniciará en: `http://localhost:3000`

### Modo Producción

```bash
npm run build
npm start
```

### Verificar Estado del Servidor

```bash
GET http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "API Banca Uno funcionando correctamente",
  "timestamp": "2025-12-05T10:30:00. 000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

##  API Endpoints

### Autenticación (Público)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/registro` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/roles` | Obtener roles disponibles |
| POST | `/api/auth/asignar-rol` | Asignar rol a usuario |

### Asesor (Requiere JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/asesor/solicitudes` | Listar todas las solicitudes |
| POST | `/api/asesor/solicitudes` | Crear nueva solicitud |
| GET | `/api/asesor/clientes/:cedula` | Buscar cliente por cédula |
| GET | `/api/asesor/solicitudes/:id` | Obtener detalle de solicitud |

### Director Operativo (Requiere JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/director/solicitudes` | Ver solicitudes pendientes |
| GET | `/api/director/solicitudes/:id` | Detalle de solicitud |
| PUT | `/api/director/solicitud/:id/aprobar` | Aprobar solicitud |
| PUT | `/api/director/solicitud/:id/rechazar` | Rechazar solicitud |
| GET | `/api/director/solicitud/:id/archivo` | Descargar archivo adjunto |

### Cajero (Requiere JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cajero/apertura/aperturar-cuenta` | Aperturar cuenta bancaria |
| POST | `/api/cajero/retiro/procesar-retiro` | Procesar retiro |
| POST | `/api/cajero/consignacion/procesar` | Procesar consignación |
| GET | `/api/cajero/saldo/consultar` | Consultar saldo de cuenta |

### Saldos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/saldos/cajeros` | Saldos de todos los cajeros |
| GET | `/api/saldos/caja/:id/movimientos` | Movimientos de una caja |
| GET | `/api/saldos/resumen-dia` | Resumen del día |
| GET | `/api/saldos/boveda/saldo` | Saldo de bóveda |
| GET | `/api/saldos/oficina/saldo` | Saldo de oficina |

### Autenticación de Rutas Protegidas

Para endpoints protegidos, incluye el token JWT en el header:

```
Authorization: Bearer <tu_token_jwt>
```

---

##  Estructura del Proyecto

```
banca_backend_1/
├── src/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── auth.routes.ts
│   │   └── auth. controller.ts
│   ├── config/                  # Configuración (DB, etc.)
│   ├── modules/                 # Módulos funcionales
│   │   ├── asesor/             # Gestión de asesores
│   │   ├── cajero/             # Operaciones de cajero
│   │   ├── cajero_principal/   # Gestión de saldos
│   │   └── director-operativo/ # Aprobaciones
│   ├── shared/                  # Código compartido
│   │   └── middleware/         # Middlewares (authMiddleware)
│   └── index.ts                # Punto de entrada principal
├── database/
│   ├── bd_banca.sql            # Script de base de datos
│   └── README.md               # Documentación de BD
├── dist/                        # Código compilado (generado)
├── node_modules/               # Dependencias
├── . gitignore
├── package.json
├── tsconfig. json               # Configuración TypeScript
└── README.md
```

---

##  Seguridad

- **Contraseñas**: Encriptadas con bcryptjs
- **JWT**: Tokens con expiración configurable
- **CORS**: Configurado para origen específico
- **Validación**: Middleware de autenticación en rutas protegidas
- **Variables de entorno**: Datos sensibles en archivo `.env`

---

##  Contribución

Si deseas contribuir al proyecto:

1. Haz un **fork** del repositorio
2.  Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3.  Realiza tus cambios con commits descriptivos (`git commit -m 'Agregar nueva funcionalidad'`)
4.  Sube los cambios a tu fork (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request** describiendo tus cambios

### Convenciones de Código

- Usar TypeScript para todo el código
- Seguir la estructura modular existente
- Incluir tipos explícitos
- Documentar funciones complejas

---

##  Autores

**Santiago Ortiz**  
**Cristina Lopez** 
**Julian Suarez** 
**Jeison Valor** 

Desarrolladores del Sistema Bancario Banca Uno

---

##  Licencia

ISC License

---

##  Soporte

Para reportar bugs o solicitar features, crea un [issue](https://github.com/pacheco333/banca_backend_1/issues) en el repositorio.

---

##  Notas Adicionales

- La API está configurada para trabajar con frontend Angular en `http://localhost:4200`
- Documentación completa de endpoints disponible en `GET /`
- Health check disponible en `GET /health` (crítico para deploy en Render/Railway)
- Base de datos MySQL con nombre por defecto: `banca_uno`

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025
