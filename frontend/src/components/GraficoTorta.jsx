import { useState } from 'react'

const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logistica',
  ticket: 'tickets'
}

export default function GraficoTorta({ datos = [], tamaño = 180, etiqueta = 'kgCO2e' }) {
  const [activoIndex, setActivoIndex] = useState(null)
  
  const total = datos.reduce((sum, item) => sum + Number(item.valor || 0), 0)
  const radio = tamaño / 2
  const centro = tamaño / 2
  
  // Vibrant colors for light background
  const colores = [
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#0ea5e9', // sky-500
    '#f43f5e', // rose-500
    '#eab308'  // yellow-500
  ]

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

    // Puntos del arco exterior
    const x1 = centro + (radio - 8) * Math.cos((Math.PI / 180) * inicio - Math.PI / 2)
    const y1 = centro + (radio - 8) * Math.sin((Math.PI / 180) * inicio - Math.PI / 2)
    const x2 = centro + (radio - 8) * Math.cos((Math.PI / 180) * fin - Math.PI / 2)
    const y2 = centro + (radio - 8) * Math.sin((Math.PI / 180) * fin - Math.PI / 2)
    const grande = fin - inicio > 180 ? 1 : 0

    const path = `M ${centro} ${centro} L ${x1} ${y1} A ${radio - 8} ${radio - 8} 0 ${grande} 1 ${x2} ${y2} Z`

    // Offset translation for hover/touch segment expansion
    const anguloMedioRad = (((inicio + fin) / 2) - 90) * (Math.PI / 180)
    const offset = activoIndex === index ? 6 : 0
    const tx = offset * Math.cos(anguloMedioRad)
    const ty = offset * Math.sin(anguloMedioRad)

    return (
      <path
        key={item.nombre}
        d={path}
        fill={colores[index % colores.length]}
        stroke="#ffffff" // white gap
        strokeWidth="2"
        className="transition-all duration-300 cursor-pointer"
        style={{
          transform: `translate(${tx}px, ${ty}px)`,
          filter: activoIndex === index ? `drop-shadow(0 0 6px ${colores[index % colores.length]}80)` : 'none',
          opacity: activoIndex === null || activoIndex === index ? 1 : 0.7
        }}
        onMouseEnter={() => setActivoIndex(index)}
        onMouseLeave={() => setActivoIndex(null)}
        onTouchStart={(e) => {
          if (activoIndex === index) {
            setActivoIndex(null)
          } else {
            setActivoIndex(index)
          }
        }}
      />
    )
  })

  const itemActivo = activoIndex !== null ? datos[activoIndex] : null
  const tituloCentro = itemActivo ? (MAPA_LABELS[itemActivo.nombre] || itemActivo.nombre) : 'Total'
  const valorCentro = itemActivo ? itemActivo.valor : total
  const porcentajeCentro = itemActivo ? (itemActivo.valor / total) * 100 : 100

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Relative Donut wrapper */}
      <div className="relative" style={{ width: tamaño, height: tamaño }}>
        <svg width={tamaño} height={tamaño} viewBox={`0 0 ${tamaño} ${tamaño}`} className="overflow-visible">
          {segmentos}
          {/* Inner cutout for donut effect */}
          <circle
            cx={centro}
            cy={centro}
            r={radio * 0.62}
            fill="#ffffff" // white cutout to match card background
          />
        </svg>

        {/* Central Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 max-w-[120px] truncate capitalize">
            {tituloCentro}
          </span>
          <span className="text-lg font-extrabold text-gray-950 font-mono mt-0.5">
            {Number(valorCentro).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 font-mono">
            {activoIndex !== null ? `${porcentajeCentro.toFixed(1)}%` : etiqueta}
          </span>
        </div>
      </div>

      {/* Responsive 2-column interactive legend grid */}
      <div className="grid grid-cols-2 gap-2 text-xs w-full max-w-sm mt-1">
        {datos.map((item, index) => {
          const esActivo = activoIndex === index
          const porc = total > 0 ? (item.valor / total) * 100 : 0
          
          return (
            <div
              key={item.nombre}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                esActivo
                  ? 'bg-gray-50 border-gray-200 shadow-sm translate-x-0.5'
                  : 'bg-transparent border-transparent opacity-85 hover:opacity-100'
              }`}
              onMouseEnter={() => setActivoIndex(index)}
              onMouseLeave={() => setActivoIndex(null)}
              onClick={() => {
                if (activoIndex === index) {
                  setActivoIndex(null)
                } else {
                  setActivoIndex(index)
                }
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: colores[index % colores.length],
                  boxShadow: esActivo ? `0 0 6px ${colores[index % colores.length]}` : 'none'
                }}
              />
              <span className="truncate text-gray-700 font-medium capitalize max-w-[90px]">
                {MAPA_LABELS[item.nombre] || item.nombre}
              </span>
              <span className="ml-auto font-mono text-gray-500 font-semibold">
                {porc.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
