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
    <form onSubmit={manejarSubmit} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Categoría / Subtipo</label>
        <select value={indexSeleccionado} onChange={e => setIndexSeleccionado(e.target.value)} className="w-full border p-2 rounded">
          {dimensionesUnicas.map((f, idx) => (
            <option key={`${f.categoria}-${f.subtipo}-${f.id}`} value={idx}>
              {`${f.categoria} / ${f.subtipo}`} ({f.unidad}) · v{f.version}
            </option>
          ))}
        </select>
        {evento?.region && (
          <p className="text-sm text-emerald-600 mt-2">
            Se aplicará automáticamente el factor de la región: <strong>{evento.region}</strong>
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Valor</label>
        <input className="w-full border p-2 rounded" type="number" step="0.01" min="0" value={valor} onChange={e => setValor(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de dato</label>
        <select className="w-full border p-2 rounded" value={tipoFuente} onChange={e => setTipoFuente(e.target.value)}>
          <option value="estimado">Estimado</option>
          <option value="real">Real</option>
        </select>
      </div>
      <div>
        <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">Comentario (opcional)</label>
        <textarea
          id="comentario"
          name="comentario"
          rows="3"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={comentario} onChange={e => setComentario(e.target.value)}></textarea>
      </div>
      <div className="flex justify-end">
        <button className="bg-emerald-600 text-white px-3 py-2 rounded">Agregar input</button>
      </div>
    </form>
  )
}
