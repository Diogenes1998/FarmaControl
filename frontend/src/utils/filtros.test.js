import { describe, it, expect } from 'vitest'

import {
  FILTROS_INICIALES,
  filtrarMedicamentos,
  hayFiltrosActivos,
} from './filtros.js'
import { normalizarTexto } from './texto.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

// Atajo: aplica filtros y devuelve solo los códigos del resultado
function codigosFiltrados(cambios) {
  return filtrarMedicamentos(medicamentosIniciales, {
    ...FILTROS_INICIALES,
    ...cambios,
  }).map((medicamento) => medicamento.id)
}

describe('normalizarTexto', () => {
  it('quita tildes, espacios extremos y mayúsculas', () => {
    expect(normalizarTexto('  Acetaminofén ')).toBe('acetaminofen')
  })
})

describe('filtrarMedicamentos', () => {
  it('sin filtros devuelve todos los medicamentos', () => {
    expect(codigosFiltrados({})).toHaveLength(8)
  })

  it('encuentra por nombre aunque se escriba sin tilde', () => {
    expect(codigosFiltrados({ texto: 'acetaminofen' })).toEqual(['MED-001'])
  })

  it('encuentra por parte del código', () => {
    expect(codigosFiltrados({ texto: '004' })).toEqual(['MED-004'])
  })

  it('el filtro de stock bajo incluye bajo, crítico y agotado', () => {
    expect(codigosFiltrados({ estado: 'stockBajo' })).toEqual([
      'MED-002',
      'MED-004',
      'MED-006',
      'MED-008',
    ])
  })

  it('combina búsqueda y estado (deben cumplirse ambos)', () => {
    expect(codigosFiltrados({ texto: 'lo', estado: 'stockBajo' })).toEqual(['MED-006'])
  })

  it('filtra por categoría', () => {
    expect(codigosFiltrados({ categoria: 'Antibiótico' })).toEqual(['MED-002'])
  })

  it('devuelve un arreglo nuevo sin modificar el original', () => {
    const resultado = filtrarMedicamentos(medicamentosIniciales, FILTROS_INICIALES)
    expect(resultado).not.toBe(medicamentosIniciales)
    expect(medicamentosIniciales).toHaveLength(8)
  })
})

describe('hayFiltrosActivos', () => {
  it('distingue filtros iniciales de filtros aplicados', () => {
    expect(hayFiltrosActivos(FILTROS_INICIALES)).toBe(false)
    expect(hayFiltrosActivos({ ...FILTROS_INICIALES, texto: 'ibu' })).toBe(true)
  })
})
