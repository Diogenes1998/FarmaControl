import { TIPOS_DISPOSICION } from '../../data/recepcion.js'
import { incorporarAlInventario } from './actas.js'
import { calcularVidaUtilMeses } from './fechas.js'

function texto(valor) {
  return String(valor ?? '').trim()
}

function agregarHistorial(lote, entrada, ahora) {
  return [...lote.historial, { fecha: ahora.toISOString(), ...entrada }]
}

// Cuántos lotes requieren una decisión (cuarentena o rechazados sin disposición)
export function contarPendientes(lotes) {
  return lotes.filter((lote) => lote.estado === 'cuarentena' || lote.estado === 'rechazado')
    .length
}

// ---------------- LIBERAR DE CUARENTENA ----------------

export function validarLiberacion(lote, datos, { medicamentos, ahora = new Date() }) {
  const errores = {}

  if (lote.estado !== 'cuarentena') {
    errores.general = 'Solo se pueden liberar lotes que están en cuarentena.'
  } else if (lote.reporteSanitario) {
    errores.general = 'Un lote con sospecha de falsificación no se puede liberar.'
  } else if (!lote.sinVencimiento && calcularVidaUtilMeses(lote.vencimiento, ahora) <= 0) {
    errores.general = 'El lote ya venció: debe rechazarse.'
  } else {
    const existe = medicamentos.some((medicamento) => medicamento.id === lote.medicamentoId)
    if (!existe && !lote.nuevoMedicamento) {
      errores.general = 'El medicamento de este lote ya no existe en el inventario.'
    }
  }

  if (texto(datos.soporte).length < 10) {
    errores.soporte = 'Describe el soporte que levanta la cuarentena (mínimo 10 caracteres).'
  }
  if (texto(datos.responsable).length < 3) {
    errores.responsable = 'Indica quién autoriza la liberación.'
  }

  return errores
}

/**
 * Libera un lote: pasa a disponible y suma sus cajas al inventario.
 * Devuelve { lote, medicamentos } nuevos (no modifica los originales).
 */
export function liberarLote(lote, datos, { medicamentos, ahora = new Date() }) {
  const resultado = incorporarAlInventario(medicamentos, {
    medicamentoId: lote.medicamentoId,
    nuevoMedicamento: lote.nuevoMedicamento,
    cajas: lote.cajas,
  })

  return {
    medicamentos: resultado.medicamentos,
    lote: {
      ...lote,
      medicamentoId: resultado.medicamentoId,
      estado: 'disponible',
      historial: agregarHistorial(
        lote,
        {
          accion: 'Liberado de cuarentena',
          detalle: texto(datos.soporte),
          responsable: texto(datos.responsable),
        },
        ahora
      ),
    },
  }
}

// ---------------- RECHAZAR DESDE CUARENTENA ----------------

export function validarRechazo(lote, datos) {
  const errores = {}

  if (lote.estado !== 'cuarentena') {
    errores.general = 'Solo se pueden rechazar lotes que están en cuarentena.'
  }
  if (texto(datos.motivo).length < 10) {
    errores.motivo = 'Describe el motivo del rechazo (mínimo 10 caracteres).'
  }
  if (texto(datos.responsable).length < 3) {
    errores.responsable = 'Indica quién decide el rechazo.'
  }

  return errores
}

export function rechazarLote(lote, datos, ahora = new Date()) {
  return {
    ...lote,
    estado: 'rechazado',
    historial: agregarHistorial(
      lote,
      {
        accion: 'Rechazado tras la cuarentena',
        detalle: texto(datos.motivo),
        responsable: texto(datos.responsable),
      },
      ahora
    ),
  }
}

// ---------------- DISPOSICIÓN FINAL DEL RECHAZADO ----------------

// Ante sospecha de falsificación NO se devuelve al proveedor: se retiene y se reporta
export function disposicionesPermitidas(lote) {
  if (lote.reporteSanitario) {
    return TIPOS_DISPOSICION.filter((tipo) => tipo.valor === 'retencionReporte')
  }

  return TIPOS_DISPOSICION.filter((tipo) => tipo.valor !== 'retencionReporte')
}

export function validarDisposicion(lote, datos) {
  const errores = {}
  const permitidas = disposicionesPermitidas(lote).map((tipo) => tipo.valor)

  if (lote.estado !== 'rechazado') {
    errores.general = 'Solo se registra disposición final para lotes rechazados.'
  }
  if (!permitidas.includes(datos.tipo)) {
    errores.tipo = lote.reporteSanitario
      ? 'Ante sospecha de falsificación solo procede retener y reportar.'
      : 'Selecciona el tipo de disposición.'
  }
  if (texto(datos.soporte).length < 3) {
    errores.soporte = 'Indica el número del documento soporte.'
  }
  if (texto(datos.responsable).length < 3) {
    errores.responsable = 'Indica quién registra la disposición.'
  }

  return errores
}

export function registrarDisposicion(lote, datos, ahora = new Date()) {
  const tipo = TIPOS_DISPOSICION.find((opcion) => opcion.valor === datos.tipo)

  return {
    ...lote,
    estado: 'cerrado',
    disposicion: {
      tipo: datos.tipo,
      soporte: texto(datos.soporte),
      responsable: texto(datos.responsable),
      fecha: ahora.toISOString(),
    },
    historial: agregarHistorial(
      lote,
      {
        accion: tipo?.etiqueta ?? 'Disposición final',
        detalle: `${tipo?.soporte ?? 'Soporte'}: ${texto(datos.soporte)}`,
        responsable: texto(datos.responsable),
      },
      ahora
    ),
  }
}
