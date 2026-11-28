// Descarga un texto como archivo en el equipo del usuario
export function descargarArchivo(nombreArchivo, contenido, tipo = 'application/json') {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  URL.revokeObjectURL(url)
}
