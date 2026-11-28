const { SQL } = require('./consultas');
const { consultar } = require('./baseDatos');
const { codigoProducto, filaAMedicamento, parsearCodigo } = require('./serializadores');

// Lee todos los productos (bloqueados si se pide, dentro de una transacción)
async function leerMedicamentos(conexion, { bloquear = false } = {}) {
  const filas = await consultar(conexion, bloquear ? SQL.listarProductosBloqueo : SQL.listarProductos);
  return filas.map(filaAMedicamento);
}

/**
 * Versión con base de datos de incorporarAlInventario() del frontend:
 * suma cajas a un producto existente, o crea el producto nuevo.
 * Si ya existe un producto con el mismo nombre (sin tildes ni mayúsculas), lo reutiliza.
 *
 * @param conexion   conexión dentro de una transacción
 * @param medicamentos lista en memoria (se actualiza para las siguientes llamadas)
 * @param normalizarTexto función compartida con el frontend
 * @returns {Promise<number|null>} id numérico del producto, o null si no se pudo
 */
async function incorporarAlInventario(conexion, medicamentos, normalizarTexto, { medicamentoId, nuevoMedicamento, cajas }) {
  const sumarCajas = async (codigo) => {
    const id = parsearCodigo(codigo, 'MED-');
    await consultar(conexion, SQL.sumarStock, [cajas, id]);

    const enMemoria = medicamentos.find((medicamento) => medicamento.id === codigo);
    enMemoria.cajas += cajas;
    return id;
  };

  if (medicamentoId && medicamentos.some((medicamento) => medicamento.id === medicamentoId)) {
    return sumarCajas(medicamentoId);
  }

  if (!nuevoMedicamento) return null;

  const existente = medicamentos.find(
    (medicamento) => normalizarTexto(medicamento.nombre) === normalizarTexto(nuevoMedicamento.nombre)
  );

  if (existente) return sumarCajas(existente.id);

  const resultado = await consultar(conexion, SQL.insertarProducto, [
    nuevoMedicamento.nombre,
    nuevoMedicamento.precioCaja,
    cajas,
    nuevoMedicamento.unidadesPorCaja,
    nuevoMedicamento.categoria,
  ]);

  medicamentos.push({
    id: codigoProducto(resultado.insertId),
    nombre: nuevoMedicamento.nombre,
    categoria: nuevoMedicamento.categoria,
    cajas,
    unidadesPorCaja: nuevoMedicamento.unidadesPorCaja,
    precioCaja: nuevoMedicamento.precioCaja,
  });

  return resultado.insertId;
}

module.exports = { leerMedicamentos, incorporarAlInventario };
