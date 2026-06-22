export default function TarjetaFactor({ factor, onEliminar }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group relative">
      <div className="p-3 sm:p-4 flex-1 min-w-0">
        {/* Category & Region badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pr-6">
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
            {factor.categoria}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 uppercase tracking-wide">
            {factor.region}
          </span>
        </div>

        {/* Title / Subtype */}
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mb-2.5 break-words" title={factor.subtipo}>
          {factor.subtipo}
        </h3>

        {/* Carbon Emission Factor value box */}
        <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-100/50 rounded-lg p-2.5 mb-3">
          <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Factor de emisión</div>
          <div className="text-xs sm:text-sm font-bold text-emerald-950 break-words" title={`${factor.valor} kgCO2e / ${factor.unidad}`}>
            {factor.valor} <span className="text-[10px] sm:text-xs text-emerald-700 font-normal">kgCO2e / {factor.unidad}</span>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-[11px] sm:text-xs text-gray-500 pt-2.5 border-t border-gray-100">
          <div className="flex items-start gap-1.5 min-w-0">
            <span className="shrink-0 text-gray-400 mt-0.5" aria-hidden="true">📚</span>
            <span className="break-words" title={factor.fuente}>Fuente: {factor.fuente}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 text-[10px] text-gray-400 pt-0.5">
            <span>Versión: {factor.version}</span>
            <span>Vigencia: {factor.vigencia}</span>
          </div>
        </div>
      </div>

      {/* Delete button (Placed at the end for z-index layering safety) */}
      <button
        onClick={onEliminar}
        className="absolute top-2.5 right-2.5 text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-lg border border-red-100 hover:border-red-600 transition-all duration-200 shadow-sm z-30 cursor-pointer"
        title="Eliminar Dimensión"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
