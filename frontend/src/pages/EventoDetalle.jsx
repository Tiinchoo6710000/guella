import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { eliminarCalculo, obtenerDetalleCalculo } from '../api/calculosApi'
import { crearEvidencia, obtenerEvidenciasEvento, subirArchivoEvidencia, eliminarEvidencia } from '../api/evidenciasApi'
import { eliminarEvento, obtenerCalculosEvento, obtenerEvento } from '../api/eventosApi'
import { obtenerInputsEvento } from '../api/inputsApi'
import { obtenerMovilidadEvento } from '../api/movilidadApi'
import GraficoBarras from '../components/GraficoBarras'
import GraficoTorta from '../components/GraficoTorta'
import { agruparPorCampo } from '../utilidades/agruparCalculo'
import LoadingSpinner from '../components/LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_RENDER || 'http://localhost:8000';

export default function PaginaEventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [calculos, setCalculos] = useState([])
  const [detalleActivo, setDetalleActivo] = useState([])
  const [evidencias, setEvidencias] = useState([])
  const [inputs, setInputs] = useState([])
  const [movilidades, setMovilidades] = useState([])
  const [archivo, setArchivo] = useState(null)
  const [nombreEvidencia, setNombreEvidencia] = useState('')
  const [dimensionSeleccionada, setDimensionSeleccionada] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [tabActiva, setTabActiva] = useState('categoria')

  const cargar = useCallback(async function cargar() {
    try {
      const [rEvento, rCalculos, rEvidencias, rInputs, rMovilidades] = await Promise.all([
        obtenerEvento(id),
        obtenerCalculosEvento(id),
        obtenerEvidenciasEvento(id),
        obtenerInputsEvento(id),
        obtenerMovilidadEvento(id)
      ])

      setEvento(rEvento.data)
      setCalculos(rCalculos.data || [])
      setEvidencias(rEvidencias.data || [])
      setInputs(rInputs.data || [])
      setMovilidades(rMovilidades.data || [])

      const actual = rEvento.data.calculo_actual
      if (actual?.id) {
        const rDetalle = await obtenerDetalleCalculo(actual.id)
        setDetalleActivo(rDetalle.data || [])
      } else {
        setDetalleActivo([])
      }
    } catch {
      setEvento(null)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Dimensiones de aportes (inputs) para asociar la evidencia
  const dimensionesSeleccionables = useMemo(() => {
    return inputs.map(inp => ({
      id: `input-${inp.id}`,
      label: `${inp.categoria} - ${inp.subcategoria || inp.subtipo || ''}`
    }))
  }, [inputs])

  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setArchivo(file)
      // Rellenar automáticamente el nombre con el del archivo si está vacío
      if (!nombreEvidencia) {
        setNombreEvidencia(file.name)
      }
    }
  }

  async function manejarCrearEvidencia(e) {
    e.preventDefault()

    if (!archivo) {
      alert('Por favor selecciona un archivo.')
      return
    }

    setSubiendo(true)
    try {
      // 1. Subir archivo al backend
      const formData = new FormData()
      formData.append('file', archivo)

      const resUpload = await subirArchivoEvidencia(formData)
      const { url, filename: originalFilename } = resUpload.data

      // Detectar extensión del archivo
      const extension = originalFilename.split('.').pop() || 'pdf'

      const nombreFinal = dimensionSeleccionada
        ? `[${dimensionSeleccionada}] ${nombreEvidencia || originalFilename}`
        : (nombreEvidencia || originalFilename)

      // 2. Crear registro de evidencia en la base de datos
      await crearEvidencia({
        evento_id: Number(id),
        calculo_id: evento.calculo_actual?.id || null, // Opcional
        filename: nombreFinal,
        url: url,
        tipo: extension
      })

      // Limpiar formulario
      setArchivo(null)
      setNombreEvidencia('')
      setDimensionSeleccionada('')
      // Limpiar input file del DOM
      const fileInput = document.getElementById('file-upload-input')
      if (fileInput) fileInput.value = ''

      await cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error cargando la evidencia')
    } finally {
      setSubiendo(false)
    }
  }

  async function manejarEliminarEvidencia(evidenciaId) {
    if (!window.confirm('¿Seguro que deseas eliminar esta evidencia?')) return
    try {
      await eliminarEvidencia(evidenciaId)
      await cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar la evidencia')
    }
  }

  async function manejarEliminarCalculo(calculo) {
    try {
      await eliminarCalculo(calculo.id)
      await cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error eliminando cálculo')
    }
  }

  async function manejarEliminarEvento() {
    if (!window.confirm('¿Eliminar este evento y toda su información?')) return
    try {
      await eliminarEvento(id)
      navigate('/eventos')
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar el evento')
    }
  }


  const datosCategoria = useMemo(() => agruparPorCampo(detalleActivo, 'categoria'), [detalleActivo])
  const datosOrigen = useMemo(() => agruparPorCampo(detalleActivo, 'origen'), [detalleActivo])
  const publicUrl = evento?.public_slug ? `${window.location.origin}/public/${evento.public_slug}` : null

  const estado = evento?.calculo_pendiente
    ? 'Pendiente'
    : evento?.calculo_actual
      ? 'Calculado'
      : 'Sin cálculo'

  const estadoClases = estado === 'Sin cálculo'
    ? 'bg-rose-100 text-rose-800'
    : estado === 'Pendiente'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-emerald-100 text-emerald-800'

  if (cargando) return <LoadingSpinner mensaje="Cargando detalle del evento..." fullscreen />
  if (!evento) return <p className="text-center p-8 text-gray-500 font-medium">No se pudo cargar el evento.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb de navegación */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <Link to="/eventos" className="hover:text-indigo-600 transition-colors">Eventos</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">Detalle del evento</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-2.5">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
            {evento.nombre}
          </h1>
          <div className="flex flex-wrap gap-2">
            {/* Etiqueta de Fecha */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-50 border border-gray-200/60 text-gray-600 shadow-sm">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {evento.fecha}
            </span>
            {/* Etiqueta de Ubicación */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-50 border border-gray-200/60 text-gray-600 shadow-sm">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {evento.ciudad}, {evento.region}, {evento.pais}
            </span>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <Link
            to={`/eventos/${id}/calculo`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Calcular huella</span>
          </Link>
          <button
            onClick={manejarEliminarEvento}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Asistentes */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 w-fit mx-auto sm:mx-0">
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asistentes</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{evento.cantidad_asistentes?.toLocaleString() || '0'}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Público registrado</p>
          </div>
        </div>

        {/* Card 2: Estado */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className={`p-2 sm:p-3 rounded-lg shrink-0 w-fit mx-auto sm:mx-0 ${
            estado === 'Sin cálculo' ? 'bg-rose-50 text-rose-600' : estado === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1 flex justify-center sm:justify-start">
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${estadoClases}`}>
                {estado}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">Progreso actual</p>
          </div>
        </div>

        {/* Card 3: Cálculo Activo */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 w-fit mx-auto sm:mx-0">
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cálculo activo</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">{evento.calculo_actual ? `v${evento.calculo_actual.version}` : '-'}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Historial de versión</p>
          </div>
        </div>

        {/* Card 4: Total de Emisiones */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 w-fit mx-auto sm:mx-0">
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Huella total</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
              {evento.calculo_actual ? `${Number(evento.calculo_actual.total).toFixed(2)}` : '-'}
              {evento.calculo_actual && <span className="text-[10px] font-medium text-gray-400 ml-1">CO2e</span>}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Emisión acumulada</p>
          </div>
        </div>
      </section>

      {/* Mappings moved to la sección de cálculo */}

      {evento.calculo_actual && (
        <section className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4 text-center md:text-left">Auditoría del cálculo activo</h2>

            {/* VISTA MÓVIL (Con pestañas) */}
            <div className="md:hidden space-y-6">
              <div className="flex p-1 bg-gray-100 border border-gray-200 rounded-xl">
                <button
                  onClick={() => setTabActiva('categoria')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                    tabActiva === 'categoria'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Por Categoría
                </button>
                <button
                  onClick={() => setTabActiva('origen')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                    tabActiva === 'origen'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Por Origen
                </button>
              </div>

              {tabActiva === 'categoria' ? (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="w-full">
                    <h3 className="text-sm font-semibold mb-3 text-center">Emisiones por categoría</h3>
                    <GraficoBarras datos={datosCategoria} />
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-sm font-semibold mb-3 text-center">Distribución por categoría</h3>
                    <GraficoTorta datos={datosCategoria} tamaño={200} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="w-full">
                    <h3 className="text-sm font-semibold mb-3 text-center">Emisiones por origen</h3>
                    <GraficoBarras datos={datosOrigen} />
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-sm font-semibold mb-3 text-center">Distribución por origen</h3>
                    <GraficoTorta datos={datosOrigen} tamaño={200} />
                  </div>
                </div>
              )}
            </div>

            {/* VISTA ESCRITORIO (Grid Completo) */}
            <div className="hidden md:block">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Emisiones por categoría</h3>
                  <GraficoBarras datos={datosCategoria} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Emisiones por origen</h3>
                  <GraficoBarras datos={datosOrigen} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold mb-3 w-full text-center">Distribución por categoría</h3>
                  <GraficoTorta datos={datosCategoria} tamaño={220} />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold mb-3 w-full text-center">Distribución por origen</h3>
                  <GraficoTorta datos={datosOrigen} tamaño={220} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-3 text-xs text-gray-600 border-t pt-4">
              <p className="break-all"><strong>Hash datos:</strong> {evento.hash_datos || '-'}</p>
              <p className="break-all"><strong>Hash resultado:</strong> {evento.hash_resultado || '-'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center lg:items-start text-center lg:text-left h-fit">
            <h2 className="font-semibold mb-3">QR público</h2>
            {publicUrl ? (
              <>
                <QRCodeSVG value={publicUrl} size={160} />
                <a href={`/public/${evento.public_slug}`} className="block mt-3 text-indigo-600 font-medium">Abrir página pública</a>
              </>
            ) : (
              <p className="text-sm text-gray-500">El QR se genera después del primer cálculo.</p>
            )}
          </div>
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Historial de cálculos</h2>
          {calculos.length === 0 ? <p className="text-sm text-gray-500">Todavía no hay cálculos.</p> : (
            <div className="space-y-2">
              {calculos.map(calculo => (
                <div
                  key={calculo.id}
                  onClick={() => navigate(`/eventos/${id}/calculos/${calculo.id}`)}
                  className="border rounded p-3 flex justify-between gap-3 cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Versión {calculo.version} {calculo.es_actual ? '(activo)' : ''}</p>
                    <p className="text-sm text-gray-600">{Number(calculo.total).toFixed(2)} kgCO2e - {calculo.estado}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!calculo.es_actual && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); manejarEliminarCalculo(calculo) }}
                        className="text-red-600 text-sm font-medium"
                      >Eliminar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Evidencias del evento</h2>
          <form onSubmit={manejarCrearEvidencia} className="grid gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dimensión asociada (auditoría)</label>
              <select 
                className="border border-gray-200 p-2 rounded-lg w-full bg-gray-50 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer" 
                value={dimensionSeleccionada} 
                onChange={e => setDimensionSeleccionada(e.target.value)} 
                required
              >
                <option value="">Seleccionar dimensión...</option>
                {dimensionesSeleccionables.map(dim => (
                  <option key={dim.id} value={dim.label}>
                    {dim.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Seleccionar Archivo (PDF, Word, Excel, CSV, JPG, PNG, WEBP, ZIP)</label>
              <input 
                id="file-upload-input"
                type="file" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.zip"
                onChange={manejarCambioArchivo}
                className="border border-gray-200 p-2 rounded-lg w-full bg-gray-50 text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de la evidencia</label>
              <input 
                className="border border-gray-200 p-2 rounded-lg w-full text-xs" 
                placeholder="Nombre de la evidencia (opcional, usa el del archivo por defecto)" 
                value={nombreEvidencia} 
                onChange={e => setNombreEvidencia(e.target.value)} 
              />
            </div>

            <p className="text-[10px] text-gray-400">La evidencia se guardará de forma segura en el servidor asociada a este evento.</p>
            <button 
              type="submit"
              disabled={subiendo} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm w-fit"
            >
              {subiendo ? 'Subiendo evidencia...' : 'Agregar evidencia'}
            </button>
          </form>

          {evidencias.length === 0 ? <p className="text-sm text-gray-500">No hay evidencias cargadas.</p> : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Archivos subidos</p>
              <ul className="space-y-2">
                {evidencias.map(item => {
                  const fullUrl = item.url.startsWith('/') ? `${API_BASE_URL}${item.url}` : item.url
                  return (
                    <li key={item.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[18px] select-none text-gray-400 shrink-0" aria-hidden="true">
                          {['png', 'jpg', 'jpeg', 'webp'].includes(item.tipo.toLowerCase()) ? '🖼️' : '📄'}
                        </span>
                        <div className="min-w-0">
                          <a className="font-bold text-indigo-600 hover:text-indigo-800 break-all" href={fullUrl} target="_blank" rel="noreferrer">
                            {item.filename}
                          </a>
                          <p className="text-gray-400 text-[10px] mt-0.5 uppercase font-bold tracking-wider">{item.tipo}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => manejarEliminarEvidencia(item.id)}
                        className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-lg border border-red-100 hover:border-red-600 transition-all duration-200 shadow-sm shrink-0 cursor-pointer"
                        title="Eliminar evidencia"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
