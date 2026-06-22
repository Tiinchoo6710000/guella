import { Link } from 'react-router-dom'

export default function TarjetaEvento({ evento }) {
  const estado = evento.calculo_pendiente
    ? 'Pendiente'
    : evento.calculo_actual
      ? 'Calculado'
      : 'Sin cálculo'

  const estadoClases = estado === 'Sin cálculo'
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : estado === 'Pendiente'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Header section with status badge */}
      <div className="p-3 sm:p-4 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${estadoClases}`}>
            {estado}
          </span>
          <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-wide truncate">
            {evento.region || 'Región'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-2 group-hover:text-indigo-600 transition-colors duration-150 truncate" title={evento.nombre}>
          {evento.nombre}
        </h3>

        {/* Metadata Details */}
        <div className="space-y-1.5 text-[11px] sm:text-xs text-gray-500">
          {/* Location */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 text-gray-400" aria-hidden="true">📍</span>
            <span className="truncate" title={`${evento.ciudad}, ${evento.pais}`}>
              {evento.ciudad}, {evento.pais}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="shrink-0 text-gray-400" aria-hidden="true">📅</span>
            <span className="truncate">{evento.fecha}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-1.5 min-w-0 pt-0.5">
            <span className="shrink-0 text-gray-400" aria-hidden="true">👥</span>
            <span className="font-medium text-gray-700 truncate">
              {evento.cantidad_asistentes.toLocaleString()} asistentes
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-gray-50/70 border-t border-gray-100 p-2 sm:p-2.5 flex gap-2">
        <Link 
          to={`/eventos/${evento.id}`} 
          className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-transparent transition-colors"
        >
          Ver
        </Link>
        <Link 
          to={`/eventos/${evento.id}/calculo`} 
          className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 hover:shadow-none transition-all"
        >
          Calcular
        </Link>
      </div>
    </div>
  )
}

