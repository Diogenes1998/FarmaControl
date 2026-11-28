// Íconos genéricos por red (no se usan logos de marcas)
const ICONOS = {
  GitHub: '💻',
  LinkedIn: '💼',
  Instagram: '📷',
  WhatsApp: '💬',
  Facebook: '👥',
  Correo: '✉️',
}

// Lista de enlaces a redes sociales. "compacto" = botones pequeños (footer)
function RedesSociales({ redes, compacto = false, claro = false, className = '' }) {
  const estilo = claro
    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
    : 'border-sky-200 bg-white text-farma-azul hover:bg-sky-50'

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {redes.map(({ red, url }) => (
        <li key={`${red}-${url}`}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors ${estilo} ${
              compacto ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
            }`}
          >
            <span aria-hidden="true">{ICONOS[red] ?? '🔗'}</span>
            {red}
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default RedesSociales
