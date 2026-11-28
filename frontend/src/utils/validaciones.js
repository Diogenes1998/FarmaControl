import { CATEGORIAS } from '../data/constantes.js'

// Devuelve true si el valor está vacío o solo tiene espacios
function estaVacio(valor) {
  return String(valor ?? '').trim() === ''
}

/**
 * Valida los datos del formulario de medicamentos.
 * @param {object} valores - Valores del formulario (todos como texto).
 * @param {Array} medicamentos - Inventario actual (para detectar duplicados).
 * @param {string|null} idActual - Id del medicamento en edición (null si es nuevo).
 * @returns {object} Objeto de errores. Si está vacío, los datos son válidos.
 */
export function validarMedicamento(valores, medicamentos, idActual = null) {
  const errores = {}

  // ----- Nombre -----
  const nombre = String(valores.nombre ?? '').trim()

  if (nombre === '') {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (nombre.length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
  } else if (nombre.length > 80) {
    errores.nombre = 'El nombre no puede superar los 80 caracteres.'
  } else {
    const existeDuplicado = medicamentos.some(
      (medicamento) =>
        medicamento.id !== idActual &&
        medicamento.nombre.trim().toLowerCase() === nombre.toLowerCase()
    )

    if (existeDuplicado) {
      errores.nombre = 'Ya existe un medicamento registrado con ese nombre.'
    }
  }

  // ----- Categoría -----
  if (estaVacio(valores.categoria)) {
    errores.categoria = 'Selecciona una categoría.'
  } else if (!CATEGORIAS.includes(valores.categoria)) {
    errores.categoria = 'La categoría seleccionada no es válida.'
  }

  // ----- Cajas en stock -----
  const cajas = Number(valores.cajas)

  if (estaVacio(valores.cajas)) {
    errores.cajas = 'Indica cuántas cajas hay en stock.'
  } else if (!Number.isInteger(cajas) || cajas < 0) {
    errores.cajas = 'Debe ser un número entero igual o mayor a 0.'
  } else if (cajas > 100000) {
    errores.cajas = 'La cantidad parece demasiado alta. Verifícala.'
  }

  // ----- Unidades por caja -----
  const unidades = Number(valores.unidadesPorCaja)

  if (estaVacio(valores.unidadesPorCaja)) {
    errores.unidadesPorCaja = 'Indica cuántas unidades trae cada caja.'
  } else if (!Number.isInteger(unidades) || unidades < 1) {
    errores.unidadesPorCaja = 'Debe ser un número entero mayor a 0.'
  }

  // ----- Precio por caja -----
  const precio = Number(valores.precioCaja)

  if (estaVacio(valores.precioCaja)) {
    errores.precioCaja = 'Indica el precio de la caja.'
  } else if (!Number.isFinite(precio) || precio <= 0) {
    errores.precioCaja = 'El precio debe ser un número mayor a 0.'
  }

  return errores
}
