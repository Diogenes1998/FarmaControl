import { describe, it, expect } from 'vitest'

import { cerrarActa } from './actas.js'
import {
  contarPendientes,
  disposicionesPermitidas,
  liberarLote,
  rechazarLote,
  registrarDisposicion,
  validarDisposicion,
  validarLiberacion,
} from './lotes.js'
import { medicamentosIniciales } from '../../data/medicamentosIniciales.js'
import { encabezadoValido, itemAmoxicilina, itemConforme, itemInsulina } from './datosPrueba.js'

const AHORA = new Date(2026, 10, 3, 9, 0)

// Cierra el acta del formato y devuelve sus lotes [ibuprofeno, amoxicilina, insulina]
function lotesDelFormato() {
  return cerrarActa({
    acta: encabezadoValido({ items: [itemConforme(), itemAmoxicilina(), itemInsulina()] }),
    medicamentos: medicamentosIniciales,
    lotes: [],
    ahora: AHORA,
  }).lotesNuevos
}

const DATOS_LIBERACION = {
  soporte: 'Descarga del datalogger TX-123: 3,1 a 6,8 °C durante todo el trayecto',
  responsable: 'Q.F. Directora técnica',
}

describe('liberar un lote de cuarentena', () => {
  it('la insulina liberada se crea en el inventario y queda disponible', () => {
    const insulina = lotesDelFormato()[2]
    const errores = validarLiberacion(insulina, DATOS_LIBERACION, {
      medicamentos: medicamentosIniciales,
      ahora: AHORA,
    })
    expect(errores).toEqual({})

    const resultado = liberarLote(insulina, DATOS_LIBERACION, {
      medicamentos: medicamentosIniciales,
      ahora: AHORA,
    })

    expect(resultado.lote.estado).toBe('disponible')
    expect(resultado.lote.medicamentoId).toBe('MED-009')
    expect(resultado.lote.historial).toHaveLength(2)
    expect(resultado.medicamentos.find((med) => med.id === 'MED-009').cajas).toBe(2)
  })

  it('exige un soporte descriptivo', () => {
    const errores = validarLiberacion(
      lotesDelFormato()[1],
      { soporte: 'ok', responsable: 'Q.F. Directora' },
      { medicamentos: medicamentosIniciales, ahora: AHORA }
    )
    expect(errores.soporte).toBeTruthy()
  })

  it('no permite liberar un lote que venció durante la cuarentena', () => {
    const errores = validarLiberacion(lotesDelFormato()[1], DATOS_LIBERACION, {
      medicamentos: medicamentosIniciales,
      ahora: new Date(2027, 6, 15),
    })
    expect(errores.general).toMatch(/venció/)
  })
})

describe('disposición final de rechazados', () => {
  it('ante sospecha de falsificación solo permite retener y reportar', () => {
    const lote = { ...lotesDelFormato()[0], estado: 'rechazado', reporteSanitario: true }

    expect(disposicionesPermitidas(lote).map((tipo) => tipo.valor)).toEqual(['retencionReporte'])

    const errores = validarDisposicion(lote, {
      tipo: 'devolucion',
      soporte: 'AD-001',
      responsable: 'Q.F. Directora',
    })
    expect(errores.tipo).toMatch(/retener y reportar/)
  })

  it('sin sospecha permite devolución o destrucción', () => {
    const lote = { ...lotesDelFormato()[0], estado: 'rechazado' }
    expect(disposicionesPermitidas(lote).map((tipo) => tipo.valor)).toEqual([
      'devolucion',
      'destruccion',
    ])
  })

  it('rechazar y luego devolver cierra la no conformidad', () => {
    const rechazado = rechazarLote(
      lotesDelFormato()[1],
      { motivo: 'El proveedor no entregó compromiso de canje', responsable: 'Q.F. Directora' },
      AHORA
    )
    const cerrado = registrarDisposicion(
      rechazado,
      { tipo: 'devolucion', soporte: 'AD-2026-014', responsable: 'Q.F. Directora' },
      AHORA
    )

    expect(cerrado.estado).toBe('cerrado')
    expect(cerrado.disposicion.tipo).toBe('devolucion')
    expect(cerrado.historial).toHaveLength(3)
  })

  it('cuenta como pendientes los lotes en cuarentena y los rechazados', () => {
    expect(contarPendientes(lotesDelFormato())).toBe(2)
  })
})
