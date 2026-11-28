// Por debajo de esta cantidad de cajas, el stock se considera BAJO (badge naranja)
export const STOCK_MINIMO = 10

// Por debajo de esta cantidad de cajas, el stock se considera CRÍTICO (badge rojo)
export const STOCK_CRITICO = 5

// Nombre con el que guardamos el inventario en localStorage (Etapa 7)
export const CLAVE_ALMACENAMIENTO = 'farmacontrol_inventario'

// Nombre con el que guardamos las actas de recepción y los lotes (Etapa 9)
export const CLAVE_RECEPCIONES = 'farmacontrol_recepciones'

// Prefijo de los códigos de medicamento: MED-001, MED-002...
export const PREFIJO_CODIGO = 'MED-'

// Opciones del selector de categoría del formulario (Etapa 4)
export const CATEGORIAS = [
  'Analgésico',
  'Antibiótico',
  'Antiinflamatorio',
  'Antihistamínico',
  'Antihipertensivo',
  'Antidiabético',
  'Gastrointestinal',
  'Respiratorio',
  'Vitaminas y suplementos',
  'Otro',
]

// ---------- Asistente con IA (chat) ----------
// Token optimization (lado del navegador): solo viajan los últimos mensajes,
// y de cada uno solo el rol y el texto. El servidor aplica los mismos límites.
export const MENSAJES_ENVIADOS_A_LA_IA = 10
export const MAXIMO_CARACTERES_MENSAJE = 500

// ---------- Catálogo de productos ----------
// El proyecto pide paginación de 10 elementos por página
export const PRODUCTOS_POR_PAGINA = 10
