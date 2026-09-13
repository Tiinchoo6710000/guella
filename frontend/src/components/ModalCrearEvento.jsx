import { useState } from 'react'
import clienteApi from '../api/clienteApi'

export default function ModalCrearEvento({ onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [pais, setPais] = useState('')
  const [region, setRegion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [asistentes, setAsistentes] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function manejarCrear(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const payload = {
        nombre: nombre.trim(),
        fecha,
        pais: pais.trim(),
        region: region.trim(),
        ciudad: ciudad.trim(),
        cantidad_asistentes: Number(asistentes)
      }
      const res = await clienteApi.post('/eventos', payload)
      if (onCreado) onCreado(res.data)
      onCerrar()
    } catch (err) {
      const mensaje = err.response?.data?.detail || err.response?.statusText || err.message || 'Error creando evento'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Crear nuevo evento</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ingresá los datos principales para comenzar a medir</p>
          </div>
          <button 
            type="button" 
            onClick={onCerrar} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={manejarCrear} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Nombre del evento</label>
            <input 
              className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder-gray-400" 
              placeholder="Ej: Festival Primavera 2026" 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              required 
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Fecha</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all" 
                type="date" 
                value={fecha} 
                onChange={e => setFecha(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Cantidad de asistentes</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder-gray-400" 
                type="number" 
                min="1" 
                placeholder="Ej: 1500" 
                value={asistentes} 
                onChange={e => setAsistentes(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">País</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder-gray-400" 
                placeholder="Argentina" 
                value={pais} 
                onChange={e => setPais(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Región / Provincia</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder-gray-400" 
                placeholder="Buenos Aires" 
                value={region} 
                onChange={e => setRegion(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Ciudad</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder-gray-400" 
                placeholder="Mar del Plata" 
                value={ciudad} 
                onChange={e => setCiudad(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onCerrar} 
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={cargando}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? 'Creando evento...' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
