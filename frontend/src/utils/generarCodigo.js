import { PREFIJO_CODIGO } from '../data/constantes.js'

// Genera el siguiente código disponible: si existe MED-008, devuelve MED-009
export function generarCodigo(medicamentos) {
  const numeros = medicamentos
    .map((medicamento) => Number(String(medicamento.id).replace(PREFIJO_CODIGO, '')))
    .filter((numero) => Number.isFinite(numero))

  const mayor = numeros.length > 0 ? Math.max(...numeros) : 0
  const siguiente = mayor + 1

  return `${PREFIJO_CODIGO}${String(siguiente).padStart(3, '0')}`
}
