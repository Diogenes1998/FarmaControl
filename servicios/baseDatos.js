const pool = require('../config/db');

// Ejecuta una consulta y devuelve solo las filas (o el resultado de INSERT/UPDATE)
async function consultar(conexion, sql, parametros = []) {
  const [resultado] = await conexion.query(sql, parametros);
  return resultado;
}

/**
 * Ejecuta varias consultas como UNA sola operación:
 * si cualquiera falla, se deshacen todas (ROLLBACK).
 * @param {(conexion) => Promise<any>} trabajo
 */
async function enTransaccion(trabajo) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = { pool, consultar, enTransaccion };
