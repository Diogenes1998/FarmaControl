// Título de página común a las vistas públicas (requisito "Título de la página")
function EncabezadoVista({ titulo, descripcion, etiqueta, acciones }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {etiqueta && (
          <p className="text-xs font-semibold uppercase tracking-wider text-farma-verde">{etiqueta}</p>
        )}
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">{titulo}</h2>
        {descripcion && <p className="mt-1 max-w-3xl text-sm text-gray-500 sm:text-base">{descripcion}</p>}
      </div>
      {acciones && <div className="shrink-0">{acciones}</div>}
    </div>
  )
}

export default EncabezadoVista
