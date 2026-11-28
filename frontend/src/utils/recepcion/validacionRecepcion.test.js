import { describe, it, expect } from 'vitest'

import { validarEncabezadoActa, validarItemRecepcion } from './validacionRecepcion.js'
import { crearValoresItemVacios, valoresDesdeItem } from './items.js'
import { MEDICAMENTO_NUEVO } from '../../data/recepcion.js'
import { medicamentosIniciales } from '../../data/medicamentosIniciales.js'
import { FECHA_RECEPCION, encabezadoValido, itemConforme } from './datosPrueba.js'

function validar(valores) {
  return validarItemRecepcion(valores, {
    medicamentos: medicamentosIniciales,
    hoy: FECHA_RECEPCION,
  })
}

describe('validarItemRecepcion', () => {
  it('un formulario vacío marca los campos obligatorios y las 6 inspecciones', () => {
    const errores = validar(crearValoresItemVacios(FECHA_RECEPCION))

    expect(errores.medicamentoId).toBeTruthy()
    expect(errores.cantidadRecibida).toBeTruthy()
    expect(errores.registroSanitario).toBeTruthy()
    expect(errores.lote).toBeTruthy()
    expect(errores.vencimiento).toBeTruthy()
    expect(Object.keys(errores).filter((clave) => clave.startsWith('inspeccion_'))).toHaveLength(6)
  })

  it('un ítem completo no tiene errores', () => {
    expect(validar(valoresDesdeItem(itemConforme()))).toEqual({})
  })

  it('exige el vencimiento en formato MM/AAAA', () => {
    const errores = validar({ ...valoresDesdeItem(itemConforme()), vencimiento: '2027-06' })
    expect(errores.vencimiento).toMatch(/MM\/AAAA/)
  })

  it('solo los dispositivos médicos pueden ir sin vencimiento', () => {
    const base = { ...valoresDesdeItem(itemConforme()), sinVencimiento: true, vencimiento: '' }

    expect(validar(base).vencimiento).toBeTruthy()
    expect(validar({ ...base, tipoProducto: 'dispositivoMedico' })).toEqual({})
  })

  it('un producto "nuevo" que ya existe en el inventario pide seleccionarlo', () => {
    const errores = validar({
      ...valoresDesdeItem(itemConforme()),
      medicamentoId: MEDICAMENTO_NUEVO,
      nuevoNombre: 'ibuprofeno 400 mg',
      nuevaCategoria: 'Antiinflamatorio',
      nuevasUnidadesPorCaja: '20',
      nuevoPrecioCaja: '9800',
    })
    expect(errores.nuevoNombre).toMatch(/Ya existe en el inventario/)
  })
})

describe('validarEncabezadoActa', () => {
  it('acepta un NIT con puntos y dígito de verificación', () => {
    expect(validarEncabezadoActa(encabezadoValido(), FECHA_RECEPCION)).toEqual({})
  })

  it('rechaza un NIT inválido y una fecha futura', () => {
    const errores = validarEncabezadoActa(
      encabezadoValido({ nit: 'ABC', fechaRecepcion: '2027-01-01T08:00' }),
      FECHA_RECEPCION
    )
    expect(errores.nit).toBeTruthy()
    expect(errores.fechaRecepcion).toBeTruthy()
  })
})
