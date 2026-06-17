import { useState } from 'react'

const transportes = ['auto', 'moto', 'bici', 'bus', 'tren', 'avion', 'caminata']

export default function FormularioMovilidad({ onCreado, eventoId }) {
  const [transporte, setTransporte] = useState('auto')
  const [distancia, setDistancia] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [tipoFuente, setTipoFuente] = useState('estimado')
  const [comentario, setComentario] = useState('')

  async function manejarSubmit(e) {
    e.preventDefault()
    if (!distancia || !cantidad) return alert('Completa distancia y cantidad')

    const payload = {
      evento_id: Number(eventoId),
      transporte,
      distancia: Number(distancia),
      cantidad_empleados: Number(cantidad),
      tipo_fuente: tipoFuente,
      comentario: comentario.trim() === '' ? null : comentario.trim() // Enviar null si está vacío
    }

    try {
      await onCreado(payload)
      setDistancia('')
      setCantidad('')
      setTipoFuente('estimado')
      setComentario('') // Limpiar el comentario después de agregar
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creando movilidad')
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Transporte</label>
        <select className="w-full border p-2 rounded" value={transporte} onChange={e => setTransporte(e.target.value)}>
          {transportes.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Distancia total personas (km)</label>
        <input className="w-full border p-2 rounded" type="number" step="0.01" min="0" value={distancia} onChange={e => setDistancia(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cantidad de personas</label>
        <input className="w-full border p-2 rounded" type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de dato</label>
        <select className="w-full border p-2 rounded" value={tipoFuente} onChange={e => setTipoFuente(e.target.value)}>
          <option value="estimado">Estimado</option>
          <option value="real">Real</option>
        </select>
      </div>
      <div>
        <label htmlFor="comentarioMovilidad" className="block text-sm font-medium text-gray-700">Comentario (opcional)</label>
        <textarea
          id="comentarioMovilidad"
          name="comentarioMovilidad"
          rows="3"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={comentario} onChange={e => setComentario(e.target.value)}></textarea>
      </div>
      <div className="flex justify-end">
        <button className="bg-emerald-600 text-white px-3 py-2 rounded">Agregar movilidad</button>
      </div>
    </form>
  )
}
