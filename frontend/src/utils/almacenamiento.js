import { CLAVE_ALMACENAMIENTO } from '../data/constantes.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'
import { pluralizar } from './texto.js'

// Versión del formato del inventario guardado en localStorage.
export const VERSION_DATOS = 1

// Versión del archivo de respaldo. La 2 incluye actas de recepción y lotes (Etapa 9).
export const VERSION_RESPALDO = 2

// ¿El navegador permite usar localStorage?
// Puede estar bloqueado por la configuración de privacidad del usuario.
export function almacenamientoDisponible() {
  try {
    const clavePrueba = '__farmacontrol_prueba__'
    window.localStorage.setItem(clavePrueba, clavePrueba)
    window.localStorage.removeItem(clavePrueba)
    return true
  } catch {
    return false
  }
}

// Verifica que un objeto tenga la forma correcta de un medicamento
export function esMedicamentoValido(medicamento) {
  return (
    medicamento !== null &&
    typeof medicamento === 'object' &&
    typeof medicamento.id === 'string' &&
    medicamento.id.trim() !== '' &&
    typeof medicamento.nombre === 'string' &&
    medicamento.nombre.trim() !== '' &&
    typeof medicamento.categoria === 'string' &&
    medicamento.categoria.trim() !== '' &&
    Number.isInteger(medicamento.cajas) &&
    medicamento.cajas >= 0 &&
    Number.isInteger(medicamento.unidadesPorCaja) &&
    medicamento.unidadesPorCaja >= 1 &&
    typeof medicamento.precioCaja === 'number' &&
    Number.isFinite(medicamento.precioCaja) &&
    medicamento.precioCaja > 0
  )
}

// Recibe datos ya convertidos desde JSON y extrae los medicamentos válidos.
// Acepta el formato { version, medicamentos } o un arreglo directo.
// Devuelve { medicamentos, descartados } o null si la estructura no sirve.
export function extraerMedicamentos(datos) {
  const lista = Array.isArray(datos) ? datos : datos?.medicamentos

  if (!Array.isArray(lista)) {
    return null
  }

  const codigosVistos = new Set()

  const validos = lista.filter((medicamento) => {
    if (!esMedicamentoValido(medicamento)) return false
    if (codigosVistos.has(medicamento.id)) return false // código repetido

    codigosVistos.add(medicamento.id)
    return true
  })

  return {
    medicamentos: validos,
    descartados: lista.length - validos.length,
  }
}

// Convierte un texto JSON en un inventario. Devuelve null si no es válido.
export function interpretarInventario(texto) {
  try {
    return extraerMedicamentos(JSON.parse(texto))
  } catch {
    return null
  }
}

/**
 * Lee el inventario guardado al iniciar la aplicación.
 * @returns {{ medicamentos: Array, origen: string, descartados: number }}
 * origen: 'guardado' | 'inicial' | 'corrupto' | 'sinAlmacenamiento'
 */
export function cargarInventario() {
  if (!almacenamientoDisponible()) {
    return { medicamentos: medicamentosIniciales, origen: 'sinAlmacenamiento', descartados: 0 }
  }

  const texto = window.localStorage.getItem(CLAVE_ALMACENAMIENTO)

  // Primera vez que se abre la app: no hay nada guardado
  if (texto === null) {
    return { medicamentos: medicamentosIniciales, origen: 'inicial', descartados: 0 }
  }

  const resultado = interpretarInventario(texto)

  if (resultado === null) {
    console.error('El inventario guardado está dañado. Se cargaron los datos de ejemplo.')
    return { medicamentos: medicamentosIniciales, origen: 'corrupto', descartados: 0 }
  }

  return {
    medicamentos: resultado.medicamentos,
    origen: 'guardado',
    descartados: resultado.descartados,
  }
}

// Guarda el inventario. Devuelve true si se guardó, false si falló.
export function guardarInventario(medicamentos) {
  try {
    const texto = JSON.stringify({ version: VERSION_DATOS, medicamentos })

    // Si no hay cambios reales, no se escribe (evita trabajo y eventos innecesarios)
    if (window.localStorage.getItem(CLAVE_ALMACENAMIENTO) === texto) {
      return true
    }

    window.localStorage.setItem(CLAVE_ALMACENAMIENTO, texto)
    return true
  } catch (error) {
    console.error('No se pudo guardar el inventario:', error)
    return false
  }
}

// Fecha local en formato AAAA-MM-DD (para nombres de archivo)
function obtenerFechaArchivo(fecha = new Date()) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

// Prepara el contenido y el nombre del archivo de respaldo.
// Desde la Etapa 9 también incluye las actas de recepción y los lotes.
export function crearArchivoRespaldo(medicamentos, recepciones = { actas: [], lotes: [] }) {
  const contenido = JSON.stringify(
    {
      aplicacion: 'FarmaControl',
      version: VERSION_RESPALDO,
      exportadoEl: new Date().toISOString(),
      medicamentos,
      recepciones,
    },
    null,
    2
  )

  return {
    nombreArchivo: `farmacontrol-respaldo-${obtenerFechaArchivo()}.json`,
    contenido,
  }
}

// Convierte el resultado de la carga en un aviso para el usuario (o null)
export function describirCarga(infoCarga) {
  if (infoCarga.origen === 'sinAlmacenamiento') {
    return {
      tipo: 'error',
      mensaje:
        'Tu navegador no permite guardar datos de este sitio (revisa la configuración de privacidad). Los cambios se perderán al cerrar la página.',
    }
  }

  if (infoCarga.origen === 'corrupto') {
    return {
      tipo: 'error',
      mensaje:
        'Los datos guardados no se pudieron leer, así que se cargó el inventario de ejemplo.',
    }
  }

  if (infoCarga.descartados > 0) {
    return {
      tipo: 'info',
      mensaje: `Se recuperó el inventario guardado, pero se descartaron ${pluralizar(
        infoCarga.descartados,
        'registro con datos inválidos',
        'registros con datos inválidos'
      )}.`,
    }
  }

  return null
}
