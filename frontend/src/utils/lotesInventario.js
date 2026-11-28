// ============================================================
// LOTES EN EL INVENTARIO (Etapa 11)
// Une cada medicamento con los lotes que ingresaron por Recepción técnica
// y que están DISPONIBLES (aprobados o liberados de cuarentena).
// ============================================================
import { POLITICA_RECEPCION } from '../data/recepcion.js'
import { calcularVidaUtilMeses, formatearVidaUtil, parsearVencimiento } from './recepcion/fechas.js'

// Número para ordenar por vencimiento: los que vencen antes van primero.
// Después van los lotes sin vencimiento (dispositivos médicos) y, al final,
// los medicamentos que no tienen ningún lote disponible.
export function claveVencimiento(lote) {
  if (!lote) return Number.POSITIVE_INFINITY

  const partes = lote.sinVencimiento ? null : parsearVencimiento(lote.vencimiento)
  return partes ? partes.anio * 12 + partes.mes : Number.MAX_SAFE_INTEGER
}

// Compara dos claves sin restar (Infinity - Infinity da NaN y rompe sort)
export function compararClaves(a, b) {
  if (a === b) return 0
  return a < b ? -1 : 1
}

/**
 * Agrupa los lotes disponibles por medicamento, ordenados FEFO
 * (First Expired, First Out: primero el que vence antes).
 * @returns {Object<string, Array>} { 'MED-001': [lote, lote...], ... }
 */
export function agruparLotesDisponibles(lotes) {
  const grupos = {}

  lotes
    .filter((lote) => lote.estado === 'disponible' && lote.medicamentoId)
    .forEach((lote) => {
      grupos[lote.medicamentoId] ??= []
      grupos[lote.medicamentoId].push(lote)
    })

  Object.values(grupos).forEach((lista) =>
    lista.sort(
      (a, b) =>
        compararClaves(claveVencimiento(a), claveVencimiento(b)) ||
        a.id.localeCompare(b.id, 'es', { numeric: true })
    )
  )

  return grupos
}

// Clases por tono. Escritas completas para que Tailwind las detecte.
export const CLASES_TONO_VENCIMIENTO = {
  vencido: 'text-red-700 font-semibold',
  proximo: 'text-orange-700 font-semibold',
  vigente: 'text-gray-500',
  neutro: 'text-gray-500',
}

/**
 * Describe el vencimiento de un lote para mostrarlo en la tabla.
 * @returns {{ texto: string, detalle: string, tono: 'vencido'|'proximo'|'vigente'|'neutro' }}
 */
export function describirVencimiento(lote, hoy = new Date()) {
  if (lote.sinVencimiento) {
    return { texto: 'No aplica', detalle: 'Sin vencimiento', tono: 'neutro' }
  }

  const meses = calcularVidaUtilMeses(lote.vencimiento, hoy)

  if (meses === null) return { texto: lote.vencimiento || '—', detalle: '', tono: 'neutro' }
  if (meses <= 0) return { texto: lote.vencimiento, detalle: 'Vencido: retirar', tono: 'vencido' }

  if (meses < POLITICA_RECEPCION.alertaVencimientoMeses) {
    return { texto: lote.vencimiento, detalle: `Quedan ${formatearVidaUtil(meses)}`, tono: 'proximo' }
  }

  return { texto: lote.vencimiento, detalle: formatearVidaUtil(meses), tono: 'vigente' }
}
