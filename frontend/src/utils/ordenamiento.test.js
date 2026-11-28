import { describe, it, expect } from 'vitest'

import { ordenarMedicamentos } from './ordenamiento.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

describe('ordenarMedicamentos', () => {
  it('no modifica el arreglo original', () => {
    const codigosAntes = medicamentosIniciales.map((medicamento) => medicamento.id)

    ordenarMedicamentos(medicamentosIniciales, 'stockDesc')

    expect(medicamentosIniciales.map((medicamento) => medicamento.id)).toEqual(codigosAntes)
  })

  it('ordena por stock de menor a mayor', () => {
    const resultado = ordenarMedicamentos(medicamentosIniciales, 'stockAsc')
    expect(resultado[0].id).toBe('MED-008')
    expect(resultado[resultado.length - 1].id).toBe('MED-005')
  })

  it('ordena por nombre respetando tildes', () => {
    const resultado = ordenarMedicamentos(medicamentosIniciales, 'nombre')
    expect(resultado[0].nombre).toBe('Acetaminofén 500 mg')
    expect(resultado[resultado.length - 1].nombre).toBe('Salbutamol inhalador 100 mcg')
  })

  it('ordena los códigos de forma numérica (MED-009 antes que MED-010)', () => {
    const resultado = ordenarMedicamentos(
      [{ id: 'MED-010' }, { id: 'MED-009' }, { id: 'MED-002' }],
      'codigo'
    )
    expect(resultado.map((medicamento) => medicamento.id)).toEqual([
      'MED-002',
      'MED-009',
      'MED-010',
    ])
  })
})
