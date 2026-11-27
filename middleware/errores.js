// Errores "esperados" de la API: datos inválidos, no encontrado, conflicto de estado...
class ErrorHttp extends Error {
  constructor(estado, mensaje, errores = null) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

// Pasa a next() los errores de funciones async. Express 5 ya lo hace por sí solo;
// el envoltorio se conserva para que el flujo de errores sea explícito y uniforme.
function envolver(controlador) {
  return (req, res, next) => {
    Promise.resolve(controlador(req, res, next)).catch(next);
  };
}

// Cualquier /api/... que no exista responde JSON (no la página HTML de Express)
function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

// Errores de MySQL que suelen aparecer al configurar el proyecto, con su solución
const ERRORES_MYSQL = {
  ECONNREFUSED: [503, 'No hay conexión con MySQL. Verifica que el servicio esté iniciado.'],
  ER_ACCESS_DENIED_ERROR: [503, 'MySQL rechazó el usuario o la contraseña. Revisa DB_USER y DB_PASSWORD en el archivo .env.'],
  ER_BAD_DB_ERROR: [503, 'No existe la base de datos drogueria_db. Ejecuta sql/drogueria_db.sql.'],
  ER_NO_SUCH_TABLE: [500, 'Faltan tablas de la recepción técnica. Ejecuta sql/recepcion_tecnica.sql.'],
  ER_BAD_FIELD_ERROR: [500, 'Falta la columna unidades_por_caja. Ejecuta sql/recepcion_tecnica.sql.'],
};

// Middleware final: convierte cualquier error en una respuesta JSON clara
// (Express lo reconoce como manejador de errores porque recibe 4 parámetros)
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({ mensaje: error.message, errores: error.errores });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }

  console.error('[API]', error);

  const conocido = ERRORES_MYSQL[error.code];
  if (conocido) {
    return res.status(conocido[0]).json({ mensaje: conocido[1] });
  }

  return res.status(500).json({ mensaje: 'Error interno del servidor. Revisa la consola de Express.' });
}

module.exports = { ErrorHttp, envolver, rutaNoEncontrada, manejarErrores };
