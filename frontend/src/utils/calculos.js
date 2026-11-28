import { STOCK_MINIMO, STOCK_CRITICO } from '../data/constantes.js'

// Precio de una sola unidad (pastilla, sobre, ampolla...)
export function calcularPrecioUnitario(precioCaja, unidadesPorCaja) {
  const precio = Number(precioCaja)
  const unidades = Number(unidadesPorCaja)

  if (!Number.isFinite(precio) || !Number.isFinite(unidades)) return 0
  if (precio < 0 || unidades <= 0) return 0

  return precio / unidades
}

// Total de unidades sueltas de un medicamento (cajas × unidades por caja)
export function calcularUnidadesTotales(medicamento) {
  return Number(medicamento.cajas) * Number(medicamento.unidadesPorCaja)
}

// Valor en dinero de un medicamento (cajas × precio por caja)
export function calcularValorMedicamento(medicamento) {
  return Number(medicamento.cajas) * Number(medicamento.precioCaja)
}

// Valor total de todo el inventario
export function calcularValorInventario(medicamentos) {
  return medicamentos.reduce(
    (acumulado, medicamento) => acumulado + calcularValorMedicamento(medicamento),
    0
  )
}

// Clasifica el stock: 'agotado' | 'critico' | 'bajo' | 'normal'
export function obtenerEstadoStock(cajas) {
  const cantidad = Number(cajas)

  if (cantidad <= 0) return 'agotado'
  if (cantidad < STOCK_CRITICO) return 'critico'
  if (cantidad < STOCK_MINIMO) return 'bajo'
  return 'normal'
}

// Cuántos medicamentos tienen stock por debajo del mínimo (incluye agotados)
export function contarStockBajo(medicamentos) {
  return medicamentos.filter(
    (medicamento) => Number(medicamento.cajas) < STOCK_MINIMO
  ).length
}
