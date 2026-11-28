import { useState } from 'react'

import TarjetaSeccion from '../ui/TarjetaSeccion.jsx'
import FilaMedicamento from './FilaMedicamento.jsx'
import TarjetaMedicamentoMovil from './TarjetaMedicamentoMovil.jsx'
import BadgeStock from './BadgeStock.jsx'
import { ESTADOS_STOCK, ORDEN_ESTADOS } from '../../data/estadosStock.js'
import { OPCIONES_ORDEN, ordenarMedicamentos } from '../../utils/ordenamiento.js'
import { pluralizar } from '../../utils/texto.js'

// Columnas de la tabla, en el orden definido para el inventario (Etapa 11)
const COLUMNAS = [
  { clave: 'codigo', titulo: 'Código' },
  { clave: 'nombre', titulo: 'Nombre' },
  { clave: 'categoria', titulo: 'Categoría' },
  { clave: 'cajas', titulo: 'Cajas', derecha: true },
  { clave: 'unidades', titulo: 'Und./Caja', derecha: true },
  { clave: 'precioCaja', titulo: 'Precio caja', derecha: true },
  { clave: 'precioUnitario', titulo: 'Precio unit.', derecha: true },
  { clave: 'lote', titulo: 'Lote' },
  { clave: 'vencimiento', titulo: 'Vencimiento' },
  { clave: 'invima', titulo: 'INVIMA' },
]

const CLASE_BOTON_RECEPCION =
  'rounded-lg border border-farma-azul px-3 py-1.5 text-sm font-semibold text-farma-azul hover:bg-sky-50 whitespace-nowrap'

function TablaInventario({
  medicamentos,
  lotesPorMedicamento,
  totalRegistrados,
  filtrosActivos,
  alLimpiarFiltros,
  alIrARecepcion,
}) {
  const [criterioOrden, setCriterioOrden] = useState('codigo')

  const medicamentosOrdenados = ordenarMedicamentos(medicamentos, criterioOrden, lotesPorMedicamento)
  const cantidadVisible = medicamentos.length

  const descripcion = filtrosActivos
    ? `Mostrando ${cantidadVisible} de ${pluralizar(totalRegistrados, 'medicamento', 'medicamentos')}`
    : pluralizar(totalRegistrados, 'medicamento registrado', 'medicamentos registrados')

  const acciones = (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="whitespace-nowrap">Ordenar por</span>
        <select
          value={criterioOrden}
          onChange={(evento) => setCriterioOrden(evento.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-farma-azul"
        >
          {OPCIONES_ORDEN.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={alIrARecepcion} className={CLASE_BOTON_RECEPCION}>
        📋 Registrar ingreso
      </button>
    </div>
  )

  // Caso 1: el inventario está vacío
  if (totalRegistrados === 0) {
    return (
      <TarjetaSeccion titulo="Inventario" descripcion={descripcion} icono="📦">
        <div className="py-10 text-center">
          <p className="text-4xl" aria-hidden="true">
            📭
          </p>
          <p className="mt-2 font-medium text-gray-700">No hay medicamentos en el inventario</p>
          <p className="text-sm text-gray-500">
            Los productos ingresan al cerrar un acta de Recepción técnica.
          </p>
          <button type="button" onClick={alIrARecepcion} className={`${CLASE_BOTON_RECEPCION} mt-4`}>
            Ir a Recepción técnica
          </button>
        </div>
      </TarjetaSeccion>
    )
  }

  // Caso 2: hay medicamentos, pero ninguno coincide con los filtros
  if (cantidadVisible === 0) {
    return (
      <TarjetaSeccion titulo="Inventario" descripcion={descripcion} icono="📦">
        <div className="py-10 text-center">
          <p className="text-4xl" aria-hidden="true">
            🔍
          </p>
          <p className="mt-2 font-medium text-gray-700">Ningún medicamento coincide con la búsqueda</p>
          <p className="text-sm text-gray-500">Revisa lo que escribiste o quita algún filtro.</p>
          <button
            type="button"
            onClick={alLimpiarFiltros}
            className="mt-4 rounded-lg bg-farma-azul px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Limpiar filtros
          </button>
        </div>
      </TarjetaSeccion>
    )
  }

  // Caso 3: hay resultados para mostrar
  return (
    <TarjetaSeccion titulo="Inventario" descripcion={descripcion} icono="📦" acciones={acciones}>
      {/* Vista de tabla: escritorio */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Inventario de medicamentos con stock, precios, lote, vencimiento y registro INVIMA
          </caption>
          <thead className="bg-sky-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              {COLUMNAS.map((columna) => (
                <th
                  key={columna.clave}
                  scope="col"
                  className={`px-3 py-3 font-semibold whitespace-nowrap ${
                    columna.derecha ? 'text-right' : 'text-left'
                  }`}
                >
                  {columna.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {medicamentosOrdenados.map((medicamento) => (
              <FilaMedicamento
                key={medicamento.id}
                medicamento={medicamento}
                lotes={lotesPorMedicamento[medicamento.id]}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas: celulares y tablets */}
      <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
        {medicamentosOrdenados.map((medicamento) => (
          <TarjetaMedicamentoMovil
            key={medicamento.id}
            medicamento={medicamento}
            lotes={lotesPorMedicamento[medicamento.id]}
          />
        ))}
      </ul>

      {/* Leyenda */}
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Estados de stock
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {ORDEN_ESTADOS.map((estado) => (
              <li key={estado} className="flex items-center gap-2 text-xs text-gray-600">
                <BadgeStock estado={estado} />
                <span>{ESTADOS_STOCK[estado].descripcion}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-500">
          <strong>Lote, vencimiento e INVIMA</strong> provienen de Recepción técnica y muestran
          el lote disponible que vence primero (FEFO). Usa <strong>+N</strong> para ver los demás
          lotes. Un guion (—) indica que el producto no tiene lotes disponibles registrados.
        </p>
      </div>
    </TarjetaSeccion>
  )
}

export default TablaInventario
