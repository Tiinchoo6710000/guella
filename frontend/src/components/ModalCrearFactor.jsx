import { useState } from 'react'
import clienteApi from '../api/clienteApi'

const opciones = {
  energia: ['electricidad', 'diesel_generador', 'nafta_generador', 'solar'],
  residuos: ['reciclable', 'organico', 'rechazo'],
  agua: ['red', 'transportada'],
  catering: ['carne', 'vegano', 'vegetariano', 'bebidas'],
  produccion: ['papel', 'plastico', 'textil', 'madera'],
  movilidad: ['auto', 'moto', 'bici', 'bus', 'tren', 'avion', 'caminata']
}

const categorias = [
  { key: 'energia', label: 'Energía' },
  { key: 'residuos', label: 'Residuos' },
  { key: 'agua', label: 'Agua' },
  { key: 'catering', label: 'Catering' },
  { key: 'produccion', label: 'Producción' },
  { key: 'movilidad', label: 'Movilidad' }
]

const unidades = {
  electricidad: 'kwh',
  diesel_generador: 'm3',
  nafta_generador: 'm3',
  solar: 'kwh',
  reciclable: 'kg',
  organico: 'kg',
  rechazo: 'kg',
  red: 'm3',
  transportada: 'm3',
  carne: 'kg',
  vegano: 'kg',
  vegetariano: 'kg',
  bebidas: 'm3',
  papel: 'kg',
  plastico: 'kg',
  textil: 'kg',
  madera: 'kg',
  auto: 'km',
  moto: 'km',
  bici: 'km',
  bus: 'km',
  tren: 'km',
  avion: 'km',
  caminata: 'km'
}

export default function ModalCrearFactor({ onCerrar, onCreado }) {
  const [categoria, setCategoria] = useState('energia')
  const [subtipo, setSubtipo] = useState('electricidad')
  const [valor, setValor] = useState('')
  const [fuente, setFuente] = useState('')
  const [version, setVersion] = useState('1.0')
  const [vigencia, setVigencia] = useState('')
  const [region, setRegion] = useState('')
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function cambiarCategoria(nuevaCategoria) {
    setCategoria(nuevaCategoria)
    setSubtipo(opciones[nuevaCategoria][0])
  }

  async function manejarCrear(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const payload = {
        categoria,
        subtipo,
        valor: Number(valor),
        unidad: unidades[subtipo],
        fuente: fuente.trim(),
        version: version.trim(),
        vigencia: vigencia.trim(),
        region: region.trim(),
        comentario: comentario.trim()
      }
      const res = await clienteApi.post('/factores/', payload)
      if (onCreado) onCreado(res.data)
      onCerrar()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creando factor')
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
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Crear nueva dimensión</h2>
            <p className="text-xs text-gray-500 mt-0.5">Definí un nuevo factor de emisión para cálculos</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Categoría</label>
              <select 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all cursor-pointer" 
                value={categoria} 
                onChange={e => cambiarCategoria(e.target.value)}
              >
                {categorias.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Subtipo</label>
              <select 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all cursor-pointer" 
                value={subtipo} 
                onChange={e => setSubtipo(e.target.value)}
              >
                {opciones[categoria].map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Valor de emisión</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder-gray-400" 
                type="number" 
                step="0.000001" 
                min="0" 
                placeholder="Ej: 0.450" 
                value={valor} 
                onChange={e => setValor(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Unidad de medida</label>
              <input 
                className="w-full bg-gray-100 border border-gray-200 text-gray-600 rounded-xl p-2.5 text-xs sm:text-sm font-semibold cursor-not-allowed" 
                value={`kgCO2e / ${unidades[subtipo]}`} 
                readOnly 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Región</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder-gray-400" 
                placeholder="Ej: Argentina" 
                value={region} 
                onChange={e => setRegion(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Versión</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder-gray-400" 
                placeholder="1.0" 
                value={version} 
                onChange={e => setVersion(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-500">Vigencia (Año)</label>
              <input 
                className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder-gray-400" 
                placeholder="Ej: 2026" 
                value={vigencia} 
                onChange={e => setVigencia(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Fuente metodológica</label>
            <input 
              className="w-full bg-gray-50/70 border border-gray-200 text-gray-900 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder-gray-400" 
              placeholder="Ej: IPCC 2023 / RAMCC" 
              value={fuente} 
              onChange={e => setFuente(e.target.value)} 
              required 
            />
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
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? 'Creando dimensión...' : 'Crear dimensión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
