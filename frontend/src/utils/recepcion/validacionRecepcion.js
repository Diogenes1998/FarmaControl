import {
  ASPECTOS_INSPECCION,
  ESTADOS_REGISTRO,
  MEDICAMENTO_NUEVO,
  OPCIONES_COINCIDENCIA,
  OPCIONES_CONCEPTO_TITULAR,
  OPCIONES_INDICADOR_CONGELACION,
  RESULTADOS_INSPECCION,
  TIPOS_PRODUCTO,
} from '../../data/recepcion.js'
import { validarMedicamento } from '../validaciones.js'
import { fechaLocalISO, parsearVencimiento } from './fechas.js'

function texto(valor) {
  return String(valor ?? '').trim()
}

function estaEnOpciones(valor, opciones) {
  return opciones.some((opcion) => opcion.valor === valor)
}

// Valida un entero obligatorio con un mínimo. Devuelve un mensaje o ''.
function validarEntero(valor, minimo, nombreCampo) {
  if (texto(valor) === '') return `Indica la ${nombreCampo}.`

  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero < minimo) {
    return `Debe ser un número entero igual o mayor a ${minimo}.`
  }

  if (numero > 100000) return 'La cantidad parece demasiado alta. Verifícala.'

  return ''
}

/**
 * Valida que el formulario de un ítem de recepción esté COMPLETO y bien escrito.
 * No decide el dictamen (eso lo hace evaluarItem): solo verifica los datos.
 * @returns {object} errores por campo. Vacío = datos completos.
 */
export function validarItemRecepcion(valores, { medicamentos, hoy = new Date() }) {
  const errores = {}

  // ----- Producto -----
  if (valores.medicamentoId === '') {
    errores.medicamentoId = 'Selecciona el medicamento o la opción "Producto nuevo".'
  } else if (valores.medicamentoId === MEDICAMENTO_NUEVO) {
    // Reutilizamos la validación del formulario de inventario (Etapa 4)
    const erroresNuevo = validarMedicamento(
      {
        nombre: valores.nuevoNombre,
        categoria: valores.nuevaCategoria,
        cajas: '0',
        unidadesPorCaja: valores.nuevasUnidadesPorCaja,
        precioCaja: valores.nuevoPrecioCaja,
      },
      medicamentos
    )

    if (erroresNuevo.nombre) {
      errores.nuevoNombre = erroresNuevo.nombre.startsWith('Ya existe')
        ? 'Ya existe en el inventario: selecciónalo en la lista.'
        : erroresNuevo.nombre
    }
    if (erroresNuevo.categoria) errores.nuevaCategoria = erroresNuevo.categoria
    if (erroresNuevo.unidadesPorCaja) errores.nuevasUnidadesPorCaja = erroresNuevo.unidadesPorCaja
    if (erroresNuevo.precioCaja) errores.nuevoPrecioCaja = erroresNuevo.precioCaja
  } else if (!medicamentos.some((medicamento) => medicamento.id === valores.medicamentoId)) {
    errores.medicamentoId = 'El medicamento seleccionado ya no existe en el inventario.'
  }

  if (!estaEnOpciones(valores.tipoProducto, TIPOS_PRODUCTO)) {
    errores.tipoProducto = 'Selecciona el tipo de producto.'
  }

  if (texto(valores.presentacion).length < 3) {
    errores.presentacion = 'Indica la presentación comercial. Ej: Caja x 100 tabletas.'
  }

  // ----- Cantidades (en cajas) -----
  const errorOC = validarEntero(valores.cantidadOrdenCompra, 0, 'cantidad de la orden de compra')
  const errorFactura = validarEntero(valores.cantidadFacturada, 0, 'cantidad facturada')
  const errorRecibida = validarEntero(valores.cantidadRecibida, 1, 'cantidad recibida')

  if (errorOC) errores.cantidadOrdenCompra = errorOC
  if (errorFactura) errores.cantidadFacturada = errorFactura
  if (errorRecibida) errores.cantidadRecibida = errorRecibida

  // ----- Registro sanitario -----
  if (texto(valores.registroSanitario).length < 6) {
    errores.registroSanitario = 'Escribe el número completo. Ej: INVIMA 2023M-0001234.'
  }
  if (texto(valores.titular).length < 3) {
    errores.titular = 'Indica el titular del registro sanitario.'
  }
  if (texto(valores.fabricante).length < 3) {
    errores.fabricante = 'Indica el fabricante.'
  }
  if (!estaEnOpciones(valores.estadoRegistro, ESTADOS_REGISTRO)) {
    errores.estadoRegistro = 'Indica el estado consultado en el INVIMA.'
  }
  if (!estaEnOpciones(valores.coincidenciaRegistro, OPCIONES_COINCIDENCIA)) {
    errores.coincidenciaRegistro = 'Indica si el producto coincide con el registro.'
  }
  if (texto(valores.fechaConsultaRegistro) === '') {
    errores.fechaConsultaRegistro = 'Indica la fecha de la consulta.'
  } else if (valores.fechaConsultaRegistro > fechaLocalISO(hoy)) {
    errores.fechaConsultaRegistro = 'La fecha de consulta no puede ser futura.'
  }

  // ----- Lote y vencimiento -----
  if (texto(valores.lote) === '') {
    errores.lote = 'El número de lote es obligatorio.'
  } else if (texto(valores.lote).length > 40) {
    errores.lote = 'El lote no puede superar los 40 caracteres.'
  }

  if (valores.sinVencimiento) {
    if (valores.tipoProducto !== 'dispositivoMedico') {
      errores.vencimiento = 'Solo un dispositivo médico puede registrarse sin fecha de vencimiento.'
    }
  } else if (texto(valores.vencimiento) === '') {
    errores.vencimiento = 'La fecha de vencimiento es obligatoria.'
  } else if (!parsearVencimiento(valores.vencimiento)) {
    errores.vencimiento = 'Usa el formato MM/AAAA. Ej: 06/2027.'
  }

  // ----- Cadena de frío -----
  if (valores.requiereCadenaFrio) {
    const temperatura = texto(valores.temperaturaLlegada)

    if (temperatura !== '') {
      const numero = Number(temperatura)
      if (!Number.isFinite(numero) || numero < -30 || numero > 50) {
        errores.temperaturaLlegada = 'Escribe la temperatura en °C (entre -30 y 50).'
      }
    }

    if (!estaEnOpciones(valores.indicadorCongelacion, OPCIONES_INDICADOR_CONGELACION)) {
      errores.indicadorCongelacion = 'Indica el estado del indicador de congelación.'
    }

    if (!estaEnOpciones(valores.conceptoTitular, OPCIONES_CONCEPTO_TITULAR)) {
      errores.conceptoTitular = 'Selecciona una opción.'
    }
  }

  // ----- Inspección física -----
  ASPECTOS_INSPECCION.forEach((aspecto) => {
    if (!estaEnOpciones(valores.inspeccion?.[aspecto.clave], RESULTADOS_INSPECCION)) {
      errores[`inspeccion_${aspecto.clave}`] = 'Selecciona el resultado.'
    }
  })

  // ----- Excepciones y novedades -----
  if (valores.excepcionVidaUtil && texto(valores.justificacionExcepcion).length < 20) {
    errores.justificacionExcepcion =
      'Justifica la excepción con el consumo proyectado (mínimo 20 caracteres).'
  }

  if (valores.sospechaFalsificacion && texto(valores.observaciones).length < 15) {
    errores.observaciones = 'Describe los indicios de falsificación (mínimo 15 caracteres).'
  }

  return errores
}

// Valida los datos generales del acta. Devuelve errores por campo.
export function validarEncabezadoActa(acta, ahora = new Date()) {
  const errores = {}

  if (texto(acta.fechaRecepcion) === '') {
    errores.fechaRecepcion = 'Indica la fecha y hora de recepción.'
  } else {
    const fecha = new Date(acta.fechaRecepcion)
    if (Number.isNaN(fecha.getTime())) {
      errores.fechaRecepcion = 'La fecha no es válida.'
    } else if (fecha.getTime() > ahora.getTime() + 60 * 60 * 1000) {
      errores.fechaRecepcion = 'La fecha de recepción no puede ser futura.'
    }
  }

  if (texto(acta.proveedor).length < 3) {
    errores.proveedor = 'Indica la razón social del proveedor.'
  }

  const nit = texto(acta.nit).replace(/[.\s]/g, '')
  if (nit === '') {
    errores.nit = 'El NIT es obligatorio.'
  } else if (!/^\d{5,12}(-\d)?$/.test(nit)) {
    errores.nit = 'Formato no válido. Ej: 900123456-7.'
  }

  if (texto(acta.ordenCompra) === '') errores.ordenCompra = 'Indica el número de la orden de compra.'
  if (texto(acta.factura) === '') errores.factura = 'Indica el número de la factura.'

  if (texto(acta.responsableRecepcion).length < 3) {
    errores.responsableRecepcion = 'Indica quién recibe físicamente.'
  }
  if (texto(acta.directorTecnico).length < 3) {
    errores.directorTecnico = 'Indica el químico farmacéutico o regente que dictamina.'
  }

  return errores
}
