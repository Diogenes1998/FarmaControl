import { describe, it, expect } from 'vitest'

import { evaluarItem } from './evaluacion.js'
import { calcularVidaUtilMeses, formatearVidaUtil, parsearVencimiento } from './fechas.js'
import {
  FECHA_RECEPCION,
  itemAmoxicilina,
  itemConforme,
  itemInsulina,
} from './datosPrueba.js'

// Atajo: evalúa en la fecha de recepción de referencia
function evaluar(item) {
  return evaluarItem(item, { fechaReferencia: FECHA_RECEPCION })
}

function niveles(evaluacion) {
  return evaluacion.causales.map((causal) => causal.nivel)
}

describe('fechas de vencimiento', () => {
  it('interpreta MM/AAAA y rechaza otros formatos', () => {
    expect(parsearVencimiento('06/2027')).toEqual({ mes: 6, anio: 2027 })
    expect(parsearVencimiento('13/2027')).toBeNull()
    expect(parsearVencimiento('2027-06')).toBeNull()
  })

  it('cuenta la vida útil hasta el último día del mes de vencimiento', () => {
    expect(calcularVidaUtilMeses('06/2027', FECHA_RECEPCION)).toBeCloseTo(7.9, 1)
    expect(calcularVidaUtilMeses('12/2028', FECHA_RECEPCION)).toBeCloseTo(26, 1)
  })

  it('da un valor negativo aunque el producto haya vencido hace solo 2 días', () => {
    expect(calcularVidaUtilMeses('10/2026', FECHA_RECEPCION)).toBeLessThan(0)
  })

  it('muestra la vida útil redondeada a un decimal', () => {
    expect(formatearVidaUtil(calcularVidaUtilMeses('06/2027', FECHA_RECEPCION))).toBe('7,9 meses')
    expect(formatearVidaUtil(-0.04)).toBe('Vencido')
    expect(formatearVidaUtil(null)).toBe('No aplica')
  })
})

describe('los 3 ítems del formato de la droguería', () => {
  it('ítem 1 (ibuprofeno, todo conforme) → APROBADO sin causales', () => {
    const resultado = evaluar(itemConforme())
    expect(resultado.dictamen).toBe('aprobado')
    expect(resultado.causales).toHaveLength(0)
  })

  it('ítem 2 (amoxicilina, menos de 8 meses de vida útil) → CUARENTENA', () => {
    const resultado = evaluar(itemAmoxicilina())
    expect(resultado.dictamen).toBe('cuarentena')
    expect(resultado.vidaUtilMeses).toBeCloseTo(7.9, 1)
    expect(resultado.causales[0].texto).toMatch(/inferior a la política/)
  })

  it('ítem 3 (insulina sin temperatura ni soporte) → CUARENTENA', () => {
    const resultado = evaluar(itemInsulina())
    expect(resultado.dictamen).toBe('cuarentena')
    expect(niveles(resultado)).toEqual(['cuarentena', 'cuarentena'])
  })
})

describe('vida útil inferior a la política', () => {
  it('se aprueba con excepción documentada y compromiso de canje', () => {
    const resultado = evaluar(
      itemAmoxicilina({
        excepcionVidaUtil: true,
        compromisoCanje: true,
        justificacionExcepcion: 'Rotación de 3 frascos/mes: se agota en 2 meses',
      })
    )
    expect(resultado.dictamen).toBe('aprobado')
    expect(niveles(resultado)).toEqual(['advertencia'])
  })

  it('sigue en cuarentena si falta el compromiso de canje', () => {
    const resultado = evaluar(
      itemAmoxicilina({
        excepcionVidaUtil: true,
        compromisoCanje: false,
        justificacionExcepcion: 'Rotación de 3 frascos/mes: se agota en 2 meses',
      })
    )
    expect(resultado.dictamen).toBe('cuarentena')
  })

  it('un producto vencido se rechaza', () => {
    expect(evaluar(itemConforme({ vencimiento: '10/2026' })).dictamen).toBe('rechazado')
  })
})

describe('cadena de frío', () => {
  it('con temperatura en rango y soporte del transporte → APROBADO', () => {
    const resultado = evaluar(
      itemInsulina({ temperaturaLlegada: 5, soporteTemperatura: 'Datalogger TX-123 en rango' })
    )
    expect(resultado.dictamen).toBe('aprobado')
  })

  it('con el indicador de congelación activado → RECHAZADO', () => {
    const resultado = evaluar(
      itemInsulina({
        temperaturaLlegada: 4,
        soporteTemperatura: 'Datalogger TX-123',
        indicadorCongelacion: 'activado',
      })
    )
    expect(resultado.dictamen).toBe('rechazado')
  })

  it.each([
    ['pendiente', 'cuarentena'],
    ['favorable', 'aprobado'],
    ['desfavorable', 'rechazado'],
  ])('excursión a 10 °C con concepto %s → %s', (concepto, dictamenEsperado) => {
    const resultado = evaluar(
      itemInsulina({
        temperaturaLlegada: 10,
        soporteTemperatura: 'Planilla del transportador No. 88',
        conceptoTitular: concepto,
      })
    )
    expect(resultado.dictamen).toBe(dictamenEsperado)
  })
})

describe('registro sanitario', () => {
  it('vencido → RECHAZADO', () => {
    expect(evaluar(itemConforme({ estadoRegistro: 'vencido' })).dictamen).toBe('rechazado')
  })

  it('sin verificar en INVIMA → CUARENTENA', () => {
    expect(evaluar(itemConforme({ estadoRegistro: 'noVerificado' })).dictamen).toBe('cuarentena')
  })

  it('producto que no coincide con el registro → RECHAZADO', () => {
    expect(evaluar(itemConforme({ coincidenciaRegistro: 'no' })).dictamen).toBe('rechazado')
  })
})

describe('conciliación de cantidades', () => {
  it('un excedente no facturado deja el ítem en CUARENTENA', () => {
    expect(evaluar(itemConforme({ cantidadRecibida: 12 })).dictamen).toBe('cuarentena')
  })

  it('un faltante solo genera advertencia (lo recibido se aprueba)', () => {
    const resultado = evaluar(itemConforme({ cantidadRecibida: 8 }))
    expect(resultado.dictamen).toBe('aprobado')
    expect(resultado.causales[0].texto).toMatch(/Faltante de 2 cajas/)
  })
})

describe('inspección física', () => {
  it.each([
    ['empaquePrimario', 'rechazado'],
    ['empaqueSecundario', 'cuarentena'],
    ['empaqueTerciario', 'aprobado'],
  ])('%s no conforme → %s', (aspecto, dictamenEsperado) => {
    const item = itemConforme()
    item.inspeccion = { ...item.inspeccion, [aspecto]: 'noConforme' }
    expect(evaluar(item).dictamen).toBe(dictamenEsperado)
  })

  it('el rechazo prevalece sobre la cuarentena', () => {
    const item = itemConforme({ estadoRegistro: 'noVerificado' })
    item.inspeccion = { ...item.inspeccion, sellos: 'noConforme' }
    expect(evaluar(item).dictamen).toBe('rechazado')
  })
})

describe('casos especiales', () => {
  it('la sospecha de falsificación rechaza y exige reporte sanitario', () => {
    const resultado = evaluar(itemConforme({ sospechaFalsificacion: true }))
    expect(resultado.dictamen).toBe('rechazado')
    expect(resultado.reporteSanitario).toBe(true)
  })

  it('un dispositivo médico sin vencimiento no calcula vida útil', () => {
    const resultado = evaluar(
      itemConforme({ tipoProducto: 'dispositivoMedico', sinVencimiento: true, vencimiento: '' })
    )
    expect(resultado.vidaUtilMeses).toBeNull()
    expect(resultado.dictamen).toBe('aprobado')
  })
})
