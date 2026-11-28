import TarjetaMetrica from './TarjetaMetrica.jsx'
import BarraBusqueda from './BarraBusqueda.jsx'
import { STOCK_MINIMO } from '../../data/constantes.js'
import { calcularMetricas } from '../../utils/metricas.js'
import { formatearPesos, formatearNumero } from '../../utils/formatos.js'
import { pluralizar } from '../../utils/texto.js'

function PanelMetricas({ medicamentos, filtros, alCambiarFiltros, alLimpiarFiltros }) {
  const metricas = calcularMetricas(medicamentos)

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Activa un filtro de estado; si ya estaba activo, lo quita
  function alternarFiltroEstado(estado) {
    const yaActivo = filtros.estado === estado

    alCambiarFiltros({ ...filtros, estado: yaActivo ? 'todos' : estado })

    if (!yaActivo) {
      document
        .getElementById('seccion-inventario')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section aria-labelledby="titulo-panel" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="titulo-panel" className="text-xl font-bold text-gray-800">
            Panel principal
          </h2>
          <p className="text-sm text-gray-500">Resumen general del inventario</p>
        </div>
        <p className="text-sm text-gray-500 first-letter:uppercase">{fechaHoy}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaMetrica
          titulo="Total de medicamentos"
          valor={formatearNumero(metricas.totalMedicamentos)}
          detalle={`En ${pluralizar(metricas.totalCategorias, 'categoría', 'categorías')}`}
          icono="💊"
          tono="azul"
        />

        <TarjetaMetrica
          titulo={`Stock bajo (< ${STOCK_MINIMO} cajas)`}
          valor={formatearNumero(metricas.stockBajo)}
          detalle={`${pluralizar(metricas.criticos, 'crítico', 'críticos')} · ${pluralizar(
            metricas.agotados,
            'agotado',
            'agotados'
          )}`}
          icono="⚠️"
          tono="naranja"
          activa={filtros.estado === 'stockBajo'}
          alHacerClic={() => alternarFiltroEstado('stockBajo')}
        />

        <TarjetaMetrica
          titulo="Valor total estimado"
          valor={formatearPesos(metricas.valorTotal)}
          detalle={`${formatearNumero(metricas.unidadesTotales)} unidades en stock`}
          icono="💰"
          tono="verde"
        />

        <TarjetaMetrica
          titulo="Agotados"
          valor={formatearNumero(metricas.agotados)}
          detalle={
            metricas.agotados > 0 ? 'Requieren pedido urgente' : 'Sin productos agotados'
          }
          icono="⛔"
          tono="rojo"
          activa={filtros.estado === 'agotado'}
          alHacerClic={() => alternarFiltroEstado('agotado')}
        />
      </div>

      <BarraBusqueda
        medicamentos={medicamentos}
        filtros={filtros}
        alCambiarFiltros={alCambiarFiltros}
        alLimpiarFiltros={alLimpiarFiltros}
      />
    </section>
  )
}

export default PanelMetricas
