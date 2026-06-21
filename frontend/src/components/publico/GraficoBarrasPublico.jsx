import { useEffect, useState } from 'react'

const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logistica',
  ticket: 'tickets'
}

export default function GraficoBarrasPublico({ datos = [], etiqueta = 'kgCO2e' }) {
  const [animar, setAnimar] = useState(false)
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 100)
    return () => clearTimeout(t)
  }, [])

  const maximo = Math.max(...datos.map(item => item.valor), 1)
  const totalSuma = datos.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

  if (datos.length === 0) {
    return <p className="text-sm text-slate-400">Sin datos para graficar.</p>
  }

  return (
    <div className="space-y-6 relative">
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-tooltip-in {
          animation: tooltipFadeIn 0.15s ease-out forwards;
        }
      `}</style>

      {datos.map((item, index) => {
        const porcentaje = (item.valor / maximo) * 100
        const porcCateg = totalSuma > 0 ? (item.valor / totalSuma) * 100 : 0
        const esActivo = activo === index

        return (
          <div
            key={item.nombre}
            className="relative cursor-pointer group"
            onMouseEnter={() => setActivo(index)}
            onMouseLeave={() => setActivo(null)}
            onTouchStart={(e) => {
              // Permitir click en touch screens para alternar el tooltip
              if (activo === index) {
                setActivo(null)
              } else {
                setActivo(index)
              }
            }}
          >
            <div className="flex justify-between text-sm mb-1.5 transition-colors duration-200">
              <span className={`font-semibold capitalize tracking-wide transition-colors duration-200 ${esActivo ? 'text-emerald-400' : 'text-slate-300'}`}>
                {MAPA_LABELS[item.nombre] || item.nombre}
              </span>
              <span className={`font-mono transition-colors duration-200 ${esActivo ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                {Number(item.valor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {etiqueta}
              </span>
            </div>

            <div className={`h-3 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative transition-all duration-300 ${esActivo ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-[1200ms] ease-out shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                style={{
                  width: `${animar ? Math.max(porcentaje, 4) : 0}%`,
                }}
              />
            </div>

            {/* Tooltip flotante */}
            {esActivo && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-none whitespace-nowrap animate-tooltip-in">
                <div className="font-semibold text-emerald-400 mb-0.5 capitalize">
                  {MAPA_LABELS[item.nombre] || item.nombre}
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  {porcCateg.toFixed(1)}% del total
                </div>
                {/* Flechita del tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
