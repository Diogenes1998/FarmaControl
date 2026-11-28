const ESTILOS_POR_TIPO = {
  exito: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

const ICONOS_POR_TIPO = {
  exito: '✅',
  info: 'ℹ️',
  error: '⚠️',
}

function Aviso({ tipo = 'info', mensaje, alCerrar }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${ESTILOS_POR_TIPO[tipo]}`}
    >
      <span aria-hidden="true">{ICONOS_POR_TIPO[tipo]}</span>
      <p className="flex-1 text-sm">{mensaje}</p>
      {alCerrar && (
        <button
          type="button"
          onClick={alCerrar}
          className="text-sm font-medium hover:underline"
        >
          Cerrar
        </button>
      )}
    </div>
  )
}

export default Aviso
