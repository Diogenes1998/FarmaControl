// Utilidades de fecha para la recepción técnica.
// Todas trabajan con la fecha LOCAL del equipo (no UTC).

const DIAS_POR_MES = 30.4375 // promedio: 365,25 / 12
const PATRON_VENCIMIENTO = /^(0[1-9]|1[0-2])\/(\d{4})$/

function dosDigitos(numero) {
  return String(numero).padStart(2, '0')
}

// "06/2027" → { mes: 6, anio: 2027 } · null si el formato no es MM/AAAA
export function parsearVencimiento(texto) {
  const coincidencia = PATRON_VENCIMIENTO.exec(String(texto ?? '').trim())

  if (!coincidencia) return null

  return { mes: Number(coincidencia[1]), anio: Number(coincidencia[2]) }
}

// Un vencimiento expresado como MM/AAAA se entiende hasta el ÚLTIMO día de ese mes
export function obtenerFinDeVencimiento(texto) {
  const partes = parsearVencimiento(texto)

  if (!partes) return null

  // Día 0 del mes siguiente = último día del mes indicado
  return new Date(partes.anio, partes.mes, 0, 23, 59, 59)
}

/**
 * Meses de vida útil que le quedan al producto en una fecha dada.
 * Devuelve el valor EXACTO (negativo o cero si ya venció) o null si no aplica.
 * No se redondea aquí: redondear convertiría "vencido hace 1 día" en 0 meses.
 * El redondeo se hace solo al mostrarlo (formatearVidaUtil).
 */
export function calcularVidaUtilMeses(vencimiento, fechaReferencia = new Date()) {
  const fin = obtenerFinDeVencimiento(vencimiento)
  const referencia = new Date(fechaReferencia)

  if (!fin || Number.isNaN(referencia.getTime())) return null

  const dias = (fin.getTime() - referencia.getTime()) / 86_400_000
  return dias / DIAS_POR_MES
}

// Fecha y hora local para un <input type="datetime-local">: "2026-11-02T14:44"
export function fechaHoraLocalISO(fecha = new Date()) {
  return `${fechaLocalISO(fecha)}T${dosDigitos(fecha.getHours())}:${dosDigitos(
    fecha.getMinutes()
  )}`
}

// Fecha local para un <input type="date">: "2026-11-02"
export function fechaLocalISO(fecha = new Date()) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}`
}

// "2026-11-02T14:44" → "2 nov 2026, 14:44"
export function formatearFechaHora(valor) {
  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// "2026-11-02" → "2 nov 2026" (sin desfase de zona horaria)
export function formatearFecha(valor) {
  const [anio, mes, dia] = String(valor ?? '').split('-').map(Number)

  if (!anio || !mes || !dia) return '—'

  return new Date(anio, mes - 1, dia).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// 7.904 → "7,9 meses" · null → "No aplica" · 0 o negativo → "Vencido"
export function formatearVidaUtil(meses) {
  if (meses === null || meses === undefined) return 'No aplica'
  if (meses <= 0) return 'Vencido'

  const redondeado = Math.round(meses * 10) / 10

  if (redondeado < 0.1) return 'menos de 0,1 meses'

  return `${redondeado.toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${
    redondeado === 1 ? 'mes' : 'meses'
  }`
}
