// ============================================================
// VARIABLES DE ENTORNO (.env)
// Carga el archivo .env de la raíz del proyecto ANTES de leer la
// configuración de MySQL o de Gemini. Así las contraseñas y la API key
// nunca quedan escritas en el código ni se suben a GitHub.
//
// Node 20.12+ trae process.loadEnvFile(); si no existe (Node más antiguo),
// se usa un lector sencillo de líneas CLAVE=valor.
// ============================================================
const fs = require('fs');
const path = require('path');

const RUTA_ENV = path.join(__dirname, '..', '.env');

function leerEnvManual(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf8');

  contenido.split(/\r?\n/).forEach((linea) => {
    const limpia = linea.trim();
    if (limpia === '' || limpia.startsWith('#')) return;

    const posicion = limpia.indexOf('=');
    if (posicion === -1) return;

    const clave = limpia.slice(0, posicion).trim();
    const valor = limpia
      .slice(posicion + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2'); // quita comillas envolventes

    // Las variables definidas en el sistema tienen prioridad sobre el archivo
    if (process.env[clave] === undefined) process.env[clave] = valor;
  });
}

function cargarEntorno() {
  if (!fs.existsSync(RUTA_ENV)) {
    console.warn('⚠ No se encontró el archivo .env. Copia .env.example como .env y completa tus datos.');
    return false;
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(RUTA_ENV);
  } else {
    leerEnvManual(RUTA_ENV);
  }

  return true;
}

module.exports = { cargarEntorno };
