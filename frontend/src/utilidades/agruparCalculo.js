export function agruparPorCampo(detalles = [], campo = 'categoria') {
  const mapa = new Map()

  detalles.forEach(detalle => {
    const nombre = detalle[campo] || 'sin_dato'
    const valorActual = mapa.get(nombre) || 0
    mapa.set(nombre, valorActual + Number(detalle.emisiones || 0))
  })

  return Array.from(mapa.entries()).map(([nombre, valor]) => ({ nombre, valor }))
}
