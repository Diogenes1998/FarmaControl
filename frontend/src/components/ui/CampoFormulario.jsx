function CampoFormulario({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  obligatorio = true,
  children,
}) {
  const idMensaje = `${htmlFor}-mensaje`

  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {etiqueta}{' '}
        {obligatorio && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p id={idMensaje} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={idMensaje} className="mt-1 text-xs text-gray-500">
            {ayuda}
          </p>
        )
      )}
    </div>
  )
}

export default CampoFormulario
