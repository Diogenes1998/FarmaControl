const pool = require('./db');
 
// Si db.js es una versión anterior (sin CONFIG), se usan valores genéricos para los mensajes
const CONFIG = pool.CONFIG ?? { host: 'localhost', port: 3306, user: 'root', database: 'drogueria_db' };
 
// Tablas que necesita FarmaControl (las crea sql/recepcion_tecnica.sql)
const TABLAS_REQUERIDAS = [
  'productos',
  'actas_recepcion',
  'items_recepcion',
  'lotes',
  'historial_lotes',
];
 
// Traduce los errores de conexión más comunes a una explicación con su solución
function explicar(error) {
  switch (error.code) {
    case 'ECONNREFUSED':
      return `MySQL no está iniciado o no escucha en el puerto ${CONFIG.port}. Inícialo (Servicios de Windows → MySQL80, o XAMPP → Start en MySQL).`;
    case 'ER_ACCESS_DENIED_ERROR':
      return `MySQL rechazó el usuario "${CONFIG.user}" o la contraseña. Corrige DB_PASSWORD en el archivo .env (en XAMPP suele quedar vacío).`;
    case 'ER_BAD_DB_ERROR':
      return `No existe la base de datos "${CONFIG.database}". Ejecuta sql/drogueria_db.sql en MySQL Workbench.`;
    case 'ENOTFOUND':
      return `No se encontró el servidor "${CONFIG.host}". Revisa DB_HOST en el archivo .env (normalmente 127.0.0.1).`;
    case 'ETIMEDOUT':
      return 'MySQL no respondió a tiempo. Verifica que el servicio esté iniciado y que el puerto sea el correcto.';
    default:
      return 'Error inesperado de MySQL. Revisa el código y el mensaje de abajo.';
  }
}
 
/**
 * Prueba la conexión y la estructura de la base de datos al iniciar Express.
 * No detiene el servidor: así puedes corregir MySQL y presionar "Reintentar".
 * @returns {Promise<boolean>} true si todo está listo
 */
async function verificarConexion() {
  const destino = `${CONFIG.user}@${CONFIG.host}:${CONFIG.port}/${CONFIG.database}`;
  let conexion;
 
  try {
    conexion = await pool.getConnection();
    await conexion.ping();
 
    const [tablas] = await conexion.query(
      'SELECT TABLE_NAME AS nombre FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      [CONFIG.database]
    );
    const existentes = new Set(tablas.map((tabla) => String(tabla.nombre).toLowerCase()));
    const faltantes = TABLAS_REQUERIDAS.filter((tabla) => !existentes.has(tabla));
 
    const [columnas] = await conexion.query(
      "SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'unidades_por_caja'",
      [CONFIG.database]
    );
    const faltaColumna = existentes.has('productos') && Number(columnas[0].total) === 0;
 
    if (faltantes.length > 0 || faltaColumna) {
      console.warn(`⚠ Conectado a MySQL (${destino}), pero la base de datos está incompleta:`);
      if (faltantes.length > 0) console.warn(`  Faltan las tablas: ${faltantes.join(', ')}`);
      if (faltaColumna) console.warn('  Falta la columna productos.unidades_por_caja');
      console.warn('  Solución: ejecuta sql/recepcion_tecnica.sql en MySQL Workbench y reinicia Express.');
      return false;
    }
 
    console.log(`✔ Conectado a MySQL (${destino}). Base de datos lista.`);
    return true;
  } catch (error) {
    console.error(`✖ No se pudo conectar a MySQL (${destino})`);
    console.error(`  ${explicar(error)}`);
    console.error(`  Código: ${error.code ?? 'desconocido'} · ${error.message}`);
    return false;
  } finally {
    if (conexion) conexion.release();
  }
}
 
module.exports = { verificarConexion };
 