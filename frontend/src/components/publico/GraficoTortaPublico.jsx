import { useState } from 'react'

const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logistica',
  ticket: 'tickets'
}

export default function GraficoTortaPublico({ datos = [], tamaño = 240, etiqueta = 'kgCO2e' }) {
  const [activoIndex, setActivoIndex] = useState(null)
  
  const total = datos.reduce((sum, item) => sum + Number(item.valor || 0), 0)
  const radio = tamaño / 2
  const centro = tamaño / 2
  
  // Paleta de colores vivos adaptados al fondo oscuro (Slate-950)
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
    return <p className="text-sm text-slate-400">Sin datos para graficar.</p>
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

    // Cálculo para desplazar el segmento si está activo (efecto hover / touch)
    const anguloMedioRad = (((inicio + fin) / 2) - 90) * (Math.PI / 180)
    const offset = activoIndex === index ? 6 : 0
    const tx = offset * Math.cos(anguloMedioRad)
    const ty = offset * Math.sin(anguloMedioRad)

    return (
      <path
        key={item.nombre}
        d={path}
        fill={colores[index % colores.length]}
        stroke="#020617" // slate-950 matching background
        strokeWidth="2"
        className="transition-all duration-300 cursor-pointer"
        style={{
          transform: `translate(${tx}px, ${ty}px)`,
          filter: activoIndex === index ? `drop-shadow(0 0 8px ${colores[index % colores.length]}80)` : 'none',
          opacity: activoIndex === null || activoIndex === index ? 1 : 0.65
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

  // Contenido de la etiqueta en el centro de la dona
  const itemActivo = activoIndex !== null ? datos[activoIndex] : null
  const tituloCentro = itemActivo ? (MAPA_LABELS[itemActivo.nombre] || itemActivo.nombre) : 'Total'
  const valorCentro = itemActivo ? itemActivo.valor : total
  const porcentajeCentro = itemActivo ? (itemActivo.valor / total) * 100 : 100

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Contenedor relativo de la dona */}
      <div className="relative" style={{ width: tamaño, height: tamaño }}>
        <svg width={tamaño} height={tamaño} viewBox={`0 0 ${tamaño} ${tamaño}`} className="overflow-visible">
          {segmentos}
          
          {/* Círculo central que hace el efecto de la dona */}
          <circle
            cx={centro}
            cy={centro}
            r={radio * 0.62}
            fill="#020617" // slate-950
          />
        </svg>

        {/* Texto del centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 max-w-[120px] truncate capitalize">
            {tituloCentro}
          </span>
          <span className="text-xl font-extrabold text-slate-50 font-mono mt-0.5">
            {Number(valorCentro).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 font-mono">
            {activoIndex !== null ? `${porcentajeCentro.toFixed(1)}%` : etiqueta}
          </span>
        </div>
      </div>

      {/* Leyenda interactiva */}
      <div className="grid grid-cols-2 gap-3 text-xs w-full max-w-sm mt-2">
        {datos.map((item, index) => {
          const esActivo = activoIndex === index
          const porc = total > 0 ? (item.valor / total) * 100 : 0
          
          return (
            <div
              key={item.nombre}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                esActivo
                  ? 'bg-slate-800/60 border-slate-700 shadow-md translate-x-1'
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
                  boxShadow: esActivo ? `0 0 8px ${colores[index % colores.length]}` : 'none'
                }}
              />
              <span className="truncate text-slate-300 font-medium capitalize max-w-[90px]">
                {MAPA_LABELS[item.nombre] || item.nombre}
              </span>
              <span className="ml-auto font-mono text-slate-400 font-semibold">
                {porc.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
