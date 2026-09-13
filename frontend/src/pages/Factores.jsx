import { useEffect, useMemo, useState } from 'react'
import { obtenerFactores, crearFactor } from '../api/factoresApi'
import clienteApi from '../api/clienteApi' // Mantenemos para eliminar por ahora
import TarjetaFactor from '../components/TarjetaFactor'
import ModalCrearFactor from '../components/ModalCrearFactor'
import LoadingSpinner from '../components/LoadingSpinner'

function compareVersions(vA, vB) {
  const partsA = String(vA || '').replace(/^[^\d.]*/, '').split('.').map(Number)
  const partsB = String(vB || '').replace(/^[^\d.]*/, '').split('.').map(Number)
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = isNaN(partsA[i]) ? 0 : partsA[i]
    const numB = isNaN(partsB[i]) ? 0 : partsB[i]
    if (numA !== numB) return numA - numB
  }
  return String(vA || '').localeCompare(String(vB || ''))
}

export default function PaginaFactores() {
  const [factores, setFactores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abrirModal, setAbrirModal] = useState(false)
  const [filtroRegion, setFiltroRegion] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroVersion, setFiltroVersion] = useState('')
  const [filtroVigencia, setFiltroVigencia] = useState('')
  const [filtroFuente, setFiltroFuente] = useState('')

  const regionesDisponibles = useMemo(() => Array.from(new Set(factores.map(f => f.region).filter(Boolean))).sort(), [factores])
  const categoriasDisponibles = useMemo(() => Array.from(new Set(factores.map(f => f.categoria).filter(Boolean))).sort(), [factores])
  const vigenciasDisponibles = useMemo(() => Array.from(new Set(factores.map(f => f.vigencia).filter(Boolean))).sort(), [factores])
  const fuentesDisponibles = useMemo(() => Array.from(new Set(factores.map(f => f.fuente).filter(Boolean))).sort(), [factores])
  const versionesDisponibles = useMemo(() => Array.from(new Set(factores.map(f => f.version).filter(Boolean))).sort(compareVersions).reverse(), [factores])

  // Identificar los IDs que corresponden a la última versión de cada dimensión (categoría + subtipo + región)
  const idsUltimaVersion = useMemo(() => {
    const grupos = {}
    factores.forEach(f => {
      const key = `${(f.categoria || '').trim().toLowerCase()}|${(f.subtipo || '').trim().toLowerCase()}|${(f.region || '').trim().toLowerCase()}`
      if (!grupos[key]) {
        grupos[key] = f
      } else {
        const actual = grupos[key]
        const cmp = compareVersions(f.version, actual.version)
        if (cmp > 0 || (cmp === 0 && f.id > actual.id)) {
          grupos[key] = f
        }
      }
    })
    return new Set(Object.values(grupos).map(f => f.id))
  }, [factores])

  const factoresFiltrados = factores.filter((factor) => {
    if (filtroRegion && factor.region !== filtroRegion) return false
    if (filtroCategoria && factor.categoria !== filtroCategoria) return false
    if (filtroVersion === 'ultima') {
      if (!idsUltimaVersion.has(factor.id)) return false
    } else if (filtroVersion && factor.version !== filtroVersion) {
      return false
    }
    if (filtroVigencia && factor.vigencia !== filtroVigencia) return false
    if (filtroFuente && factor.fuente !== filtroFuente) return false
    return true
  })

  const tieneFiltrosActivos = filtroRegion || filtroCategoria || filtroVersion || filtroVigencia || filtroFuente
  const restablecerFiltros = () => {
    setFiltroRegion('')
    setFiltroCategoria('')
    setFiltroVersion('')
    setFiltroVigencia('')
    setFiltroFuente('')
  }

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
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Dimensiones</h1>
          <p className="text-sm text-gray-500">Administra los factores de emisión y dimensiones de cálculo.</p>
        </div>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl w-full sm:w-auto font-medium hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm cursor-pointer"
        >
          Cargar Dimension
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm mb-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <h2 className="text-xs font-medium text-gray-600">Filtros de dimensiones</h2>
          </div>
          {tieneFiltrosActivos && (
            <button
              onClick={restablecerFiltros}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Restablecer
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Región */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Región</label>
            <div className="relative">
              <select
                value={filtroRegion}
                onChange={(e) => setFiltroRegion(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todas las regiones</option>
                {regionesDisponibles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Categoría</label>
            <div className="relative">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todas las categorías</option>
                {categoriasDisponibles.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Versión */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Versión</label>
            <div className="relative">
              <select
                value={filtroVersion}
                onChange={(e) => setFiltroVersion(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todas las versiones</option>
                <option value="ultima">Última versión</option>
                {versionesDisponibles.map(v => (
                  <option key={v} value={v}>Versión {v}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Vigencia */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Vigencia (Año)</label>
            <div className="relative">
              <select
                value={filtroVigencia}
                onChange={(e) => setFiltroVigencia(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todos los años</option>
                {vigenciasDisponibles.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fuente */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Fuente</label>
            <div className="relative">
              <select
                value={filtroFuente}
                onChange={(e) => setFiltroFuente(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todas las fuentes</option>
                {fuentesDisponibles.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      {cargando ? (
        <LoadingSpinner mensaje="Cargando dimensiones..." />
      ) : factoresFiltrados.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-150 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron dimensiones con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {factoresFiltrados.map((f) => (
            <TarjetaFactor 
              key={f.id} 
              factor={f} 
              esUltimaVersion={idsUltimaVersion.has(f.id)}
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

