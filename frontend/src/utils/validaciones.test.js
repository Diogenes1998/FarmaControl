import { describe, it, expect } from 'vitest'

import { validarMedicamento } from './validaciones.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

// Datos de formulario válidos (todo en texto, como llegan de los inputs)
const DATOS_VALIDOS = {
  nombre: 'Naproxeno 250 mg',
  categoria: 'Antiinflamatorio',
  cajas: '12',
  unidadesPorCaja: '10',
  precioCaja: '7500',
}

describe('validarMedicamento', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validarMedicamento(DATOS_VALIDOS, medicamentosIniciales)).toEqual({})
  })

  it('marca los 5 campos cuando el formulario está vacío', () => {
    const errores = validarMedicamento(
      { nombre: '', categoria: '', cajas: '', unidadesPorCaja: '', precioCaja: '' },
      []
    )
    expect(Object.keys(errores)).toHaveLength(5)
  })

  it('detecta nombres duplicados sin importar mayúsculas', () => {
    const errores = validarMedicamento(
      { ...DATOS_VALIDOS, nombre: 'AMOXICILINA 500 MG' },
      medicamentosIniciales
    )
    expect(errores.nombre).toMatch(/ya existe/i)
  })

  it('al editar, el nombre propio no cuenta como duplicado', () => {
    const errores = validarMedicamento(
      { ...DATOS_VALIDOS, nombre: 'Amoxicilina 500 mg' },
      medicamentosIniciales,
      'MED-002'
    )
    expect(errores).toEqual({})
  })

  it('rechaza cajas con decimales', () => {
    const errores = validarMedicamento({ ...DATOS_VALIDOS, cajas: '2.5' }, [])
    expect(errores.cajas).toMatch(/entero/)
  })

  it('rechaza 0 unidades por caja', () => {
    const errores = validarMedicamento({ ...DATOS_VALIDOS, unidadesPorCaja: '0' }, [])
    expect(errores.unidadesPorCaja).toMatch(/mayor a 0/)
  })

  it('rechaza categorías que no existen', () => {
    const errores = validarMedicamento({ ...DATOS_VALIDOS, categoria: 'Cosmético' }, [])
    expect(errores.categoria).toMatch(/no es válida/)
  })
})
