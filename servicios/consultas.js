// Todas las sentencias SQL de inventario y recepción técnica, en un solo lugar.
// "FOR UPDATE" bloquea las filas leídas hasta terminar la transacción, para que
// dos usuarios no cierren la misma acta o liberen el mismo lote a la vez.

const COLUMNAS_PRODUCTO = 'id, nombre, descripcion, categoria, stock, unidades_por_caja, precio';

const SQL = {
  // ---------- productos (inventario) ----------
  listarProductos: `SELECT ${COLUMNAS_PRODUCTO} FROM productos ORDER BY id`,
  listarProductosBloqueo: `SELECT ${COLUMNAS_PRODUCTO} FROM productos ORDER BY id FOR UPDATE`,
  // Solo la recepción técnica crea productos o suma cajas (Etapa 11)
  insertarProducto:
    "INSERT INTO productos (nombre, descripcion, precio, stock, unidades_por_caja, categoria) VALUES (?, '', ?, ?, ?, ?)",
  sumarStock: 'UPDATE productos SET stock = stock + ? WHERE id = ?',

  // ---------- actas ----------
  listarActas: 'SELECT * FROM actas_recepcion ORDER BY id',
  obtenerActa: 'SELECT * FROM actas_recepcion WHERE id = ?',
  obtenerActaBloqueo: 'SELECT * FROM actas_recepcion WHERE id = ? FOR UPDATE',
  insertarActa: 'INSERT INTO actas_recepcion (fecha_recepcion) VALUES (?)',
  actualizarEncabezado:
    'UPDATE actas_recepcion SET fecha_recepcion = ?, proveedor = ?, nit = ?, orden_compra = ?, factura = ?, remision = ?, transportador = ?, responsable_recepcion = ?, director_tecnico = ? WHERE id = ?',
  marcarActaCerrada:
    "UPDATE actas_recepcion SET estado = 'cerrada', fecha_cierre = ?, resumen = ? WHERE id = ?",
  eliminarBorrador: "DELETE FROM actas_recepcion WHERE id = ? AND estado = 'borrador'",

  // ---------- ítems ----------
  listarItems: 'SELECT * FROM items_recepcion ORDER BY acta_id, numero',
  listarItemsDeActa: 'SELECT * FROM items_recepcion WHERE acta_id = ? ORDER BY numero',
  eliminarItemsDeActa: 'DELETE FROM items_recepcion WHERE acta_id = ?',
  insertarItem:
    'INSERT INTO items_recepcion (acta_id, numero, producto_id, lote, registro_sanitario, cantidad_recibida, datos) VALUES (?, ?, ?, ?, ?, ?, ?)',
  guardarEvaluacionItem:
    'UPDATE items_recepcion SET datos = ?, evaluacion = ?, producto_id = ? WHERE id = ?',

  // ---------- lotes e historial ----------
  listarLotes: 'SELECT * FROM lotes ORDER BY id',
  obtenerLoteBloqueo: 'SELECT * FROM lotes WHERE id = ? FOR UPDATE',
  insertarLote:
    'INSERT INTO lotes (acta_id, item_id, producto_id, nuevo_producto, nombre_producto, presentacion, tipo_producto, requiere_cadena_frio, registro_sanitario, lote, vencimiento, sin_vencimiento, cajas, estado, dictamen_inicial, causales, reporte_sanitario, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  actualizarEstadoLote: 'UPDATE lotes SET estado = ?, producto_id = ?, disposicion = ? WHERE id = ?',
  listarHistorial: 'SELECT * FROM historial_lotes ORDER BY lote_id, id',
  listarHistorialDeLote: 'SELECT * FROM historial_lotes WHERE lote_id = ? ORDER BY id',
  insertarHistorial:
    'INSERT INTO historial_lotes (lote_id, fecha, accion, detalle, responsable) VALUES (?, ?, ?, ?, ?)',
};

module.exports = { SQL };
