import { useEffect, useMemo, useState } from 'react'
import { obtenerFactores, crearFactor } from '../api/factoresApi'
import clienteApi from '../api/clienteApi' // Mantenemos para eliminar por ahora
import TarjetaFactor from '../components/TarjetaFactor'
import ModalCrearFactor from '../components/ModalCrearFactor'

export default function PaginaFactores() {
  const [factores, setFactores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abrirModal, setAbrirModal] = useState(false)
  const [filtro, setFiltro] = useState('')

  const opcionesFiltro = useMemo(() => {
    const factSub = Array.from(new Set(factores.map(f => `${f.categoria} / ${f.subtipo}`))).sort()
    const vigencias = Array.from(new Set(factores.map(f => f.vigencia))).sort()
    const fuentes = Array.from(new Set(factores.map(f => f.fuente))).sort()
    const regiones = Array.from(new Set(factores.map(f => f.region))).sort()
    return [
      { value: '', label: 'Todas las dimensiones' },
      ...regiones.map(item => ({ value: `region:${item}`, label: `Región: ${item}` })),
      ...factSub.map(item => ({ value: item, label: `Factor/Subtipo: ${item}` })),
      ...vigencias.map(item => ({ value: `vigencia:${item}`, label: `Vigencia: ${item}` })),
      ...fuentes.map(item => ({ value: `fuente:${item}`, label: `Fuente: ${item}` }))
    ]
  }, [factores])

  const factoresFiltrados = factores.filter((factor) => {
    if (!filtro) return true
    if (filtro.startsWith('vigencia:')) {
      return factor.vigencia === filtro.replace('vigencia:', '')
    }
    if (filtro.startsWith('fuente:')) {
      return factor.fuente === filtro.replace('fuente:', '')
    }
    if (filtro.startsWith('region:')) {
      return factor.region === filtro.replace('region:', '')
    }
    return `${factor.categoria} / ${factor.subtipo}` === filtro
  })

  useEffect(() => {
    async function cargar() {
      try {
        const res = await obtenerFactores()
        setFactores(res.data || [])
      } catch {
        setFactores([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta Dimensión? No podrás eliminarla si ya está siendo usada en eventos o mappings de movilidad.')) return
    try {
      await clienteApi.delete(`/factores/${id}`)
      setFactores(factores.filter(f => f.id !== id))
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al eliminar dimension'
      alert(msg)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Dimensiones</h1>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded w-full sm:w-auto font-medium"
        >
          Cargar Dimension
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 max-w-sm">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrar Dimensiones</label>
        <div className="relative">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 pl-3 pr-10 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-medium"
          >
            {opcionesFiltro.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      {cargando ? (
        <p>Cargando dimensiones...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {factoresFiltrados.map((f) => (
            <TarjetaFactor 
              key={f.id} 
              factor={f} 
              onEliminar={() => manejarEliminar(f.id)} 
            />
          ))}
        </div>
      )}

      {abrirModal && (
        <ModalCrearFactor onCerrar={() => setAbrirModal(false)} onCreado={(nuevo) => setFactores([nuevo, ...factores])} />
      )}
    </div>
  )
}
