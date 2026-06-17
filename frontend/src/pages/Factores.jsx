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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dimensiones</h1>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          Cargar Dimension
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filtrar Dimensiones</label>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full border rounded p-2"
        >
          {opcionesFiltro.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {cargando ? (
        <p>Cargando dimensiones...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
