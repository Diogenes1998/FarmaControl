// ============================================================
// CONFIGURACIÓN DEL MÓDULO DE RECEPCIÓN TÉCNICA (Etapa 9)
// Base normativa: Decreto 780 de 2016 y Resolución 1403 de 2007
// (Manual de Condiciones Esenciales y Procedimientos del Servicio Farmacéutico)
// ============================================================

export const PREFIJO_ACTA = 'ACT-'
export const PREFIJO_LOTE = 'LOT-'

// Valor especial del selector de medicamento: "producto nuevo, aún no está en el inventario"
export const MEDICAMENTO_NUEVO = '__nuevo__'

// Política institucional de recepción. La Resolución 1403 no fija una vida útil
// mínima nacional: es un criterio institucional/contractual que se ajusta aquí.
export const POLITICA_RECEPCION = {
  vidaUtilMinimaMeses: 12,
  temperaturaMinima: 2,
  temperaturaMaxima: 8,
  // Lotes disponibles con menos meses que esto se marcan como "próximos a vencer"
  alertaVencimientoMeses: 6,
}

export const TIPOS_PRODUCTO = [
  { valor: 'general', etiqueta: 'Medicamento de síntesis química' },
  { valor: 'biologico', etiqueta: 'Medicamento biológico' },
  { valor: 'controlEspecial', etiqueta: 'Medicamento de control especial' },
  { valor: 'dispositivoMedico', etiqueta: 'Dispositivo médico' },
]

export const ESTADOS_REGISTRO = [
  { valor: 'vigente', etiqueta: 'Vigente' },
  { valor: 'tramiteRenovacion', etiqueta: 'En trámite de renovación' },
  { valor: 'noVerificado', etiqueta: 'Sin verificar en INVIMA' },
  { valor: 'vencido', etiqueta: 'Vencido' },
  { valor: 'cancelado', etiqueta: 'Cancelado o suspendido' },
]

export const OPCIONES_COINCIDENCIA = [
  { valor: 'si', etiqueta: 'Sí, coincide en todo' },
  { valor: 'pendiente', etiqueta: 'Pendiente de verificar' },
  { valor: 'no', etiqueta: 'No coincide' },
]

// Aspectos de la inspección física, del exterior hacia el producto
export const ASPECTOS_INSPECCION = [
  {
    clave: 'empaqueTerciario',
    etiqueta: 'Empaque terciario (embalaje de transporte)',
    ayuda: 'Sin humedad, aplastamiento ni roturas',
  },
  {
    clave: 'empaqueSecundario',
    etiqueta: 'Empaque secundario (plegadiza)',
    ayuda: 'Íntegro, sin enmendaduras ni etiquetas sobrepuestas',
  },
  {
    clave: 'empaquePrimario',
    etiqueta: 'Empaque primario',
    ayuda: 'Blíster, frasco, cartucho o ampolla íntegros y sin humedad',
  },
  {
    clave: 'rotulado',
    etiqueta: 'Rotulado',
    ayuda: 'Lote y vencimiento legibles e idénticos en todos los empaques',
  },
  {
    clave: 'sellos',
    etiqueta: 'Sellos y precintos de seguridad',
    ayuda: 'Intactos, sin señales de apertura',
  },
  {
    clave: 'caracteristicas',
    etiqueta: 'Características físicas',
    ayuda: 'Color, homogeneidad, claridad y ausencia de partículas',
  },
]

export const RESULTADOS_INSPECCION = [
  { valor: 'conforme', etiqueta: 'Conforme' },
  { valor: 'noConforme', etiqueta: 'No conforme' },
  { valor: 'noAplica', etiqueta: 'No aplica' },
]

export const OPCIONES_INDICADOR_CONGELACION = [
  { valor: 'noActivado', etiqueta: 'No activado' },
  { valor: 'activado', etiqueta: 'Activado (hubo congelación)' },
  { valor: 'sinIndicador', etiqueta: 'El embalaje no trae indicador' },
]

export const OPCIONES_CONCEPTO_TITULAR = [
  { valor: 'pendiente', etiqueta: 'Pendiente de solicitar o recibir' },
  { valor: 'favorable', etiqueta: 'Favorable (se anexa)' },
  { valor: 'desfavorable', etiqueta: 'Desfavorable' },
]

// Configuración visual de los dictámenes. Clases completas para Tailwind.
export const DICTAMENES = {
  aprobado: {
    etiqueta: 'Aprobado',
    icono: '✅',
    clases: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  },
  cuarentena: {
    etiqueta: 'Cuarentena',
    icono: '⏸️',
    clases: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
  },
  rechazado: {
    etiqueta: 'Rechazado',
    icono: '⛔',
    clases: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  },
}

export const ORDEN_DICTAMENES = ['aprobado', 'cuarentena', 'rechazado']

// Estados de un lote después de la recepción
export const ESTADOS_LOTE = {
  disponible: {
    etiqueta: 'Disponible',
    icono: '🟢',
    clases: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  },
  cuarentena: {
    etiqueta: 'En cuarentena',
    icono: '⏸️',
    clases: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
  },
  rechazado: {
    etiqueta: 'Rechazado · pendiente de disposición',
    icono: '⛔',
    clases: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  },
  cerrado: {
    etiqueta: 'No conformidad cerrada',
    icono: '📁',
    clases: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  },
}

export const ORDEN_ESTADOS_LOTE = ['cuarentena', 'rechazado', 'disponible', 'cerrado']

// Destino final de un producto rechazado
export const TIPOS_DISPOSICION = [
  {
    valor: 'devolucion',
    etiqueta: 'Devolución al proveedor',
    soporte: 'No. del acta de devolución',
  },
  {
    valor: 'destruccion',
    etiqueta: 'Destrucción por gestor de residuos autorizado',
    soporte: 'No. del certificado de destrucción',
  },
  {
    valor: 'retencionReporte',
    etiqueta: 'Retención y reporte a INVIMA y Secretaría de Salud',
    soporte: 'No. de radicado del reporte',
  },
]
