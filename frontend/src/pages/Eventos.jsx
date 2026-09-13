import { useEffect, useMemo, useState } from 'react'
import clienteApi from '../api/clienteApi'
import TarjetaEvento from '../components/TarjetaEvento'
import ModalCrearEvento from '../components/ModalCrearEvento'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PaginaEventos() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abrirModal, setAbrirModal] = useState(false)

  // Estados de filtros y ordenación
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroProductor, setFiltroProductor] = useState('')
  const [ordenCarga, setOrdenCarga] = useState('recientes')
  const [filtroRegion, setFiltroRegion] = useState('')
  const [filtroAsistentes, setFiltroAsistentes] = useState('')
  const [ordenarCalculo, setOrdenarCalculo] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const res = await clienteApi.get('/eventos')
        setEventos(res.data || [])
      } catch {
        setEventos([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Extraer valores únicos para los selectores
  const productoresDisponibles = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.productor?.nombre || e.productor_nombre).filter(Boolean))).sort()
  }, [eventos])

  const regionesDisponibles = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.region).filter(Boolean))).sort()
  }, [eventos])

  // Filtrado y ordenación de la lista de eventos
  const eventosProcesados = useMemo(() => {
    let resultado = [...eventos]

    // Filtro por nombre
    if (filtroBusqueda.trim()) {
      const q = filtroBusqueda.toLowerCase()
      resultado = resultado.filter(e => e.nombre.toLowerCase().includes(q))
    }

    // Filtro por Productor
    if (filtroProductor) {
      resultado = resultado.filter(e => (e.productor?.nombre || e.productor_nombre) === filtroProductor)
    }

    // Filtro por Región
    if (filtroRegion) {
      resultado = resultado.filter(e => e.region === filtroRegion)
    }

    // Filtro por Asistentes
    if (filtroAsistentes === 'p') {
      resultado = resultado.filter(e => e.cantidad_asistentes < 500)
    } else if (filtroAsistentes === 'm') {
      resultado = resultado.filter(e => e.cantidad_asistentes >= 500 && e.cantidad_asistentes <= 2000)
    } else if (filtroAsistentes === 'g') {
      resultado = resultado.filter(e => e.cantidad_asistentes > 2000)
    }

    // Ordenación
    if (ordenarCalculo === 'mayor_menor') {
      resultado.sort((a, b) => {
        const totalA = a.calculo_actual ? Number(a.calculo_actual.total) : 0
        const totalB = b.calculo_actual ? Number(b.calculo_actual.total) : 0
        return totalB - totalA
      })
    } else if (ordenarCalculo === 'menor_mayor') {
      resultado.sort((a, b) => {
        const totalA = a.calculo_actual ? Number(a.calculo_actual.total) : 0
        const totalB = b.calculo_actual ? Number(b.calculo_actual.total) : 0
        return totalA - totalB
      })
    } else if (ordenCarga === 'antiguos') {
      resultado.sort((a, b) => a.id - b.id)
    } else {
      // 'recientes' (últimos cargados) por defecto
      resultado.sort((a, b) => b.id - a.id)
    }

    return resultado
  }, [eventos, filtroBusqueda, filtroProductor, ordenCarga, filtroRegion, filtroAsistentes, ordenarCalculo])

  const tieneFiltrosActivos = filtroBusqueda || filtroProductor || ordenCarga !== 'recientes' || filtroRegion || filtroAsistentes || ordenarCalculo

  const restablecerFiltros = () => {
    setFiltroBusqueda('')
    setFiltroProductor('')
    setOrdenCarga('recientes')
    setFiltroRegion('')
    setFiltroAsistentes('')
    setOrdenarCalculo('')
  }

  return (
    <div className="w-full space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Eventos</h1>
          <p className="text-sm text-gray-500">Administra los eventos de la plataforma y calcula sus huellas de carbono.</p>
        </div>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl w-full sm:w-auto font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Crear evento</span>
        </button>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Barra de búsqueda por texto */}
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Buscar evento por nombre..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-9 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-normal placeholder-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Botón de limpiar */}
          {tieneFiltrosActivos && (
            <button
              onClick={restablecerFiltros}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer w-full md:w-auto justify-end"
            >
              Restablecer filtros
            </button>
          )}
        </div>

        {/* selectores secundarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-gray-100 pt-3">
          {/* Productor */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Productor</label>
            <div className="relative">
              <select
                value={filtroProductor}
                onChange={(e) => setFiltroProductor(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Todos los productores</option>
                {productoresDisponibles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Orden de Carga */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Orden de carga</label>
            <div className="relative">
              <select
                value={ordenCarga}
                onChange={(e) => setOrdenCarga(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="recientes">Últimos cargados (Recientes)</option>
                <option value="antiguos">Primeros cargados (Antiguos)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Región */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Región</label>
            <div className="relative">
              <select
                value={filtroRegion}
                onChange={(e) => setFiltroRegion(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer font-normal truncate"
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

          {/* Asistentes */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Asistentes</label>
            <div className="relative">
              <select
                value={filtroAsistentes}
                onChange={(e) => setFiltroAsistentes(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Cualquier tamaño</option>
                <option value="p">Pequeños (&lt; 500)</option>
                <option value="m">Medianos (500 - 2,000)</option>
                <option value="g">Grandes (&gt; 2,000)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ordenar por Cálculo */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-500">Ordenar huella</label>
            <div className="relative">
              <select
                value={ordenarCalculo}
                onChange={(e) => setOrdenarCalculo(e.target.value)}
                className="w-full bg-gray-50/60 border border-gray-200 text-gray-700 rounded-xl p-2.5 pl-3 pr-8 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all appearance-none cursor-pointer font-normal truncate"
              >
                <option value="">Sin ordenar por huella</option>
                <option value="mayor_menor">Mayor a menor huella</option>
                <option value="menor_mayor">Menor a mayor huella</option>
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
        <LoadingSpinner mensaje="Cargando eventos..." />
      ) : eventosProcesados.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-150 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">No se encontraron eventos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {eventosProcesados.map((e) => (
            <TarjetaEvento key={e.id} evento={e} />
          ))}
        </div>
      )}

      {abrirModal && (
        <ModalCrearEvento onCerrar={() => setAbrirModal(false)} onCreado={(nuevo) => setEventos([nuevo, ...eventos])} />
      )}
    </div>
  )
}
