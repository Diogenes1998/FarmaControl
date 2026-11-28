import { describe, it, expect } from 'vitest'

import {
  cerrarActa,
  generarConsecutivo,
  guardarItemEnActa,
  incorporarAlInventario,
  validarCierreActa,
} from './actas.js'
import { medicamentosIniciales } from '../../data/medicamentosIniciales.js'
import {
  encabezadoValido,
  itemAmoxicilina,
  itemConforme,
  itemInsulina,
} from './datosPrueba.js'

// Acta con los 3 ítems del formato de la droguería
function actaDelFormato() {
  return encabezadoValido({ items: [itemConforme(), itemAmoxicilina(), itemInsulina()] })
}

describe('consecutivos', () => {
  it('genera ACT-0001 y continúa desde el mayor', () => {
    expect(generarConsecutivo([], 'ACT-')).toBe('ACT-0001')
    expect(generarConsecutivo([{ id: 'ACT-0001' }, { id: 'ACT-0003' }], 'ACT-')).toBe('ACT-0004')
  })

  it('numera los ítems dentro del acta y reemplaza los existentes', () => {
    const { id: _idIgnorado, ...sinId } = itemConforme()
    let acta = guardarItemEnActa(encabezadoValido(), sinId)
    acta = guardarItemEnActa(acta, sinId)

    expect(acta.items.map((item) => item.id)).toEqual(['ACT-0001-1', 'ACT-0001-2'])

    acta = guardarItemEnActa(acta, { ...acta.items[0], lote: 'NUEVO1' })
    expect(acta.items).toHaveLength(2)
    expect(acta.items[0].lote).toBe('NUEVO1')
  })
})

describe('validarCierreActa', () => {
  it('exige encabezado completo y al menos un ítem', () => {
    const acta = encabezadoValido({ proveedor: '' })
    expect(validarCierreActa(acta, medicamentosIniciales)).toHaveLength(2)
  })

  it('permite cerrar el acta completa del formato', () => {
    expect(validarCierreActa(actaDelFormato(), medicamentosIniciales)).toEqual([])
  })
})

describe('cerrarActa', () => {
  const ahora = new Date(2026, 10, 2, 11, 0)
  const resultado = cerrarActa({
    acta: actaDelFormato(),
    medicamentos: medicamentosIniciales,
    lotes: [],
    ahora,
  })

  it('crea un lote por ítem con el estado según su dictamen', () => {
    expect(resultado.lotesNuevos.map((lote) => lote.id)).toEqual([
      'LOT-0001',
      'LOT-0002',
      'LOT-0003',
    ])
    expect(resultado.lotesNuevos.map((lote) => lote.estado)).toEqual([
      'disponible',
      'cuarentena',
      'cuarentena',
    ])
  })

  it('suma al inventario SOLO lo aprobado', () => {
    const ibuprofeno = resultado.medicamentos.find((med) => med.id === 'MED-004')
    const amoxicilina = resultado.medicamentos.find((med) => med.id === 'MED-002')

    expect(ibuprofeno.cajas).toBe(13) // 3 + 10 aprobadas
    expect(amoxicilina.cajas).toBe(6) // sin cambios: está en cuarentena
    expect(resultado.medicamentos).toHaveLength(8) // la insulina aún no se crea
  })

  it('deja el acta cerrada con el resumen de dictámenes', () => {
    expect(resultado.actaCerrada.estado).toBe('cerrada')
    expect(resultado.actaCerrada.resumen).toEqual({ aprobado: 1, cuarentena: 2, rechazado: 0 })
  })

  it('evalúa la vida útil con la fecha de RECEPCIÓN, no con la de cierre', () => {
    const cierreTardio = cerrarActa({
      acta: actaDelFormato(),
      medicamentos: medicamentosIniciales,
      lotes: [],
      ahora: new Date(2027, 6, 15),
    })
    // En julio de 2027 la amoxicilina ya estaría vencida, pero se recibió con 7,9 meses
    expect(cierreTardio.lotesNuevos[1].dictamenInicial).toBe('cuarentena')
  })

  it('no modifica el inventario original', () => {
    expect(medicamentosIniciales.find((med) => med.id === 'MED-004').cajas).toBe(3)
  })
})

describe('incorporarAlInventario', () => {
  it('crea un producto nuevo con el siguiente código', () => {
    const resultado = incorporarAlInventario(medicamentosIniciales, {
      medicamentoId: null,
      nuevoMedicamento: itemInsulina().nuevoMedicamento,
      cajas: 2,
    })

    expect(resultado.medicamentoId).toBe('MED-009')
    expect(resultado.medicamentos).toHaveLength(9)
  })

  it('reutiliza un medicamento existente con el mismo nombre', () => {
    const resultado = incorporarAlInventario(medicamentosIniciales, {
      medicamentoId: null,
      nuevoMedicamento: { nombre: 'IBUPROFENO 400 MG', categoria: 'Antiinflamatorio', unidadesPorCaja: 20, precioCaja: 9800 },
      cajas: 5,
    })

    expect(resultado.medicamentoId).toBe('MED-004')
    expect(resultado.medicamentos).toHaveLength(8)
  })
})
