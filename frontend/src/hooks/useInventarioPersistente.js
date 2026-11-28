import { useState, useEffect } from 'react'

import { CLAVE_ALMACENAMIENTO } from '../data/constantes.js'
import { medicamentosIniciales } from '../data/medicamentosIniciales.js'
import {
  cargarInventario,
  guardarInventario,
  interpretarInventario,
} from '../utils/almacenamiento.js'

export function useInventarioPersistente() {
  // Lectura inicial: se ejecuta UNA sola vez (inicialización perezosa)
  const [infoCarga] = useState(cargarInventario)
  const [medicamentos, setMedicamentos] = useState(infoCarga.medicamentos)

  const guardadoActivo = infoCarga.origen !== 'sinAlmacenamiento'

  // EFECTO 1: guardar automáticamente cada vez que cambia el inventario
  useEffect(() => {
    if (!guardadoActivo) return

    guardarInventario(medicamentos)
  }, [medicamentos, guardadoActivo])

  // EFECTO 2: escuchar cambios hechos en OTRAS pestañas
  useEffect(() => {
    if (!guardadoActivo) return

    function manejarCambioExterno(evento) {
      if (evento.key !== CLAVE_ALMACENAMIENTO) return
      if (evento.newValue === null) return // la clave fue borrada: se conservan los datos actuales

      const resultado = interpretarInventario(evento.newValue)

      if (resultado !== null) {
        setMedicamentos(resultado.medicamentos)
      }
    }

    window.addEventListener('storage', manejarCambioExterno)

    // LIMPIEZA: dejar de escuchar cuando el componente se desmonte
    return () => {
      window.removeEventListener('storage', manejarCambioExterno)
    }
  }, [guardadoActivo])

  // Reemplaza todo el inventario (importación de respaldo)
  function reemplazarInventario(nuevosMedicamentos) {
    setMedicamentos(nuevosMedicamentos)
  }

  // Vuelve a los 8 medicamentos de ejemplo
  function restaurarEjemplo() {
    setMedicamentos(medicamentosIniciales)
  }

  return {
    medicamentos,
    setMedicamentos,
    infoCarga,
    guardadoActivo,
    reemplazarInventario,
    restaurarEjemplo,
  }
}
