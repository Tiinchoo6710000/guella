export default function ChecklistInput({ input }) {
  const esReal = input.tipo_fuente === 'real'

  return (
    <div className="flex flex-col gap-2.5 w-full min-w-0 text-left">
      {/* Categoria / Tipo */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Tipo</span>
        <div className="font-bold text-sm sm:text-base text-gray-900 truncate" title={input.categoria || 'Input'}>
          {input.categoria || 'Input'}
        </div>
      </div>

      {/* Subtipo */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Subtipo</span>
        <div className="text-xs sm:text-sm font-medium text-gray-600 truncate" title={input.subcategoria || input.subtipo}>
          {input.subcategoria || input.subtipo}
        </div>
      </div>

      {/* Valor */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Valor</span>
        <div className="text-sm font-bold text-gray-800">
          {input.valor} <span className="text-xs text-gray-500 font-normal">{input.unidad}</span>
        </div>
      </div>

      {/* Tipo de dato */}
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Tipo de dato</span>
        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
          esReal ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {esReal ? 'Real' : 'Estimado'}
        </span>
      </div>

      {/* Comentario */}
      {input.comentario && (
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Comentario</span>
          <div className="text-[11px] sm:text-xs text-gray-500 bg-gray-50/80 border border-gray-150 p-2 rounded-lg italic mt-0.5 break-words">
            "{input.comentario}"
          </div>
        </div>
      )}
    </div>
  )
}
