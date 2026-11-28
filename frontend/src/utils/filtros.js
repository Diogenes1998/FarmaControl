import { STOCK_MINIMO } from '../data/constantes.js'
import { ESTADOS_STOCK, ORDEN_ESTADOS } from '../data/estadosStock.js'
import { obtenerEstadoStock } from './calculos.js'
import { normalizarTexto } from './texto.js'

// Filtros sin aplicar (estado inicial y botón "Limpiar filtros")
export const FILTROS_INICIALES = {
  texto: '',
  categoria: 'todas',
  estado: 'todos',
}

// Opciones del selector de estado
export const OPCIONES_ESTADO = [
  { valor: 'todos', etiqueta: 'Todos los estados' },
  { valor: 'stockBajo', etiqueta: `Stock bajo (menos de ${STOCK_MINIMO} cajas)` },
  ...ORDEN_ESTADOS.map((estado) => ({
    valor: estado,
    etiqueta: `Solo: ${ESTADOS_STOCK[estado].etiqueta}`,
  })),
]

// ¿El medicamento cumple con el filtro de estado elegido?
function cumpleFiltroEstado(medicamento, estado) {
  if (estado === 'todos') return true
  if (estado === 'stockBajo') return Number(medicamento.cajas) < STOCK_MINIMO
  return obtenerEstadoStock(medicamento.cajas) === estado
}

// ¿Algún lote disponible del medicamento coincide por número de lote o INVIMA?
function coincideConLotes(lotes = [], textoBuscado) {
  return lotes.some(
    (lote) =>
      normalizarTexto(lote.lote).includes(textoBuscado) ||
      normalizarTexto(lote.registroSanitario).includes(textoBuscado)
  )
}

/**
 * Aplica búsqueda + categoría + estado. Devuelve un arreglo NUEVO.
 * La búsqueda encuentra por nombre, código, número de lote o registro INVIMA.
 * @param lotesPorMedicamento resultado de agruparLotesDisponibles() (opcional)
 */
export function filtrarMedicamentos(medicamentos, filtros, lotesPorMedicamento = {}) {
  const textoBuscado = normalizarTexto(filtros.texto)

  return medicamentos.filter((medicamento) => {
    const coincideTexto =
      textoBuscado === '' ||
      normalizarTexto(medicamento.nombre).includes(textoBuscado) ||
      normalizarTexto(medicamento.id).includes(textoBuscado) ||
      coincideConLotes(lotesPorMedicamento[medicamento.id], textoBuscado)

    const coincideCategoria =
      filtros.categoria === 'todas' ||
      medicamento.categoria === filtros.categoria

    const coincideEstado = cumpleFiltroEstado(medicamento, filtros.estado)

    return coincideTexto && coincideCategoria && coincideEstado
  })
}

// ¿Hay algún filtro aplicado?
export function hayFiltrosActivos(filtros) {
  return (
    filtros.texto.trim() !== '' ||
    filtros.categoria !== 'todas' ||
    filtros.estado !== 'todos'
  )
}

// Cuenta cuántos medicamentos hay por categoría: { Analgésico: 1, ... }
export function contarPorCategoria(medicamentos) {
  return medicamentos.reduce((conteo, medicamento) => {
    conteo[medicamento.categoria] = (conteo[medicamento.categoria] ?? 0) + 1
    return conteo
  }, {})
}
