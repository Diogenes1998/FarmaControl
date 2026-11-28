// Estilos por color. Clases completas para que Tailwind las detecte.
const TONOS = {
  azul: {
    fondoIcono: 'bg-sky-100',
    valor: 'text-farma-azul',
    activa: 'ring-2 ring-farma-azul',
  },
  naranja: {
    fondoIcono: 'bg-orange-100',
    valor: 'text-orange-600',
    activa: 'ring-2 ring-orange-400',
  },
  verde: {
    fondoIcono: 'bg-emerald-100',
    valor: 'text-farma-verde',
    activa: 'ring-2 ring-emerald-400',
  },
  rojo: {
    fondoIcono: 'bg-red-100',
    valor: 'text-red-600',
    activa: 'ring-2 ring-red-400',
  },
}

function TarjetaMetrica({
  titulo,
  valor,
  detalle,
  icono,
  tono = 'azul',
  activa = false,
  alHacerClic,
}) {
  const estilos = TONOS[tono]
  const esInteractiva = typeof alHacerClic === 'function'

  // Si es interactiva se dibuja como <button>; si no, como <div>
  const Contenedor = esInteractiva ? 'button' : 'div'

  const propsInteractivas = esInteractiva
    ? { type: 'button', onClick: alHacerClic, 'aria-pressed': activa }
    : {}

  return (
    <Contenedor
      {...propsInteractivas}
      className={`w-full text-left bg-white rounded-2xl border border-sky-100 shadow-sm p-4 flex items-start gap-4 ${
        esInteractiva
          ? 'cursor-pointer transition hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-farma-azul'
          : ''
      } ${activa ? estilos.activa : ''}`}
    >
      <span
        className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl ${estilos.fondoIcono}`}
        aria-hidden="true"
      >
        {icono}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm text-gray-500">{titulo}</span>
        <span className={`block text-2xl font-bold mt-0.5 truncate ${estilos.valor}`}>
          {valor}
        </span>
        {detalle && (
          <span className="block text-xs text-gray-500 mt-1">{detalle}</span>
        )}
        {esInteractiva && (
          <span className="block text-xs font-medium text-farma-azul mt-2">
            {activa ? 'Filtro aplicado · clic para quitar' : 'Clic para filtrar la tabla'}
          </span>
        )}
      </span>
    </Contenedor>
  )
}

export default TarjetaMetrica
