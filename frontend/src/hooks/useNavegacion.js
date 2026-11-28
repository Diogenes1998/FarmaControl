import { useContext } from 'react'

import { NavegacionContext } from '../context/contextos.js'

// Acceso a la navegación desde cualquier componente: const { vista, irA } = useNavegacion()
export function useNavegacion() {
  const contexto = useContext(NavegacionContext)

  if (!contexto) {
    throw new Error('useNavegacion debe usarse dentro de <ProveedorNavegacion>.')
  }

  return contexto
}
