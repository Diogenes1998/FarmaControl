// Quita tildes, pasa a minúsculas y elimina espacios en los extremos.
// "  Acetaminofén " → "acetaminofen"
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// Devuelve "1 categoría" o "3 categorías" según la cantidad
export function pluralizar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}
