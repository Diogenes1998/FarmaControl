import {
  calcularValorInventario,
  calcularUnidadesTotales,
  contarStockBajo,
  obtenerEstadoStock,
} from './calculos.js'

// Calcula todas las métricas del dashboard en un solo objeto
export function calcularMetricas(medicamentos) {
  const conteoEstados = medicamentos.reduce(
    (conteo, medicamento) => {
      const estado = obtenerEstadoStock(medicamento.cajas)
      conteo[estado] += 1
      return conteo
    },
    { agotado: 0, critico: 0, bajo: 0, normal: 0 }
  )

  const categoriasDistintas = new Set(
    medicamentos.map((medicamento) => medicamento.categoria)
  )

  const unidadesTotales = medicamentos.reduce(
    (suma, medicamento) => suma + calcularUnidadesTotales(medicamento),
    0
  )

  return {
    totalMedicamentos: medicamentos.length,
    totalCategorias: categoriasDistintas.size,
    stockBajo: contarStockBajo(medicamentos),
    criticos: conteoEstados.critico,
    agotados: conteoEstados.agotado,
    valorTotal: calcularValorInventario(medicamentos),
    unidadesTotales,
  }
}
