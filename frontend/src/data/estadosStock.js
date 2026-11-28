import { STOCK_MINIMO, STOCK_CRITICO } from './constantes.js'

// Configuración visual de cada estado de stock.
// Las claves coinciden con lo que devuelve obtenerEstadoStock() en utils/calculos.js
export const ESTADOS_STOCK = {
  agotado: {
    etiqueta: 'Agotado',
    icono: '⛔',
    clases: 'bg-red-600 text-white',
    descripcion: '0 cajas',
  },
  critico: {
    etiqueta: 'Crítico',
    icono: '🔴',
    clases: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    descripcion: `1 a ${STOCK_CRITICO - 1} cajas`,
  },
  bajo: {
    etiqueta: 'Stock bajo',
    icono: '🟠',
    clases: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
    descripcion: `${STOCK_CRITICO} a ${STOCK_MINIMO - 1} cajas`,
  },
  normal: {
    etiqueta: 'Disponible',
    icono: '🟢',
    clases: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    descripcion: `${STOCK_MINIMO} cajas o más`,
  },
}

// Orden en que se muestran los estados en la leyenda (de más grave a normal)
export const ORDEN_ESTADOS = ['agotado', 'critico', 'bajo', 'normal']
