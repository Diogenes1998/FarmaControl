// Convierte un número en pesos colombianos: 8000 → "$ 8.000"
export function formatearPesos(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '$ 0'
  }

  return numero.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

// Convierte un número en formato con separador de miles: 1238 → "1.238"
export function formatearNumero(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    return '0'
  }

  return numero.toLocaleString('es-CO')
}
