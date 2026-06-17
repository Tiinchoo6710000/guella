
export default function ChecklistInput({ input }) {
  const esReal = input.tipo_fuente === 'real'

  return (
    <div className="flex gap-5 bg-white p-3 rounded-lg border shadow-sm">
      <div>
        <div className="font-semibold">{input.categoria || 'Input'}</div>
        <div className="text-sm text-gray-600">{input.subcategoria || input.subtipo}</div>
        <div className="text-sm text-gray-700">{input.valor} {input.unidad}</div>
      </div>
      {input.comentario && (
        <div className="text-sm text-gray-500 italic mt-1">Comentario: {input.comentario}</div>
      )}
      <div className="mt-3 items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs ${esReal ? 'bg-green-300 text-green-1000' : 'bg-yellow-300 text-yellow-1000'}`}>
          {esReal ? 'Real' : 'Estimado'}
        </span>
      </div>
    </div>
  )
}
