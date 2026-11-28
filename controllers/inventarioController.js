// API de inventario con el formato que usa FarmaControl (React).
// Trabaja sobre la MISMA tabla "productos" que /api/productos:
//   cajas = stock · precioCaja = precio · unidadesPorCaja = unidades_por_caja
//
// Desde la Etapa 11 es de SOLO LECTURA: los productos entran o suman cajas
// únicamente al cerrar un acta de Recepción técnica (o al liberar un lote).
const { pool } = require('../servicios/baseDatos');
const { leerMedicamentos } = require('../servicios/inventarioServicio');

// GET /api/inventario
async function listar(req, res) {
  res.json(await leerMedicamentos(pool));
}

module.exports = { listar };
