// ============================================================
// VISTAS DE LA APLICACIÓN
// "publica": las 5 vistas que pide el proyecto final.
// "interna": el sistema de gestión de la droguería (ya existente).
// requiereDatos: la vista necesita MySQL (si no hay conexión, muestra el aviso).
// ============================================================

export const VISTAS = {
  inicio: { etiqueta: 'Inicio', icono: '🏠', grupo: 'publica', titulo: 'Inicio' },
  productos: {
    etiqueta: 'Productos',
    icono: '💊',
    grupo: 'publica',
    titulo: 'Catálogo de productos',
    requiereDatos: true,
  },
  stack: { etiqueta: 'Stack y estudios', icono: '🧰', grupo: 'publica', titulo: 'Stack tecnológico y estudios' },
  contacto: { etiqueta: 'Chat IA y contacto', icono: '💬', grupo: 'publica', titulo: 'Asistente con IA y contacto' },
  propuesta: { etiqueta: 'Propuesta de valor', icono: '⭐', grupo: 'publica', titulo: 'Propuesta de valor' },
  recepcion: {
    etiqueta: 'Recepción técnica',
    icono: '📋',
    grupo: 'interna',
    titulo: 'Recepción técnica',
    requiereDatos: true,
  },
  inventario: { etiqueta: 'Inventario', icono: '📦', grupo: 'interna', titulo: 'Inventario', requiereDatos: true },
  lotes: {
    etiqueta: 'Lotes y no conformes',
    icono: '🧪',
    grupo: 'interna',
    titulo: 'Lotes y no conformes',
    requiereDatos: true,
  },
}

export const VISTA_INICIAL = 'inicio'

export const CLAVES_PUBLICAS = Object.keys(VISTAS).filter((clave) => VISTAS[clave].grupo === 'publica')
export const CLAVES_INTERNAS = Object.keys(VISTAS).filter((clave) => VISTAS[clave].grupo === 'interna')
