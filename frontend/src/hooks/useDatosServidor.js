import { useEffect, useState } from 'react'

import { api } from '../servicios/api.js'

// Pide al servidor las tres colecciones a la vez
async function descargarTodo() {
  const [medicamentos, actas, lotes] = await Promise.all([
    api.obtener('/inventario'),
    api.obtener('/recepciones/actas'),
    api.obtener('/recepciones/lotes'),
  ])

  return { medicamentos, actas, lotes }
}

/**
 * Reemplaza a useInventarioPersistente y useRecepcionesPersistentes (Etapas 7 y 9):
 * ahora la fuente de verdad es MySQL, a través de la API de Express.
 */
export function useDatosServidor() {
  const [datos, setDatos] = useState({ medicamentos: [], actas: [], lotes: [] })
  // estado: 'cargando' | 'listo' | 'error'
  const [conexion, setConexion] = useState({ estado: 'cargando', error: '' })

  // Carga inicial (al montar la aplicación)
  useEffect(() => {
    let cancelado = false

    descargarTodo()
      .then((nuevos) => {
        if (cancelado) return
        setDatos(nuevos)
        setConexion({ estado: 'listo', error: '' })
      })
      .catch((error) => {
        if (!cancelado) setConexion({ estado: 'error', error: error.message })
      })

    // Si el componente se desmonta antes de que llegue la respuesta, se ignora
    return () => {
      cancelado = true
    }
  }, [])

  // Vuelve a pedir todo. Se usa después de operaciones que cambian varias tablas
  // (cerrar un acta o liberar un lote modifican lotes Y el inventario).
  async function recargar() {
    try {
      setDatos(await descargarTodo())
      setConexion({ estado: 'listo', error: '' })
      return true
    } catch (error) {
      setConexion({ estado: 'error', error: error.message })
      return false
    }
  }

  function reintentar() {
    setConexion({ estado: 'cargando', error: '' })
    recargar()
  }

  // Igual que un setState: acepta un valor o una función (anterior) => nuevo
  function crearActualizador(clave) {
    return (valor) =>
      setDatos((anteriores) => ({
        ...anteriores,
        [clave]: typeof valor === 'function' ? valor(anteriores[clave]) : valor,
      }))
  }

  // El inventario solo cambia en el servidor (al cerrar actas o liberar lotes),
  // por eso no se expone un setMedicamentos: se actualiza con recargar()
  return {
    ...datos,
    conexion,
    recargar,
    reintentar,
    setActas: crearActualizador('actas'),
  }
}
