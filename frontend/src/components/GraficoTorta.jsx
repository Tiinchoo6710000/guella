
const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logistica',
  ticket: 'tickets'
}

export default function GraficoTorta({ datos = [], tamaño = 180 }) {
  const total = datos.reduce((sum, item) => sum + Number(item.valor || 0), 0)
  const radio = tamaño / 2
  const centro = tamaño / 2
  const colores = ['#34d399', '#fbbf24', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#38bdf8', '#fde68a']

  if (datos.length === 0 || total === 0) {
    return <p className="text-sm text-gray-500">Sin datos para graficar.</p>
  }

  let acumulado = 0

  const segmentos = datos.map((item, index) => {
    const valor = Number(item.valor || 0)
    if (valor === 0) return null

    const inicio = (acumulado / total) * 360
    acumulado += valor
    const fin = (acumulado / total) * 360

    const x1 = centro + radio * Math.cos((Math.PI / 180) * inicio - Math.PI / 2)
    const y1 = centro + radio * Math.sin((Math.PI / 180) * inicio - Math.PI / 2)
    const x2 = centro + radio * Math.cos((Math.PI / 180) * fin - Math.PI / 2)
    const y2 = centro + radio * Math.sin((Math.PI / 180) * fin - Math.PI / 2)
    const grande = fin - inicio > 180 ? 1 : 0

    const path = `M ${centro} ${centro} L ${x1} ${y1} A ${radio} ${radio} 0 ${grande} 1 ${x2} ${y2} Z`

    return (
      <path
        key={item.nombre}
        d={path}
        fill={colores[index % colores.length]}
        stroke="#fff"
        strokeWidth="1"
      />
    )
  })

  return (
    <div className="space-y-3">
      <div className="relative w-full" style={{ width: tamaño, height: tamaño }}>
        <svg width={tamaño} height={tamaño} viewBox={`0 0 ${tamaño} ${tamaño}`}>
          {segmentos}
        </svg>
      </div>
      <div className="grid gap-2 text-sm">
        {datos.map((item, index) => (
          <div key={item.nombre} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colores[index % colores.length] }} />
            <span className="text-gray-700">{MAPA_LABELS[item.nombre] || item.nombre}</span>
            <span className="ml-auto text-gray-500">{((item.valor / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
