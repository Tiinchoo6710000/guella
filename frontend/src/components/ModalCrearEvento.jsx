import { useState } from 'react'
import clienteApi from '../api/clienteApi'

export default function ModalCrearEvento({ onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [pais, setPais] = useState('')
  const [region, setRegion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [asistentes, setAsistentes] = useState('')

  async function manejarCrear(e) {
    e.preventDefault()
    try {
      const payload = {
        nombre,
        fecha,
        pais,
        region,
        ciudad,
        cantidad_asistentes: Number(asistentes)
      }
      const res = await clienteApi.post('/eventos', payload)
      if (onCreado) onCreado(res.data)
      onCerrar()
    } catch (err) {
      const mensaje = err.response?.data?.detail || err.response?.statusText || err.message || 'Error creando evento'
      alert(mensaje)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Crear evento</h2>
        <form onSubmit={manejarCrear} className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <input className="w-full border p-2 rounded" type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="País" value={pais} onChange={e => setPais(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Región o provincia" value={region} onChange={e => setRegion(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
          <input className="w-full border p-2 rounded" type="number" min="1" placeholder="Asistentes" value={asistentes} onChange={e => setAsistentes(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCerrar} className="px-3 py-2">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Crear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
