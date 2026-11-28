function TarjetaSeccion({ titulo, descripcion, icono, acciones, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-sky-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-sky-50">
        <div className="flex items-center gap-3">
          {icono && (
            <span className="text-2xl" aria-hidden="true">
              {icono}
            </span>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
            {descripcion && (
              <p className="text-sm text-gray-500">{descripcion}</p>
            )}
          </div>
        </div>

        {acciones && <div className="shrink-0">{acciones}</div>}
      </div>

      <div className="p-5">{children}</div>
    </section>
  )
}

export default TarjetaSeccion
