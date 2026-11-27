const mysql = require('mysql2/promise');
 
// ============================================================
// DATOS DE CONEXIÓN A MYSQL
// Se leen del archivo .env (copia .env.example como .env y completa).
//  - MySQL Installer / Workbench: la contraseña que elegiste al instalar.
//  - XAMPP: el usuario root NO tiene contraseña → DB_PASSWORD=
// La contraseña NUNCA se escribe aquí: este archivo se sube a GitHub.
// ============================================================
const CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'drogueria_db',
};
 
// Pool de conexiones MySQL
const pool = mysql.createPool({
  ...CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
 
module.exports = pool;
module.exports.CONFIG = CONFIG;
 