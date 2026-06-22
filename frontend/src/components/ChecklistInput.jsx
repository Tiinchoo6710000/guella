
export default function ChecklistInput({ input }) {
  const esReal = input.tipo_fuente === 'real'

  return (
    <div className="flex flex-col gap-1 min-w-0 w-full">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate" title={input.categoria || 'Input'}>
          {input.categoria || 'Input'}
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${esReal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
          {esReal ? 'Real' : 'Estimado'}
        </span>
      </div>

      <div className="text-xs text-gray-500 truncate" title={input.subcategoria || input.subtipo}>
        {input.subcategoria || input.subtipo}
      </div>

      <div className="text-xs font-medium text-black-100 mt-1 truncate" title={`${input.valor} ${input.unidad}`}>
        {input.valor} <span className="text-sm text-gray-500 font-normal">{input.unidad}</span>
      </div>

      {input.comentario && (
        <div className="text-xs text-gray-400 italic truncate mt-0.5" title={input.comentario}>
          "{input.comentario}"
        </div>
      )}
    </div>
  )
}

