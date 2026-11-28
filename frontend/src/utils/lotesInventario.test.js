import { describe, it, expect } from 'vitest'

import { agruparLotesDisponibles, describirVencimiento } from './lotesInventario.js'
import { filtrarMedicamentos, FILTROS_INICIALES } from './filtros.js'
import { ordenarMedicamentos } from './ordenamiento.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

const HOY = new Date(2026, 10, 3, 9, 0) // 3 nov 2026

function lote(id, medicamentoId, vencimiento, cambios = {}) {
  return {
    id,
    medicamentoId,
    lote: `L-${id}`,
    registroSanitario: `INVIMA 2024M-00${id.slice(-2)}`,
    vencimiento,
    sinVencimiento: false,
    estado: 'disponible',
    cajas: 5,
    ...cambios,
  }
}

const LOTES = [
  lote('LOT-0001', 'MED-001', '08/2028'),
  lote('LOT-0002', 'MED-001', '11/2027'),
  lote('LOT-0003', 'MED-002', '02/2027'),
  lote('LOT-0004', 'MED-003', '05/2028', { estado: 'cuarentena' }),
  lote('LOT-0005', 'MED-004', '', { sinVencimiento: true }),
  lote('LOT-0006', null, '01/2028'), // producto nuevo aún no creado
]

describe('agruparLotesDisponibles', () => {
  const grupos = agruparLotesDisponibles(LOTES)

  it('solo incluye lotes disponibles con medicamento asignado', () => {
    expect(Object.keys(grupos).sort()).toEqual(['MED-001', 'MED-002', 'MED-004'])
  })

  it('ordena FEFO: primero el lote que vence antes', () => {
    expect(grupos['MED-001'].map((l) => l.id)).toEqual(['LOT-0002', 'LOT-0001'])
  })
})

describe('describirVencimiento', () => {
  it.each([
    ['10/2026', 'vencido'],
    ['02/2027', 'proximo'],
    ['08/2028', 'vigente'],
  ])('%s → %s', (vencimiento, tono) => {
    expect(describirVencimiento({ vencimiento, sinVencimiento: false }, HOY).tono).toBe(tono)
  })

  it('un dispositivo sin vencimiento dice "No aplica"', () => {
    expect(describirVencimiento({ sinVencimiento: true }, HOY).texto).toBe('No aplica')
  })
})

describe('búsqueda y orden con lotes', () => {
  const grupos = agruparLotesDisponibles(LOTES)

  it('encuentra un medicamento por su número de lote o su INVIMA', () => {
    const porLote = filtrarMedicamentos(medicamentosIniciales, { ...FILTROS_INICIALES, texto: 'l-lot-0003' }, grupos)
    const porInvima = filtrarMedicamentos(medicamentosIniciales, { ...FILTROS_INICIALES, texto: '2024m-0002' }, grupos)

    expect(porLote.map((m) => m.id)).toEqual(['MED-002'])
    expect(porInvima.map((m) => m.id)).toEqual(['MED-001'])
  })

  it('ordena por el vencimiento más próximo; sin lote al final', () => {
    const ids = ordenarMedicamentos(medicamentosIniciales, 'vencimiento', grupos).map((m) => m.id)
    expect(ids.slice(0, 3)).toEqual(['MED-002', 'MED-001', 'MED-004'])
    expect(ids).toHaveLength(8)
  })
})
