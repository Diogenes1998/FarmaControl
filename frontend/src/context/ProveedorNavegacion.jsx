import { useCallback, useEffect, useMemo, useState } from 'react'

import { NavegacionContext } from './contextos.js'
import { VISTAS, VISTA_INICIAL } from '../data/vistas.js'

// La vista se guarda en la URL (#/productos): recargar la página o usar
// el botón "Atrás" del navegador conserva la sección.
function vistaDesdeUrl() {
  const clave = window.location.hash.replace(/^#\/?/, '')
  return VISTAS[clave] ? clave : VISTA_INICIAL
}

function ProveedorNavegacion({ children }) {
  const [vista, setVista] = useState(vistaDesdeUrl)

  // Ciclo de vida: al montar se escucha el cambio de URL; al desmontar se deja de escuchar
  useEffect(() => {
    function alCambiarUrl() {
      setVista(vistaDesdeUrl())
      window.scrollTo({ top: 0 })
    }

    window.addEventListener('hashchange', alCambiarUrl)
    return () => window.removeEventListener('hashchange', alCambiarUrl)
  }, [])

  // Título de la pestaña del navegador según la vista
  useEffect(() => {
    document.title = `${VISTAS[vista].titulo} | FarmaControl`
  }, [vista])

  const irA = useCallback(
    (nuevaVista) => {
      if (!VISTAS[nuevaVista]) return

      if (nuevaVista === vista) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      window.location.hash = `/${nuevaVista}` // dispara "hashchange"
    },
    [vista]
  )

  const valor = useMemo(() => ({ vista, irA }), [vista, irA])

  return <NavegacionContext.Provider value={valor}>{children}</NavegacionContext.Provider>
}

export default ProveedorNavegacion
