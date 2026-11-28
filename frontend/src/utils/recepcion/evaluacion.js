import { POLITICA_RECEPCION } from '../../data/recepcion.js'
import { calcularVidaUtilMeses, formatearVidaUtil } from './fechas.js'
import { pluralizar } from '../texto.js'

/**
 * MOTOR DE DICTAMEN DE LA RECEPCIÓN TÉCNICA
 *
 * Recibe un ítem ya completo (normalizado) y devuelve:
 * {
 *   dictamen: 'aprobado' | 'cuarentena' | 'rechazado',
 *   causales: [{ nivel: 'rechazo' | 'cuarentena' | 'advertencia', texto }],
 *   vidaUtilMeses: number | null,
 *   reporteSanitario: boolean   // true = no devolver; retener y reportar
 * }
 *
 * Regla de prioridad: un solo motivo de rechazo basta para rechazar;
 * si no hay rechazos, un solo motivo de cuarentena basta para bloquear el lote.
 */
export function evaluarItem(
  item,
  { fechaReferencia = new Date(), politica = POLITICA_RECEPCION } = {}
) {
  const causales = []
  const agregar = (nivel, texto) => causales.push({ nivel, texto })
  const inspeccion = item.inspeccion ?? {}

  // ============ 1. INDICIOS DE FALSIFICACIÓN ============
  const reporteSanitario = Boolean(item.sospechaFalsificacion)

  if (reporteSanitario) {
    agregar(
      'rechazo',
      'Sospecha de falsificación o adulteración: retener bajo custodia y reportar al INVIMA y a la Secretaría de Salud. No devolver al proveedor.'
    )
  }

  // ============ 2. REGISTRO SANITARIO ============
  switch (item.estadoRegistro) {
    case 'vencido':
      agregar('rechazo', 'Registro sanitario vencido.')
      break
    case 'cancelado':
      agregar('rechazo', 'Registro sanitario cancelado o suspendido.')
      break
    case 'noVerificado':
      agregar('cuarentena', 'Registro sanitario sin verificar en la base de datos del INVIMA.')
      break
    case 'tramiteRenovacion':
      agregar(
        'cuarentena',
        'Registro sanitario en trámite de renovación: anexar la constancia de radicación oportuna.'
      )
      break
    default:
      break
  }

  if (item.coincidenciaRegistro === 'no') {
    agregar(
      'rechazo',
      'El producto no coincide con el registro sanitario (titular, principio activo, concentración, forma farmacéutica o fabricante).'
    )
  } else if (item.coincidenciaRegistro === 'pendiente') {
    agregar('cuarentena', 'Coincidencia con el registro sanitario pendiente de verificar.')
  }

  // ============ 3. VIDA ÚTIL ============
  const vidaUtilMeses = item.sinVencimiento
    ? null
    : calcularVidaUtilMeses(item.vencimiento, fechaReferencia)

  if (vidaUtilMeses !== null) {
    if (vidaUtilMeses <= 0) {
      agregar('rechazo', 'Producto vencido a la fecha de recepción.')
    } else if (vidaUtilMeses < politica.vidaUtilMinimaMeses) {
      const excepcionDocumentada =
        item.excepcionVidaUtil &&
        item.compromisoCanje &&
        String(item.justificacionExcepcion ?? '').trim().length >= 20

      const textoVidaUtil = `Vida útil remanente de ${formatearVidaUtil(
        vidaUtilMeses
      )}, inferior a la política institucional (${politica.vidaUtilMinimaMeses} meses)`

      if (excepcionDocumentada) {
        agregar(
          'advertencia',
          `${textoVidaUtil}. Aprobado por excepción documentada con compromiso de canje del proveedor.`
        )
      } else {
        agregar(
          'cuarentena',
          `${textoVidaUtil}. Requiere aprobación por excepción del director técnico y compromiso de canje del proveedor.`
        )
      }
    }
  }

  // ============ 4. CONCILIACIÓN DE CANTIDADES ============
  const diferenciaFactura = item.cantidadRecibida - item.cantidadFacturada

  if (diferenciaFactura > 0) {
    agregar(
      'cuarentena',
      `Excedente de ${pluralizar(diferenciaFactura, 'caja', 'cajas')} no facturado: aclarar con el proveedor.`
    )
  } else if (diferenciaFactura < 0) {
    agregar(
      'advertencia',
      `Faltante de ${pluralizar(-diferenciaFactura, 'caja', 'cajas')} frente a la factura: solicitar nota crédito o reposición.`
    )
  }

  if (item.cantidadFacturada !== item.cantidadOrdenCompra) {
    agregar(
      'advertencia',
      `La cantidad facturada (${item.cantidadFacturada}) difiere de la orden de compra (${item.cantidadOrdenCompra}).`
    )
  }

  // ============ 5. INSPECCIÓN FÍSICA ============
  const noConforme = (clave) => inspeccion[clave] === 'noConforme'

  if (noConforme('empaquePrimario')) {
    agregar('rechazo', 'Empaque primario no conforme (roto, perforado o con humedad).')
  }
  if (noConforme('sellos')) {
    agregar('rechazo', 'Sellos o precintos de seguridad violados o ausentes.')
  }
  if (noConforme('rotulado')) {
    agregar('rechazo', 'Rotulado no conforme: lote o vencimiento ilegible, enmendado o sobrepuesto.')
  }
  if (noConforme('caracteristicas')) {
    agregar(
      'rechazo',
      'Características físicas alteradas (color, turbidez, partículas, aglomerados o separación de fases).'
    )
  }
  if (noConforme('empaqueSecundario')) {
    agregar('cuarentena', 'Empaque secundario no conforme: evaluar con el proveedor.')
  }
  if (noConforme('empaqueTerciario')) {
    agregar('advertencia', 'Novedad en el embalaje de transporte: dejar constancia con el transportador.')
  }

  // ============ 6. CADENA DE FRÍO ============
  if (item.requiereCadenaFrio) {
    const { temperaturaMinima, temperaturaMaxima } = politica
    const temperatura = item.temperaturaLlegada
    const rango = `${temperaturaMinima} °C a ${temperaturaMaxima} °C`

    if (item.indicadorCongelacion === 'activado') {
      agregar('rechazo', 'Indicador de congelación activado: el producto no puede utilizarse.')
    } else if (item.indicadorCongelacion === 'sinIndicador') {
      agregar('advertencia', 'El embalaje no trae indicador de congelación.')
    }

    if (temperatura === null || temperatura === undefined) {
      agregar('cuarentena', 'Sin temperatura de llegada registrada: no hay evidencia objetiva de la cadena de frío.')
    } else if (temperatura < temperaturaMinima || temperatura > temperaturaMaxima) {
      const textoExcursion = `Temperatura de llegada de ${temperatura} °C, fuera del rango de ${rango}`

      if (item.conceptoTitular === 'desfavorable') {
        agregar('rechazo', `${textoExcursion}, con concepto de estabilidad desfavorable del titular.`)
      } else if (item.conceptoTitular === 'favorable') {
        agregar('advertencia', `${textoExcursion}. Liberado con concepto favorable del titular (anexar).`)
      } else {
        agregar('cuarentena', `${textoExcursion}: requiere concepto de estabilidad del titular del registro.`)
      }
    }

    if (String(item.soporteTemperatura ?? '').trim() === '') {
      agregar('cuarentena', 'Sin soporte del registro de temperatura durante el transporte.')
    }
  }

  // ============ 7. RECORDATORIOS POR TIPO DE PRODUCTO ============
  if (item.tipoProducto === 'controlEspecial') {
    agregar(
      'advertencia',
      'Medicamento de control especial: almacenar en el área de seguridad y registrar en el libro oficial (Resolución 1478 de 2006).'
    )
  }

  // ============ DICTAMEN FINAL ============
  let dictamen = 'aprobado'
  if (causales.some((causal) => causal.nivel === 'cuarentena')) dictamen = 'cuarentena'
  if (causales.some((causal) => causal.nivel === 'rechazo')) dictamen = 'rechazado'

  return { dictamen, causales, vidaUtilMeses, reporteSanitario }
}

// Cuenta cuántos ítems quedan en cada dictamen
export function resumirDictamenes(evaluaciones) {
  return evaluaciones.reduce(
    (resumen, evaluacion) => {
      resumen[evaluacion.dictamen] += 1
      return resumen
    },
    { aprobado: 0, cuarentena: 0, rechazado: 0 }
  )
}
