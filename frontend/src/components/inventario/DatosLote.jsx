import {
  CLASES_TONO_VENCIMIENTO,
  describirVencimiento,
} from '../../utils/lotesInventario.js'

// Guion para un medicamento sin lotes disponibles registrados por Recepción técnica
export function SinDato() {
  return (
    <span className="text-gray-400" title="Sin lote disponible registrado en Recepción técnica">
      —<span className="sr-only">Sin lote registrado</span>
    </span>
  )
}

// Fecha de vencimiento y vida útil restante, en rojo o naranja si requiere atención
export function VencimientoLote({ lote }) {
  const { texto, detalle, tono } = describirVencimiento(lote)

  return (
    <>
      <span className="whitespace-nowrap">{texto}</span>
      {detalle && (
        <span className={`block text-xs whitespace-nowrap ${CLASES_TONO_VENCIMIENTO[tono]}`}>
          {detalle}
        </span>
      )}
    </>
  )
}

// Lista de TODOS los lotes disponibles de un medicamento (orden FEFO)
export function TablaLotes({ lotes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-gray-500">
          <tr>
            <th scope="col" className="py-1 pr-4 font-semibold">Lote</th>
            <th scope="col" className="py-1 pr-4 font-semibold">Vencimiento</th>
            <th scope="col" className="py-1 pr-4 font-semibold">INVIMA</th>
            <th scope="col" className="py-1 pr-4 text-right font-semibold">Cajas recibidas</th>
            <th scope="col" className="py-1 font-semibold">Acta</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote, indice) => (
            <tr key={lote.id} className="border-t border-sky-100 align-top">
              <td className="py-1.5 pr-4 font-mono">
                {lote.lote}
                {indice === 0 && (
                  <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-farma-azul">
                    Sale primero
                  </span>
                )}
              </td>
              <td className="py-1.5 pr-4">
                <VencimientoLote lote={lote} />
              </td>
              <td className="py-1.5 pr-4 whitespace-nowrap">{lote.registroSanitario}</td>
              <td className="py-1.5 pr-4 text-right tabular-nums">{lote.cajas}</td>
              <td className="py-1.5 font-mono text-gray-500">{lote.actaId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
