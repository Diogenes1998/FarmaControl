// ============================================================
// CLIENTE DE LA API DE EXPRESS (Etapa 10)
// En desarrollo, Vite reenvía /api a http://localhost:3000 (ver vite.config.js).
// En producción, Express sirve esta app y la API desde el mismo origen.
// ============================================================

const URL_BASE = import.meta.env?.VITE_API_URL ?? '/api'

// Error con la información que devuelve el servidor
export class ErrorApi extends Error {
  constructor(mensaje, estado, errores = null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.errores = errores
  }
}

async function solicitar(metodo, ruta, cuerpo) {
  let respuesta

  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(
      'No hay conexión con el servidor. Verifica que Express esté corriendo (node server.js).',
      0
    )
  }

  // 204 = "sin contenido" (por ejemplo, al eliminar)
  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.mensaje ?? `El servidor respondió con el error ${respuesta.status}.`,
      respuesta.status,
      datos?.errores ?? null
    )
  }

  return datos
}

export const api = {
  obtener: (ruta) => solicitar('GET', ruta),
  crear: (ruta, cuerpo = {}) => solicitar('POST', ruta, cuerpo),
  actualizar: (ruta, cuerpo) => solicitar('PUT', ruta, cuerpo),
  eliminar: (ruta) => solicitar('DELETE', ruta),

  // Envío "de último momento" al cerrar la pestaña: el navegador lo completa
  // aunque la página ya se esté cerrando (keepalive). No se espera respuesta.
  enviarAlSalir: (ruta, cuerpo) => {
    fetch(`${URL_BASE}${ruta}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
      keepalive: true,
    }).catch(() => {})
  },
}

// Convierte un error de la API en un texto para el aviso de la interfaz
export function mensajeDeError(error) {
  if (Array.isArray(error?.errores) && error.errores.length > 0) {
    return `${error.message} ${error.errores.join(' · ')}`
  }

  return error?.message ?? 'Ocurrió un error inesperado.'
}
