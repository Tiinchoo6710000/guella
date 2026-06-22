
import { useEffect, useState } from 'react'

const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logística',
  ticket: 'tickets'
}

export default function GraficoBarras({ datos = [], etiqueta = 'kgCO2e' }) {
  const [animar, setAnimar] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 50)
    return () => clearTimeout(t)
  }, [])

  const maximo = Math.max(...datos.map(item => item.valor), 1)

  if (datos.length === 0) {
    return <p className="text-xs text-gray-400 font-medium py-2">Sin datos para graficar.</p>
  }

  return (
    <div className="space-y-4">
      {datos.map(item => {
        const porcentaje = (item.valor / maximo) * 100
        return (
          <div key={item.nombre} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 capitalize">
                {MAPA_LABELS[item.nombre] || item.nombre}
              </span>
              <span className="font-mono text-slate-500">
                {Number(item.valor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {etiqueta}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-emerald-500 rounded-full transition-all duration-[3000ms] ease-out"
                style={{ width: `${animar ? Math.max(porcentaje, 2) : 0}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
