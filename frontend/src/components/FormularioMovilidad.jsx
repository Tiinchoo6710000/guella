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
    <form onSubmit={manejarSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Transporte</label>
        <select
          className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2.5 rounded-xl text-sm transition-all outline-none text-gray-800 font-medium capitalize"
          value={transporte}
          onChange={e => setTransporte(e.target.value)}
        >
          {transportes.map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Distancia total personas (km)</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 rounded-xl text-sm transition-all outline-none"
            type="number"
            step="0.01"
            min="0"
            value={distancia}
            onChange={e => setDistancia(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Cantidad de personas</label>
          <input
            className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 rounded-xl text-sm transition-all outline-none"
            type="number"
            min="1"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            placeholder="1"
          />
        </div>
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

      <div>
        <label htmlFor="comentarioMovilidad" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Comentario (opcional)</label>
        <textarea
          id="comentarioMovilidad"
          name="comentarioMovilidad"
          rows="2"
          className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 rounded-xl text-sm transition-all outline-none"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Notas adicionales sobre movilidad..."
        ></textarea>
      </div>

      <div className="flex justify-end pt-2">
        <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-150">
          Agregar movilidad
        </button>
      </div>
    </form>
  )
}
