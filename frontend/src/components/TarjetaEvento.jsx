import { Link } from 'react-router-dom'

export default function TarjetaEvento({ evento }) {
  const estado = evento.calculo_pendiente
    ? 'Pendiente'
    : evento.calculo_actual
      ? 'Calculado'
      : 'Sin cálculo'

  const estadoClases = estado === 'Sin cálculo'
    ? 'bg-rose-100 text-rose-800'
    : estado === 'Pendiente'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800'

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-950">{evento.nombre}</h3>
          <p className="text-sm text-gray-600">{evento.fecha} - {evento.ciudad}, {evento.pais}</p>
          <p className="text-sm text-gray-600">Asistentes: {evento.cantidad_asistentes}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${estadoClases}`}>
          {estado}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <Link to={`/eventos/${evento.id}`} className="text-indigo-600 font-medium">Ver</Link>
        <Link to={`/eventos/${evento.id}/calculo`} className="text-indigo-600 font-medium">Calcular</Link>
      </div>
    </div>
  )
}
