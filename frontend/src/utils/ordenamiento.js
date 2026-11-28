import { calcularPrecioUnitario } from './calculos.js'
import { claveVencimiento, compararClaves } from './lotesInventario.js'

// Opciones que se muestran en el selector "Ordenar por"
export const OPCIONES_ORDEN = [
  { valor: 'codigo', etiqueta: 'Código' },
  { valor: 'nombre', etiqueta: 'Nombre (A → Z)' },
  { valor: 'stockAsc', etiqueta: 'Stock (menor primero)' },
  { valor: 'stockDesc', etiqueta: 'Stock (mayor primero)' },
  { valor: 'vencimiento', etiqueta: 'Vencimiento (próximo primero)' },
  { valor: 'precioUnitarioDesc', etiqueta: 'Precio unitario (mayor primero)' },
]

const porCodigo = (a, b) => a.id.localeCompare(b.id, 'es', { numeric: true })

/**
 * Devuelve una COPIA ordenada del arreglo; el original no se modifica.
 * @param lotesPorMedicamento resultado de agruparLotesDisponibles() (para ordenar por vencimiento)
 */
export function ordenarMedicamentos(medicamentos, criterio, lotesPorMedicamento = {}) {
  const copia = [...medicamentos]

  switch (criterio) {
    case 'nombre':
      return copia.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      )

    case 'stockAsc':
      return copia.sort((a, b) => a.cajas - b.cajas)

    case 'stockDesc':
      return copia.sort((a, b) => b.cajas - a.cajas)

    // Primero el lote que vence antes; los medicamentos sin lote van al final
    case 'vencimiento':
      return copia.sort(
        (a, b) =>
          compararClaves(
            claveVencimiento(lotesPorMedicamento[a.id]?.[0]),
            claveVencimiento(lotesPorMedicamento[b.id]?.[0])
          ) || porCodigo(a, b)
      )

    case 'precioUnitarioDesc':
      return copia.sort(
        (a, b) =>
          calcularPrecioUnitario(b.precioCaja, b.unidadesPorCaja) -
          calcularPrecioUnitario(a.precioCaja, a.unidadesPorCaja)
      )

    case 'codigo':
    default:
      return copia.sort(porCodigo)
  }
}
