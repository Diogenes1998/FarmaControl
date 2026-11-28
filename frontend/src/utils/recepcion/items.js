import { ASPECTOS_INSPECCION, MEDICAMENTO_NUEVO } from '../../data/recepcion.js'
import { fechaLocalISO } from './fechas.js'

// Inspección sin diligenciar: { empaqueTerciario: '', empaqueSecundario: '', ... }
function crearInspeccionVacia() {
  return Object.fromEntries(ASPECTOS_INSPECCION.map((aspecto) => [aspecto.clave, '']))
}

// Valores de un formulario de ítem en blanco (todo como texto o booleano)
export function crearValoresItemVacios(hoy = new Date()) {
  return {
    medicamentoId: '',
    nuevoNombre: '',
    nuevaCategoria: '',
    nuevasUnidadesPorCaja: '',
    nuevoPrecioCaja: '',
    tipoProducto: 'general',
    requiereCadenaFrio: false,
    presentacion: '',
    cantidadOrdenCompra: '',
    cantidadFacturada: '',
    cantidadRecibida: '',
    registroSanitario: '',
    titular: '',
    fabricante: '',
    estadoRegistro: '',
    coincidenciaRegistro: '',
    fechaConsultaRegistro: fechaLocalISO(hoy),
    lote: '',
    vencimiento: '',
    sinVencimiento: false,
    temperaturaLlegada: '',
    soporteTemperatura: '',
    indicadorCongelacion: '',
    conceptoTitular: 'pendiente',
    inspeccion: crearInspeccionVacia(),
    excepcionVidaUtil: false,
    justificacionExcepcion: '',
    compromisoCanje: false,
    sospechaFalsificacion: false,
    observaciones: '',
  }
}

// Convierte un número opcional en texto para un input ("" si no hay valor)
function aTexto(valor) {
  return valor === null || valor === undefined ? '' : String(valor)
}

// Ítem guardado → valores del formulario (para editarlo)
export function valoresDesdeItem(item) {
  const vacios = crearValoresItemVacios()

  return {
    ...vacios,
    ...item,
    medicamentoId: item.medicamentoId ?? (item.nuevoMedicamento ? MEDICAMENTO_NUEVO : ''),
    nuevoNombre: item.nuevoMedicamento?.nombre ?? '',
    nuevaCategoria: item.nuevoMedicamento?.categoria ?? '',
    nuevasUnidadesPorCaja: aTexto(item.nuevoMedicamento?.unidadesPorCaja),
    nuevoPrecioCaja: aTexto(item.nuevoMedicamento?.precioCaja),
    cantidadOrdenCompra: aTexto(item.cantidadOrdenCompra),
    cantidadFacturada: aTexto(item.cantidadFacturada),
    cantidadRecibida: aTexto(item.cantidadRecibida),
    temperaturaLlegada: aTexto(item.temperaturaLlegada),
    inspeccion: { ...vacios.inspeccion, ...item.inspeccion },
  }
}

// Valores del formulario → ítem limpio para guardar (números de verdad, textos sin espacios)
export function normalizarItem(valores, id = null) {
  const esNuevo = valores.medicamentoId === MEDICAMENTO_NUEVO
  const temperatura = String(valores.temperaturaLlegada).trim()

  return {
    id,
    medicamentoId: esNuevo || valores.medicamentoId === '' ? null : valores.medicamentoId,
    nuevoMedicamento: esNuevo
      ? {
          nombre: valores.nuevoNombre.trim(),
          categoria: valores.nuevaCategoria,
          unidadesPorCaja: Number(valores.nuevasUnidadesPorCaja),
          precioCaja: Number(valores.nuevoPrecioCaja),
        }
      : null,
    tipoProducto: valores.tipoProducto,
    requiereCadenaFrio: Boolean(valores.requiereCadenaFrio),
    presentacion: valores.presentacion.trim(),
    cantidadOrdenCompra: Number(valores.cantidadOrdenCompra),
    cantidadFacturada: Number(valores.cantidadFacturada),
    cantidadRecibida: Number(valores.cantidadRecibida),
    registroSanitario: valores.registroSanitario.trim().toUpperCase(),
    titular: valores.titular.trim(),
    fabricante: valores.fabricante.trim(),
    estadoRegistro: valores.estadoRegistro,
    coincidenciaRegistro: valores.coincidenciaRegistro,
    fechaConsultaRegistro: valores.fechaConsultaRegistro,
    lote: valores.lote.trim().toUpperCase(),
    vencimiento: valores.sinVencimiento ? '' : valores.vencimiento.trim(),
    sinVencimiento: Boolean(valores.sinVencimiento),
    // Los datos de cadena de frío solo se guardan si el producto la requiere
    temperaturaLlegada:
      valores.requiereCadenaFrio && temperatura !== '' ? Number(temperatura) : null,
    soporteTemperatura: valores.requiereCadenaFrio ? valores.soporteTemperatura.trim() : '',
    indicadorCongelacion: valores.requiereCadenaFrio ? valores.indicadorCongelacion : '',
    conceptoTitular: valores.requiereCadenaFrio ? valores.conceptoTitular : 'pendiente',
    inspeccion: { ...valores.inspeccion },
    excepcionVidaUtil: Boolean(valores.excepcionVidaUtil),
    justificacionExcepcion: valores.excepcionVidaUtil
      ? valores.justificacionExcepcion.trim()
      : '',
    compromisoCanje: Boolean(valores.excepcionVidaUtil && valores.compromisoCanje),
    sospechaFalsificacion: Boolean(valores.sospechaFalsificacion),
    observaciones: valores.observaciones.trim(),
  }
}

// Nombre legible del producto de un ítem o de un lote
export function obtenerNombreProducto(item, medicamentos) {
  const medicamento = medicamentos.find((med) => med.id === item.medicamentoId)

  return (
    medicamento?.nombre ??
    item.nuevoMedicamento?.nombre ??
    item.nombreProducto ??
    'Producto sin identificar'
  )
}
