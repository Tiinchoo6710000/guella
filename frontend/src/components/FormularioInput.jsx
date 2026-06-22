import { useEffect, useState, useMemo } from 'react'

export default function FormularioInput({ dimensiones = [], onCreado, eventoId, evento }) {
  const [indexSeleccionado, setIndexSeleccionado] = useState('')
  const [valor, setValor] = useState('')
  const [tipoFuente, setTipoFuente] = useState('estimado')
  const [comentario, setComentario] = useState('')

  const dimensionesUnicas = useMemo(() => {
    const unicas = []
    const map = new Map()
    for (const d of dimensiones) {
      const key = `${d.categoria}-${d.subtipo}`
      if (!map.has(key)) {
        map.set(key, true)
        unicas.push(d)
      }
    }
    return unicas
  }, [dimensiones])

  useEffect(() => {
    if (dimensionesUnicas.length === 0) {
      setIndexSeleccionado('')
      return
    }
    const indiceActual = Number(indexSeleccionado)
    if (indexSeleccionado === '' || indiceActual >= dimensionesUnicas.length) {
      setIndexSeleccionado('0')
    }
  }, [dimensionesUnicas, indexSeleccionado])

  async function manejarSubmit(e) {
    e.preventDefault()
    if (indexSeleccionado === '') return alert('Primero selecciona una Dimensión')
    if (!valor || Number(valor) <= 0) return alert('Ingresa un valor mayor a 0')

    const dimension = dimensionesUnicas[Number(indexSeleccionado)]

    const payload = {
      evento_id: Number(eventoId),
      categoria: dimension.categoria,
      subtipo: dimension.subtipo,
      valor: Number(valor),
      tipo_fuente: tipoFuente,
      comentario: comentario.trim() === '' ? null : comentario.trim() // Enviar null si está vacío
    }

    try {
      await onCreado(payload)
      setValor('')
      setTipoFuente('estimado')
      setComentario('') // Limpiar el comentario después de agregar
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creando input')
    }
  }

  if (dimensionesUnicas.length === 0) {
    return null
  }

  return (
    <form onSubmit={manejarSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Categoría / Subtipo</label>
        <select
          value={indexSeleccionado}
          onChange={e => setIndexSeleccionado(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2.5 rounded-xl text-sm transition-all outline-none text-gray-800 font-medium"
        >
          {dimensionesUnicas.map((f, idx) => (
            <option key={`${f.categoria}-${f.subtipo}-${f.id}`} value={idx}>
              {`${f.categoria} / ${f.subtipo}`} ({f.unidad}) · v{f.version}
            </option>
          ))}
        </select>
        {evento?.region && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Se aplicará automáticamente el factor de la región: <strong>{evento.region}</strong>
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Valor</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 rounded-xl text-sm transition-all outline-none"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Tipo de dato</label>
          <select
            className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2.5 rounded-xl text-sm transition-all outline-none text-gray-800 font-medium"
            value={tipoFuente}
            onChange={e => setTipoFuente(e.target.value)}
          >
            <option value="estimado">Estimado</option>
            <option value="real">Real</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="comentario" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Comentario (opcional)</label>
        <textarea
          id="comentario"
          name="comentario"
          rows="2"
          className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 rounded-xl text-sm transition-all outline-none"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Notas adicionales sobre este input..."
        ></textarea>
      </div>

      <div className="flex justify-end pt-2">
        <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-150">
          Agregar input
        </button>
      </div>
    </form>
  )
}
