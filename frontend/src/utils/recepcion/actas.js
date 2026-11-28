import { PREFIJO_ACTA, PREFIJO_LOTE } from '../../data/recepcion.js'
import { generarCodigo } from '../generarCodigo.js'
import { normalizarTexto } from '../texto.js'
import { evaluarItem, resumirDictamenes } from './evaluacion.js'
import { fechaHoraLocalISO } from './fechas.js'
import { obtenerNombreProducto } from './items.js'
import { validarEncabezadoActa } from './validacionRecepcion.js'

// Siguiente consecutivo libre: ACT-0001, ACT-0002... (busca el mayor, como generarCodigo)
export function generarConsecutivo(lista, prefijo, digitos = 4) {
  const numeros = lista
    .map((elemento) => Number(String(elemento.id).replace(prefijo, '')))
    .filter((numero) => Number.isFinite(numero))

  const siguiente = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1
  return `${prefijo}${String(siguiente).padStart(digitos, '0')}`
}

// Crea un acta nueva en estado borrador
export function crearActa(actas, ahora = new Date()) {
  return {
    id: generarConsecutivo(actas, PREFIJO_ACTA),
    fechaRecepcion: fechaHoraLocalISO(ahora),
    proveedor: '',
    nit: '',
    ordenCompra: '',
    factura: '',
    remision: '',
    transportador: '',
    responsableRecepcion: '',
    directorTecnico: '',
    estado: 'borrador',
    items: [],
    fechaCierre: null,
    resumen: null,
  }
}

// Agrega un ítem (sin id) o reemplaza uno existente (con id). Devuelve un acta NUEVA.
export function guardarItemEnActa(acta, item) {
  if (item.id) {
    return {
      ...acta,
      items: acta.items.map((actual) => (actual.id === item.id ? item : actual)),
    }
  }

  const numeros = acta.items.map((actual) => Number(String(actual.id).split('-').pop()))
  const siguiente = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1

  return {
    ...acta,
    items: [...acta.items, { ...item, id: `${acta.id}-${siguiente}` }],
  }
}

export function quitarItemDeActa(acta, itemId) {
  return { ...acta, items: acta.items.filter((item) => item.id !== itemId) }
}

// Fecha de referencia para evaluar la vida útil: la fecha de recepción del acta
export function obtenerFechaReferencia(acta) {
  const fecha = new Date(acta.fechaRecepcion)
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha
}

/**
 * Revisa si el acta se puede cerrar. Devuelve una lista de problemas (vacía = se puede).
 */
export function validarCierreActa(acta, medicamentos, ahora = new Date()) {
  const problemas = []
  const erroresEncabezado = validarEncabezadoActa(acta, ahora)

  if (Object.keys(erroresEncabezado).length > 0) {
    problemas.push('Completa los datos generales del acta (campos marcados en rojo).')
  }

  if (acta.items.length === 0) {
    problemas.push('Registra al menos un producto recibido.')
  }

  acta.items.forEach((item) => {
    const existe = medicamentos.some((medicamento) => medicamento.id === item.medicamentoId)

    if (!existe && !item.nuevoMedicamento) {
      problemas.push(
        `El ítem del lote ${item.lote} apunta a un medicamento que ya no existe: edítalo.`
      )
    }
  })

  return problemas
}

/**
 * Suma cajas al inventario. Si el producto es nuevo, lo crea; si ya existe
 * un medicamento con el mismo nombre (sin tildes ni mayúsculas), lo reutiliza.
 * @returns {{ medicamentos: Array, medicamentoId: string|null }}
 */
export function incorporarAlInventario(medicamentos, { medicamentoId, nuevoMedicamento, cajas }) {
  const sumarCajas = (id) =>
    medicamentos.map((medicamento) =>
      medicamento.id === id ? { ...medicamento, cajas: medicamento.cajas + cajas } : medicamento
    )

  if (medicamentoId && medicamentos.some((medicamento) => medicamento.id === medicamentoId)) {
    return { medicamentos: sumarCajas(medicamentoId), medicamentoId }
  }

  if (!nuevoMedicamento) {
    return { medicamentos, medicamentoId: null }
  }

  const existente = medicamentos.find(
    (medicamento) =>
      normalizarTexto(medicamento.nombre) === normalizarTexto(nuevoMedicamento.nombre)
  )

  if (existente) {
    return { medicamentos: sumarCajas(existente.id), medicamentoId: existente.id }
  }

  const creado = {
    id: generarCodigo(medicamentos),
    nombre: nuevoMedicamento.nombre,
    categoria: nuevoMedicamento.categoria,
    cajas,
    unidadesPorCaja: nuevoMedicamento.unidadesPorCaja,
    precioCaja: nuevoMedicamento.precioCaja,
  }

  return { medicamentos: [...medicamentos, creado], medicamentoId: creado.id }
}

const ESTADO_LOTE_POR_DICTAMEN = {
  aprobado: 'disponible',
  cuarentena: 'cuarentena',
  rechazado: 'rechazado',
}

/**
 * Cierra un acta: evalúa cada ítem, crea un lote por ítem y suma al inventario
 * SOLO lo aprobado. Lo que queda en cuarentena o rechazado queda bloqueado
 * (no suma stock) hasta que se libere o se disponga de él.
 * Función pura: no modifica nada, devuelve los datos nuevos.
 */
export function cerrarActa({ acta, medicamentos, lotes, ahora = new Date() }) {
  const fechaReferencia = obtenerFechaReferencia(acta)
  let inventario = medicamentos
  const lotesNuevos = []

  const itemsEvaluados = acta.items.map((item) => {
    const evaluacion = evaluarItem(item, { fechaReferencia })
    const estado = ESTADO_LOTE_POR_DICTAMEN[evaluacion.dictamen]
    const nombreProducto = obtenerNombreProducto(item, medicamentos)
    let medicamentoId = item.medicamentoId

    if (estado === 'disponible') {
      const resultado = incorporarAlInventario(inventario, {
        medicamentoId: item.medicamentoId,
        nuevoMedicamento: item.nuevoMedicamento,
        cajas: item.cantidadRecibida,
      })
      inventario = resultado.medicamentos
      medicamentoId = resultado.medicamentoId
    }

    lotesNuevos.push({
      id: generarConsecutivo([...lotes, ...lotesNuevos], PREFIJO_LOTE),
      actaId: acta.id,
      itemId: item.id,
      medicamentoId,
      nuevoMedicamento: item.nuevoMedicamento,
      nombreProducto,
      presentacion: item.presentacion,
      tipoProducto: item.tipoProducto,
      requiereCadenaFrio: item.requiereCadenaFrio,
      registroSanitario: item.registroSanitario,
      lote: item.lote,
      vencimiento: item.vencimiento,
      sinVencimiento: item.sinVencimiento,
      cajas: item.cantidadRecibida,
      estado,
      dictamenInicial: evaluacion.dictamen,
      causales: evaluacion.causales,
      reporteSanitario: evaluacion.reporteSanitario,
      fechaIngreso: ahora.toISOString(),
      historial: [
        {
          fecha: ahora.toISOString(),
          accion: `Ingreso por el acta ${acta.id}`,
          detalle:
            estado === 'disponible'
              ? 'Aprobado en recepción técnica: sumado al inventario.'
              : `Dictamen: ${evaluacion.dictamen}. Bloqueado: no suma al inventario.`,
          responsable: acta.directorTecnico,
        },
      ],
      disposicion: null,
    })

    return { ...item, nombreProducto, evaluacion }
  })

  const actaCerrada = {
    ...acta,
    estado: 'cerrada',
    fechaCierre: ahora.toISOString(),
    items: itemsEvaluados,
    resumen: resumirDictamenes(itemsEvaluados.map((item) => item.evaluacion)),
  }

  return { actaCerrada, lotesNuevos, medicamentos: inventario }
}
