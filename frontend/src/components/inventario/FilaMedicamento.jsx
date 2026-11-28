import { useState } from 'react'

import BadgeStock from './BadgeStock.jsx'
import { SinDato, TablaLotes, VencimientoLote } from './DatosLote.jsx'
import { calcularPrecioUnitario, obtenerEstadoStock } from '../../utils/calculos.js'
import { formatearPesos } from '../../utils/formatos.js'

const TOTAL_COLUMNAS = 10

/**
 * Una fila del inventario. Lote, vencimiento e INVIMA corresponden al lote
 * disponible que vence primero (FEFO); el botón "+N" despliega los demás.
 */
function FilaMedicamento({ medicamento, lotes = [] }) {
  const [mostrarLotes, setMostrarLotes] = useState(false)

  const { id, nombre, categoria, cajas, unidadesPorCaja, precioCaja } = medicamento
  const precioUnitario = calcularPrecioUnitario(precioCaja, unidadesPorCaja)
  const estado = obtenerEstadoStock(cajas)
  const [primerLote] = lotes
  const idDetalle = `lotes-${id}`

  return (
    <>
      <tr
        className={`border-b border-gray-100 align-top transition-colors ${
          estado === 'agotado' ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-gray-50'
        }`}
      >
        <td className="px-3 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{id}</td>

        <td className="px-3 py-3 font-medium text-gray-800 min-w-40">{nombre}</td>

        <td className="px-3 py-3">
          <span className="inline-block rounded-full bg-sky-100 px-2 py-0.5 text-xs text-farma-azul whitespace-nowrap">
            {categoria}
          </span>
        </td>

        {/* Cajas + estado de stock (rojo/naranja si está bajo) */}
        <td className="px-3 py-3 text-right">
          <span className="font-semibold tabular-nums text-gray-800">{cajas}</span>
          <span className="mt-1 flex justify-end">
            <BadgeStock estado={estado} />
          </span>
        </td>

        <td className="px-3 py-3 text-right tabular-nums">{unidadesPorCaja}</td>

        <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
          {formatearPesos(precioCaja)}
        </td>

        <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap font-semibold text-farma-verde">
          {formatearPesos(precioUnitario)}
        </td>

        <td className="px-3 py-3 whitespace-nowrap">
          {primerLote ? (
            <>
              <span className="font-mono text-xs">{primerLote.lote}</span>
              {lotes.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMostrarLotes((visible) => !visible)}
                  aria-expanded={mostrarLotes}
                  aria-controls={idDetalle}
                  aria-label={`${mostrarLotes ? 'Ocultar' : 'Ver'} los ${lotes.length} lotes de ${nombre}`}
                  className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-farma-azul hover:bg-sky-200"
                >
                  {mostrarLotes ? 'Ocultar' : `+${lotes.length - 1}`}
                </button>
              )}
            </>
          ) : (
            <SinDato />
          )}
        </td>

        <td className="px-3 py-3">{primerLote ? <VencimientoLote lote={primerLote} /> : <SinDato />}</td>

        <td className="px-3 py-3 text-xs whitespace-nowrap">
          {primerLote ? primerLote.registroSanitario : <SinDato />}
        </td>
      </tr>

      {mostrarLotes && (
        <tr id={idDetalle} className="border-b border-gray-100 bg-sky-50/60">
          <td colSpan={TOTAL_COLUMNAS} className="px-3 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Lotes disponibles de {nombre}
            </p>
            <TablaLotes lotes={lotes} />
          </td>
        </tr>
      )}
    </>
  )
}

export default FilaMedicamento
