// ============================================================
// CONTEXTOS DE REACT (useContext)
// Se crean aquí, separados de sus proveedores (.jsx), para que cada
// archivo exporte solo componentes o solo valores (regla de Vite/Oxlint).
//
//  NavegacionContext → vista actual e irA(vista). Lo usan el navbar, los
//                      botones CTA, el footer y el encabezado, sin pasar props.
//  ChatContext       → conversación con la IA. Vive por encima de las vistas,
//                      así la respuesta llega aunque el usuario cambie de vista.
// ============================================================
import { createContext } from 'react'

export const NavegacionContext = createContext(null)

export const ChatContext = createContext(null)
