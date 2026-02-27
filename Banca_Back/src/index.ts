// ⚠️ CRÍTICO: Cargar variables de entorno PRIMERO - ANTES de cualquier import
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authMiddleware } from './shared/middleware/authMiddleware';
import asesorRoutes from './modules/asesor/asesor.routes';
import cajeroRoutes from './modules/cajero/cajero.routes';
import directorRoutes from './modules/director-operativo/director.routes';
import cajeroPrincipalRoutes from './modules/cajero_principal/cajero_principal.routes';
import authRoutes from './auth/auth.routes';


const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================
// CORS Configuration: Soporta múltiples orígenes (desarrollo y producción)
const allowedOrigins = [
  'http://localhost:4200',           // Desarrollo local Angular
  'http://localhost:3000',           // Desarrollo local backend
  'https://banca-frontend-1.vercel.app',  // Producción frontend
  'https://banca-frontend-1-qlvd1t3gl-pachecos-projects-bcea152b.vercel.app',
  'https://banca-backend-1.onrender.com'  // Producción backend
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS no permitido desde: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// HEALTH CHECK (Crítico para Render/Railway)
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API Banca Uno funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// ============================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================
app.use('/api/auth', authRoutes);

// ============================================
// RUTAS PROTEGIDAS (Con autenticación)
// ============================================
app.use('/api/asesor', authMiddleware, asesorRoutes);    
app.use('/api/director', authMiddleware, directorRoutes);
app.use('/api/cajero', authMiddleware, cajeroRoutes);
// Rutas de saldos / cajero principal (protección aplicada dentro del router en rutas específicas)
app.use('/api/saldos', cajeroPrincipalRoutes);

// ============================================
// RUTA PRINCIPAL - Documentación API
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: ' API Banca Uno - Sistema Bancario',
    version: '1.0.0',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    documentation: {
      healthCheck: 'GET /health',
      apiDocs: 'GET /'
    },
    modules: {
      auth: '/api/auth/*',
      asesor: '/api/asesor/* (protegido)',
      director: '/api/director/* (protegido)',
      cajero: '/api/cajero/* (protegido)',
      saldos: '/api/saldos/*'
    },
    endpoints: {
      // Autenticación
      authentication: {
        login: 'POST /api/auth/login',
        registro: 'POST /api/auth/registro',
        rolesDisponibles: 'GET /api/auth/roles?correo=...',
        asignarRol: 'POST /api/auth/asignar-rol',
        listarRoles: 'GET /api/auth/roles'
      },
     
      // Asesor (requiere JWT)
      asesor: {
        listarSolicitudes: 'GET /api/asesor/solicitudes',
        crearSolicitud: 'POST /api/asesor/solicitudes',
        buscarCliente: 'GET /api/asesor/clientes/:cedula',
        buscarPorCedula: 'GET /api/asesor/solicitudes/cedula/:cedula',
        obtenerSolicitud: 'GET /api/asesor/solicitudes/:id',
        verificarSolicitud: 'GET /api/asesor/solicitudes/existe/:id'
      },

      // Director (requiere JWT)
      director: {
        consultas: {
          buscarPorAsesor: 'GET /api/director/solicitudes/asesor/:id_usuario_rol',
          detalleSolicitud: 'GET /api/director/solicitudes/:id_solicitud',
          todasSolicitudes: 'GET /api/director/solicitudes?estado=Pendiente'
        },
        gestion: {
          detalleCompleto: 'GET /api/director/solicitud-detalle/:id_solicitud',
          rechazarSolicitud: 'PUT /api/director/solicitud/:id_solicitud/rechazar',
          aprobarSolicitud: 'PUT /api/director/solicitud/:id_solicitud/aprobar',
          descargarArchivo: 'GET /api/director/solicitud/:id_solicitud/archivo'
        }
      },

      // Cajero (requiere JWT)
      cajero: {
        aperturaCuenta: 'POST /api/cajero/apertura/aperturar-cuenta',
        procesarRetiro: 'POST /api/cajero/retiro/procesar-retiro',
        procesarConsignacion: 'POST /api/cajero/consignacion/procesar',
        consultarSaldo: 'GET /api/cajero/saldo/consultar'
      },

      saldosCajeros: 'GET /api/saldos/cajeros',
      movimientosCaja: 'GET /api/saldos/caja/:id/movimientos',
      resumenDia: 'GET /api/saldos/resumen-dia',
      saldoBoveda: 'GET /api/saldos/boveda/saldo',
      saldoOficina: 'GET /api/saldos/oficina/saldo',
    },
    notes: {
      authentication: 'Usa el header: Authorization: Bearer <token>',
      cors: `Permitidos: ${allowedOrigins.join(', ')}`,
      database: process.env.DB_NAME || 'banca_uno'
    }
  });
});

// ============================================
// 404 - RUTA NO ENCONTRADA
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/login',
      'POST /api/auth/registro'
    ]
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(' Error capturado:', err);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('  SERVIDOR BANCA UNO INICIADO EXITOSAMENTE');
  console.log('='.repeat(70));
  console.log(`  URL Local:        http://localhost:${PORT}`);
  console.log(`  Entorno:          ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Base de Datos:    ${process.env.DB_NAME || 'banca_uno'} (MySQL)`);
  console.log(`  CORS Origin:      ${process.env.CORS_ORIGIN || 'http://localhost:4200'}`);
  console.log(`  Timestamp:        ${new Date().toLocaleString()}`);
  console.log('='.repeat(70));
  console.log('\n  MÓDULOS DISPONIBLES:');
  console.log('     Público:        /api/auth/*');
  console.log('     Asesor:         /api/asesor/* (requiere JWT)');
  console.log('     Director:       /api/director/* (requiere JWT)');
  console.log('     Cajero:         /api/cajero/* (requiere JWT)');
  console.log('     Health Check:   /health');
  console.log('     Documentación:  /');
  console.log('='.repeat(70));
  
  // Mostrar endpoints solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('\n  ENDPOINTS PRINCIPALES:\n');
    
    console.log('    AUTENTICACIÓN:');
    console.log('      POST   /api/auth/registro');
    console.log('      POST   /api/auth/login');
    console.log('      GET    /api/auth/roles?correo=...');
    console.log('      POST   /api/auth/asignar-rol');
    console.log('      GET    /api/auth/roles');
    
    console.log('\n    ASESOR (JWT requerido):');
    console.log('      GET    /api/asesor/solicitudes');
    console.log('      POST   /api/asesor/solicitudes');
    console.log('      GET    /api/asesor/clientes/:cedula');
    console.log('      GET    /api/asesor/solicitudes/cedula/:cedula');
    
    console.log('\n    DIRECTOR (JWT requerido):');
    console.log('      GET    /api/director/solicitudes');
    console.log('      GET    /api/director/solicitudes/:id_solicitud');
    console.log('      PUT    /api/director/solicitud/:id/aprobar');
    console.log('      PUT    /api/director/solicitud/:id/rechazar');
    
    console.log('\n    CAJERO (JWT requerido):');
    console.log('      POST   /api/cajero/apertura/aperturar-cuenta');
    console.log('      POST   /api/cajero/retiro/procesar-retiro');
    console.log('      POST   /api/cajero/consignacion/procesar');
    console.log('      GET    /api/cajero/saldo/consultar');
    
    console.log('\n' + '='.repeat(70));
    console.log(' Visitar: http://localhost:' + PORT + ' para ver la documentación completa');
    console.log('='.repeat(70) + '\n');
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = (signal: string) => {
  console.log(`\n  Señal ${signal} recibida, cerrando servidor...`);
  
  server.close(() => {
    console.log('  Servidor cerrado correctamente');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('  Cierre forzado por timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('  Promesa rechazada no manejada:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('  Excepción no capturada:', error);
  process.exit(1);
});