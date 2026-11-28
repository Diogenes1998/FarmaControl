// Clases compartidas por los formularios del módulo de recepción.
// Es un archivo .js (no .jsx) porque solo exporta textos, no componentes.

export function claseControl(tieneError) {
  const base =
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500'

  return tieneError
    ? `${base} border-red-400 focus:ring-red-300`
    : `${base} border-gray-300 focus:ring-farma-azul`
}

export const CLASE_BOTON_PRIMARIO =
  'rounded-lg bg-farma-azul px-4 py-2 text-sm font-semibold text-white hover:bg-farma-azul-oscuro focus:outline-none focus-visible:ring-2 focus-visible:ring-farma-azul focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export const CLASE_BOTON_SECUNDARIO =
  'rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'

export const CLASE_BOTON_PELIGRO =
  'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700'

export const CLASE_FIELDSET = 'rounded-xl border border-gray-200 p-4 space-y-4'

export const CLASE_LEGEND = 'px-1 text-sm font-semibold text-farma-azul'

// Evita que la rueda del mouse cambie un número sin que se note (Etapa 8)
export function quitarFocoConRueda(evento) {
  evento.currentTarget.blur()
}
