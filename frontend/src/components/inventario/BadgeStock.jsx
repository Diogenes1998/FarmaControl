import { ESTADOS_STOCK } from '../../data/estadosStock.js'
import { obtenerEstadoStock } from '../../utils/calculos.js'

// Se puede usar con "cajas" (calcula el estado) o directamente con "estado"
function BadgeStock({ cajas, estado }) {
  const estadoFinal = estado ?? obtenerEstadoStock(cajas)
  const { etiqueta, icono, clases } = ESTADOS_STOCK[estadoFinal]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${clases}`}
    >
      <span aria-hidden="true">{icono}</span>
      {etiqueta}
    </span>
  )
}

export default BadgeStock
