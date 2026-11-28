// Traducen entre las filas de MySQL (snake_case, ids numéricos)
// y los objetos que usa React (camelCase, códigos como "MED-004").

// ---------- Códigos ----------
function formatearCodigo(prefijo, id, digitos) {
  return `${prefijo}${String(id).padStart(digitos, '0')}`;
}

const codigoProducto = (id) => formatearCodigo('MED-', id, 3);
const codigoActa = (id) => formatearCodigo('ACT-', id, 4);
const codigoLote = (id) => formatearCodigo('LOT-', id, 4);

// "MED-004" → 4 · devuelve null si no tiene el formato esperado
function parsearCodigo(codigo, prefijo) {
  const coincidencia = new RegExp(`^${prefijo}(\\d+)$`).exec(String(codigo ?? ''));
  return coincidencia ? Number(coincidencia[1]) : null;
}

// "ACT-0001-3" → 3 (número del ítem dentro del acta)
function numeroDeItem(idItem, codigo) {
  const coincidencia = new RegExp(`^${codigo}-(\\d+)$`).exec(String(idItem ?? ''));
  return coincidencia ? Number(coincidencia[1]) : null;
}

// ---------- Tipos de MySQL ----------

// MySQL devuelve JSON ya convertido; MariaDB lo devuelve como texto
function leerJson(valor, porDefecto = null) {
  if (valor === null || valor === undefined) return porDefecto;
  return typeof valor === 'string' ? JSON.parse(valor) : valor;
}

function aISO(fecha) {
  return fecha ? new Date(fecha).toISOString() : null;
}

function dosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

// Date → "2026-11-02T14:44" (formato de <input type="datetime-local">)
function aFechaHoraLocal(fecha) {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '';

  return `${valor.getFullYear()}-${dosDigitos(valor.getMonth() + 1)}-${dosDigitos(
    valor.getDate()
  )}T${dosDigitos(valor.getHours())}:${dosDigitos(valor.getMinutes())}`;
}

// "2026-11-02T14:44" → Date local, o null si no es válida
function desdeFechaHoraLocal(texto) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(texto ?? ''));
  if (!coincidencia) return null;

  const [, anio, mes, dia, hora, minuto] = coincidencia.map(Number);
  const fecha = new Date(anio, mes - 1, dia, hora, minuto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// Recorta textos para que quepan en la columna (evita "Data too long")
function recortar(valor, maximo) {
  return String(valor ?? '').trim().slice(0, maximo);
}

// ---------- Filas → objetos de React ----------

function filaAMedicamento(fila) {
  return {
    id: codigoProducto(fila.id),
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? '', // se muestra en el detalle del catálogo
    categoria: fila.categoria,
    cajas: Number(fila.stock),
    unidadesPorCaja: Number(fila.unidades_por_caja),
    precioCaja: Number(fila.precio),
  };
}

function filaAItem(fila, codigo) {
  const item = {
    ...leerJson(fila.datos, {}),
    id: `${codigo}-${fila.numero}`,
    medicamentoId: fila.producto_id ? codigoProducto(fila.producto_id) : null,
  };

  const evaluacion = leerJson(fila.evaluacion);
  if (evaluacion) item.evaluacion = evaluacion;

  return item;
}

function filaAActa(fila, filasItems = []) {
  const codigo = codigoActa(fila.id);

  return {
    id: codigo,
    fechaRecepcion: aFechaHoraLocal(fila.fecha_recepcion),
    proveedor: fila.proveedor,
    nit: fila.nit,
    ordenCompra: fila.orden_compra,
    factura: fila.factura,
    remision: fila.remision,
    transportador: fila.transportador,
    responsableRecepcion: fila.responsable_recepcion,
    directorTecnico: fila.director_tecnico,
    estado: fila.estado,
    items: filasItems.map((filaItem) => filaAItem(filaItem, codigo)),
    fechaCierre: aISO(fila.fecha_cierre),
    resumen: leerJson(fila.resumen),
  };
}

function filaAHistorial(fila) {
  return {
    fecha: aISO(fila.fecha),
    accion: fila.accion,
    detalle: fila.detalle,
    responsable: fila.responsable,
  };
}

function filaALote(fila, filasHistorial = []) {
  return {
    id: codigoLote(fila.id),
    actaId: codigoActa(fila.acta_id),
    itemId: fila.item_id,
    medicamentoId: fila.producto_id ? codigoProducto(fila.producto_id) : null,
    nuevoMedicamento: leerJson(fila.nuevo_producto),
    nombreProducto: fila.nombre_producto,
    presentacion: fila.presentacion,
    tipoProducto: fila.tipo_producto,
    requiereCadenaFrio: Boolean(fila.requiere_cadena_frio),
    registroSanitario: fila.registro_sanitario,
    lote: fila.lote,
    vencimiento: fila.vencimiento ?? '',
    sinVencimiento: Boolean(fila.sin_vencimiento),
    cajas: Number(fila.cajas),
    estado: fila.estado,
    dictamenInicial: fila.dictamen_inicial,
    causales: leerJson(fila.causales, []),
    reporteSanitario: Boolean(fila.reporte_sanitario),
    fechaIngreso: aISO(fila.fecha_ingreso),
    historial: filasHistorial.map(filaAHistorial),
    disposicion: leerJson(fila.disposicion),
  };
}

module.exports = {
  codigoProducto,
  codigoActa,
  codigoLote,
  parsearCodigo,
  numeroDeItem,
  leerJson,
  aFechaHoraLocal,
  desdeFechaHoraLocal,
  recortar,
  filaAMedicamento,
  filaAActa,
  filaAItem,
  filaALote,
};
