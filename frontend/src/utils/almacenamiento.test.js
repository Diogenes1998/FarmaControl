import { describe, it, expect } from 'vitest'

import { interpretarInventario } from './almacenamiento.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'

describe('interpretarInventario', () => {
  it('devuelve null si el texto no es JSON', () => {
    expect(interpretarInventario('hola')).toBeNull()
  })

  it('lee el formato con versión { version, medicamentos }', () => {
    const texto = JSON.stringify({ version: 1, medicamentos: medicamentosIniciales })
    const resultado = interpretarInventario(texto)

    expect(resultado.medicamentos).toHaveLength(8)
    expect(resultado.descartados).toBe(0)
  })

  it('acepta un arreglo directo de medicamentos', () => {
    const texto = JSON.stringify(medicamentosIniciales.slice(0, 2))
    expect(interpretarInventario(texto).medicamentos).toHaveLength(2)
  })

  it('descarta registros inválidos y códigos repetidos', () => {
    const [primero, segundo] = medicamentosIniciales
    const texto = JSON.stringify([
      primero,
      { ...primero }, // código repetido
      { ...segundo, cajas: 'muchas' }, // dato inválido
    ])

    const resultado = interpretarInventario(texto)

    expect(resultado.medicamentos).toHaveLength(1)
    expect(resultado.descartados).toBe(2)
  })

  it('devuelve null si el JSON no tiene la estructura esperada', () => {
    expect(interpretarInventario('{"otra":"cosa"}')).toBeNull()
  })
})
