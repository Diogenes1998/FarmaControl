import { describe, it, expect } from 'vitest'

import {
  calcularPrecioUnitario,
  calcularUnidadesTotales,
  calcularValorInventario,
  contarStockBajo,
  obtenerEstadoStock,
} from './calculos.js'
import { generarCodigo } from './generarCodigo.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

describe('calcularPrecioUnitario', () => {
  it('divide el precio de la caja entre las unidades', () => {
    expect(calcularPrecioUnitario(8000, 10)).toBe(800)
  })

  it('acepta valores en texto, como llegan del formulario', () => {
    expect(calcularPrecioUnitario('7500', '10')).toBe(750)
  })

  it('devuelve 0 si las unidades son 0 (evita dividir entre cero)', () => {
    expect(calcularPrecioUnitario(8000, 0)).toBe(0)
  })

  it('devuelve 0 con datos vacíos, negativos o no numéricos', () => {
    expect(calcularPrecioUnitario('abc', 10)).toBe(0)
    expect(calcularPrecioUnitario('', '')).toBe(0)
    expect(calcularPrecioUnitario(-100, 10)).toBe(0)
  })

  it('calcula correctamente resultados con decimales', () => {
    expect(calcularPrecioUnitario(18500, 21)).toBeCloseTo(880.95, 2)
  })
})

describe('obtenerEstadoStock', () => {
  it.each([
    [0, 'agotado'],
    [1, 'critico'],
    [4, 'critico'],
    [5, 'bajo'],
    [9, 'bajo'],
    [10, 'normal'],
    [40, 'normal'],
  ])('%i cajas → %s', (cajas, estadoEsperado) => {
    expect(obtenerEstadoStock(cajas)).toBe(estadoEsperado)
  })
})

describe('métricas con los datos de ejemplo', () => {
  it('el valor total del inventario es $ 1.238.400', () => {
    expect(calcularValorInventario(medicamentosIniciales)).toBe(1238400)
  })

  it('hay 4 medicamentos con stock bajo (incluye agotados)', () => {
    expect(contarStockBajo(medicamentosIniciales)).toBe(4)
  })

  it('hay 1.916 unidades sueltas en total', () => {
    const total = medicamentosIniciales.reduce(
      (suma, medicamento) => suma + calcularUnidadesTotales(medicamento),
      0
    )
    expect(total).toBe(1916)
  })
})

describe('generarCodigo', () => {
  it('empieza en MED-001 si no hay medicamentos', () => {
    expect(generarCodigo([])).toBe('MED-001')
  })

  it('continúa después del código más alto', () => {
    expect(generarCodigo(medicamentosIniciales)).toBe('MED-009')
  })

  it('no reutiliza códigos aunque haya huecos por eliminaciones', () => {
    expect(generarCodigo([{ id: 'MED-001' }, { id: 'MED-005' }])).toBe('MED-006')
  })

  it('ignora códigos con formato inválido', () => {
    expect(generarCodigo([{ id: 'ABC' }, { id: 'MED-002' }])).toBe('MED-003')
  })
})
