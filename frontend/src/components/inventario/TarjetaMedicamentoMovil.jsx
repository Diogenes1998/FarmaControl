import BadgeStock from './BadgeStock.jsx'
import { SinDato, TablaLotes, VencimientoLote } from './DatosLote.jsx'
import { calcularPrecioUnitario, obtenerEstadoStock } from '../../utils/calculos.js'
import { formatearPesos } from '../../utils/formatos.js'

// Misma información que FilaMedicamento, organizada para pantallas angostas
function TarjetaMedicamentoMovil({ medicamento, lotes = [] }) {
  const { id, nombre, categoria, cajas, unidadesPorCaja, precioCaja } = medicamento
  const precioUnitario = calcularPrecioUnitario(precioCaja, unidadesPorCaja)
  const estado = obtenerEstadoStock(cajas)
  const [primerLote] = lotes

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-gray-500">{id}</p>
          <h3 className="font-semibold text-gray-800">{nombre}</h3>
          <span className="mt-1 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-xs text-farma-azul">
            {categoria}
          </span>
        </div>
        <BadgeStock estado={estado} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-gray-500">Cajas</dt>
          <dd className="font-semibold">{cajas}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Und./caja</dt>
          <dd className="font-medium">{unidadesPorCaja}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Precio caja</dt>
          <dd className="font-medium">{formatearPesos(precioCaja)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Precio unit.</dt>
          <dd className="font-bold text-farma-verde">{formatearPesos(precioUnitario)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Lote</dt>
          <dd className="font-mono text-xs">{primerLote ? primerLote.lote : <SinDato />}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Vencimiento</dt>
          <dd>{primerLote ? <VencimientoLote lote={primerLote} /> : <SinDato />}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-gray-500">INVIMA</dt>
          <dd className="text-xs">{primerLote ? primerLote.registroSanitario : <SinDato />}</dd>
        </div>
      </dl>

      {lotes.length > 1 && (
        <details className="mt-3 rounded-lg bg-sky-50/60 px-3 py-2">
          <summary className="cursor-pointer text-xs font-semibold text-farma-azul">
            Ver los {lotes.length} lotes disponibles
          </summary>
          <div className="mt-2">
            <TablaLotes lotes={lotes} />
          </div>
        </details>
      )}
    </li>
  )
}

export default TarjetaMedicamentoMovil
