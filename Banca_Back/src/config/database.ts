import mysql from 'mysql2/promise';

// Valores por defecto para referencia (se usan solo si .env no está configurado)
// DESARROLLO: localhost:3307
// PRODUCCIÓN (Aiven): banca-uno-santiago2006ortizp-5f86.b.aivencloud.com:13730
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'banca-uno-santiago2006ortizp-5f86.b.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',          
  password: process.env.DB_PASSWORD || '',           
  database: process.env.DB_NAME || 'defaultdb',
  port: parseInt(process.env.DB_PORT || '13730'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false   // Aiven requiere SSL
  }
});

// Verificación (útil para debug)
console.log('📊 Conectando a MySQL:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

export default pool;