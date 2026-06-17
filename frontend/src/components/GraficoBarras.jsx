
const MAPA_LABELS = {
  input: 'aporte',
  movilidad_empleado: 'movilidad logistica',
  ticket: 'tickets'
}

export default function GraficoBarras({ datos = [], etiqueta = 'kgCO2e' }) {
  const maximo = Math.max(...datos.map(item => item.valor), 1)

  if (datos.length === 0) {
    return <p className="text-sm text-gray-500">Sin datos para graficar.</p>
  }

  return (
    <div className="space-y-3">
      {datos.map(item => (
        <div key={item.nombre}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-800">{MAPA_LABELS[item.nombre] || item.nombre}</span>
            <span className="text-gray-600">{item.valor.toFixed(2)} {etiqueta}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded">
            <div
              className="h-2 bg-emerald-600 rounded"
              style={{ width: `${Math.max((item.valor / maximo) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
