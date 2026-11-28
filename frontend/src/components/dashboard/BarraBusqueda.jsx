import { CATEGORIAS } from '../../data/constantes.js'
import {
  OPCIONES_ESTADO,
  contarPorCategoria,
  hayFiltrosActivos,
} from '../../utils/filtros.js'

const CLASE_CONTROL =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-farma-azul'

function BarraBusqueda({ medicamentos, filtros, alCambiarFiltros, alLimpiarFiltros }) {
  const conteoCategorias = contarPorCategoria(medicamentos)
  const filtrosActivos = hayFiltrosActivos(filtros)

  // Un solo manejador para el input y los dos selects (gracias a "name")
  function manejarCambio(evento) {
    const { name, value } = evento.target
    alCambiarFiltros({ ...filtros, [name]: value })
  }

  function limpiarTexto() {
    alCambiarFiltros({ ...filtros, texto: '' })
  }

  // La tecla Escape borra la búsqueda
  function manejarTecla(evento) {
    if (evento.key === 'Escape') {
      limpiarTexto()
    }
  }

  return (
    <div
      role="search"
      className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        {/* Buscador */}
        <div>
          <label htmlFor="filtro-texto" className="block text-xs font-medium text-gray-600 mb-1">
            Buscar por nombre, código, lote o INVIMA
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              id="filtro-texto"
              name="texto"
              type="search"
              value={filtros.texto}
              onChange={manejarCambio}
              onKeyDown={manejarTecla}
              placeholder="Ej: ibuprofeno, MED-003, AB1234 o 2023M-0001234"
              autoComplete="off"
              className={`${CLASE_CONTROL} pl-10 pr-10`}
            />
            {filtros.texto && (
              <button
                type="button"
                onClick={limpiarTexto}
                aria-label="Borrar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtro por categoría */}
        <div>
          <label htmlFor="filtro-categoria" className="block text-xs font-medium text-gray-600 mb-1">
            Categoría
          </label>
          <select
            id="filtro-categoria"
            name="categoria"
            value={filtros.categoria}
            onChange={manejarCambio}
            className={CLASE_CONTROL}
          >
            <option value="todas">Todas ({medicamentos.length})</option>
            {CATEGORIAS.map((categoria) => {
              const cantidad = conteoCategorias[categoria] ?? 0
              return (
                <option key={categoria} value={categoria} disabled={cantidad === 0}>
                  {categoria} ({cantidad})
                </option>
              )
            })}
          </select>
        </div>

        {/* Filtro por estado de stock */}
        <div>
          <label htmlFor="filtro-estado" className="block text-xs font-medium text-gray-600 mb-1">
            Estado de stock
          </label>
          <select
            id="filtro-estado"
            name="estado"
            value={filtros.estado}
            onChange={manejarCambio}
            className={CLASE_CONTROL}
          >
            {OPCIONES_ESTADO.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtrosActivos && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Hay filtros aplicados a la tabla de inventario.
          </p>
          <button
            type="button"
            onClick={alLimpiarFiltros}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}

export default BarraBusqueda
