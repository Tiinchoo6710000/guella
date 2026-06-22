export default function ChecklistInput({ input }) {
  const esReal = input.tipo_fuente === 'real'

  return (
    <div className="flex flex-col gap-1 w-full min-w-0">
      {/* 1. Tipo (Categoría) */}
      <div className="font-semibold text-xs sm:text-sm text-gray-900 break-words" title={input.categoria || 'Input'}>
        {input.categoria || 'Input'}
      </div>

      {/* 2. Subtipo (Subcategoría/Subtipo) */}
      <div className="text-[11px] sm:text-xs text-gray-500 break-words" title={input.subcategoria || input.subtipo}>
        {input.subcategoria || input.subtipo}
      </div>

      {/* 3. Valor */}
      <div className="text-xs font-semibold text-gray-800 break-words mt-0.5" title={`${input.valor} ${input.unidad}`}>
        {input.valor} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">{input.unidad}</span>
      </div>

      {/* 4. Estado (Real o Estimado) */}
      <div className="mt-0.5">
        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
          esReal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {esReal ? 'Real' : 'Estimado'}
        </span>
      </div>

      {/* 5. Comentario */}
      {input.comentario && (
        <div className="text-[11px] sm:text-xs text-gray-400 italic break-words mt-1.5 border-t border-gray-100/50 pt-1">
          "{input.comentario}"
        </div>
      )}
    </div>
  )
}
