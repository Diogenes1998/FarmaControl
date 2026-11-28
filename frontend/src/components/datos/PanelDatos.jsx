import TarjetaSeccion from '../ui/TarjetaSeccion.jsx'
import { crearArchivoRespaldo } from '../../utils/almacenamiento.js'
import { descargarArchivo } from '../../utils/descargarArchivo.js'
import { pluralizar } from '../../utils/texto.js'

// Desde la Etapa 10 los datos viven en MySQL: este panel solo exporta una copia legible.
// La restauración se hace desde la base de datos (mysqldump), no desde el navegador.
function PanelDatos({ medicamentos, recepciones }) {
  const hayDatos = medicamentos.length > 0 || recepciones.actas.length > 0

  function exportarRespaldo() {
    const { nombreArchivo, contenido } = crearArchivoRespaldo(medicamentos, recepciones)
    descargarArchivo(nombreArchivo, contenido)
  }

  return (
    <TarjetaSeccion titulo="Datos y respaldo" descripcion="Base de datos MySQL · drogueria_db" icono="🗄️">
      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-sky-50 p-2">
          <dt className="text-xs text-gray-500">Medicamentos</dt>
          <dd className="text-lg font-bold text-farma-azul">{medicamentos.length}</dd>
        </div>
        <div className="rounded-lg bg-sky-50 p-2">
          <dt className="text-xs text-gray-500">Actas</dt>
          <dd className="text-lg font-bold text-farma-azul">{recepciones.actas.length}</dd>
        </div>
        <div className="rounded-lg bg-sky-50 p-2">
          <dt className="text-xs text-gray-500">Lotes</dt>
          <dd className="text-lg font-bold text-farma-azul">{recepciones.lotes.length}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={exportarRespaldo}
        disabled={!hayDatos}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-farma-azul bg-farma-azul px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden="true">⬇️</span> Exportar copia en JSON
      </button>

      <p className="mt-3 text-xs text-gray-500">
        La copia JSON incluye{' '}
        {pluralizar(recepciones.lotes.length, 'lote', 'lotes')} con su trazabilidad y sirve para
        consultar o auditar. El respaldo oficial de la base de datos se hace con{' '}
        <code>mysqldump drogueria_db</code> o desde MySQL Workbench (Server → Data Export).
      </p>
    </TarjetaSeccion>
  )
}

export default PanelDatos
