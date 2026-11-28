// Datos de apoyo SOLO para las pruebas automáticas (*.test.js).
// Reproducen los 3 ítems del formato de recepción de la droguería.

// Fecha de recepción de referencia: 2 de noviembre de 2026, 10:00 a. m.
export const FECHA_RECEPCION = new Date(2026, 10, 2, 10, 0)

const INSPECCION_CONFORME = {
  empaqueTerciario: 'conforme',
  empaqueSecundario: 'conforme',
  empaquePrimario: 'conforme',
  rotulado: 'conforme',
  sellos: 'conforme',
  caracteristicas: 'conforme',
}

// Ítem 1 del formato: Ibuprofeno 400 mg, todo conforme
export function itemConforme(cambios = {}) {
  return {
    id: 'ACT-0001-1',
    medicamentoId: 'MED-004',
    nuevoMedicamento: null,
    tipoProducto: 'general',
    requiereCadenaFrio: false,
    presentacion: 'Caja x 100 tabletas',
    cantidadOrdenCompra: 10,
    cantidadFacturada: 10,
    cantidadRecibida: 10,
    registroSanitario: 'INVIMA 2023M-0001234',
    titular: 'Laboratorio Ejemplo S.A.S.',
    fabricante: 'Laboratorio Ejemplo S.A.S.',
    estadoRegistro: 'vigente',
    coincidenciaRegistro: 'si',
    fechaConsultaRegistro: '2026-11-02',
    lote: 'AB1234',
    vencimiento: '12/2028',
    sinVencimiento: false,
    temperaturaLlegada: null,
    soporteTemperatura: '',
    indicadorCongelacion: '',
    conceptoTitular: 'pendiente',
    inspeccion: { ...INSPECCION_CONFORME },
    excepcionVidaUtil: false,
    justificacionExcepcion: '',
    compromisoCanje: false,
    sospechaFalsificacion: false,
    observaciones: '',
    ...cambios,
  }
}

// Ítem 2 del formato: Amoxicilina 250 mg/5 mL, vence 06/2027 (menos de 8 meses)
export function itemAmoxicilina(cambios = {}) {
  return itemConforme({
    id: 'ACT-0001-2',
    medicamentoId: 'MED-002',
    presentacion: 'Frasco x 60 mL',
    cantidadOrdenCompra: 5,
    cantidadFacturada: 5,
    cantidadRecibida: 5,
    registroSanitario: 'INVIMA 2022M-0005678',
    lote: 'ZX9876',
    vencimiento: '06/2027',
    ...cambios,
  })
}

// Ítem 3 del formato: Insulina glargina, termolábil, "cadena de frío OK" sin evidencia
export function itemInsulina(cambios = {}) {
  return itemConforme({
    id: 'ACT-0001-3',
    medicamentoId: null,
    nuevoMedicamento: {
      nombre: 'Insulina glargina 100 UI/mL',
      categoria: 'Antidiabético',
      unidadesPorCaja: 1,
      precioCaja: 85000,
    },
    tipoProducto: 'biologico',
    requiereCadenaFrio: true,
    presentacion: 'Cartucho x 3 mL',
    cantidadOrdenCompra: 2,
    cantidadFacturada: 2,
    cantidadRecibida: 2,
    registroSanitario: 'INVIMA 2024M-0009988',
    lote: 'KC5544',
    vencimiento: '01/2028',
    indicadorCongelacion: 'noActivado',
    ...cambios,
  })
}

// Encabezado de acta completo y válido
export function encabezadoValido(cambios = {}) {
  return {
    id: 'ACT-0001',
    fechaRecepcion: '2026-11-02T10:00',
    proveedor: 'Distribuidora Ejemplo S.A.S.',
    nit: '900.123.456-7',
    ordenCompra: 'OC-2026-118',
    factura: 'FE-55021',
    remision: '',
    transportador: '',
    responsableRecepcion: 'Auxiliar de farmacia',
    directorTecnico: 'Q.F. Directora técnica',
    estado: 'borrador',
    items: [],
    fechaCierre: null,
    resumen: null,
    ...cambios,
  }
}
