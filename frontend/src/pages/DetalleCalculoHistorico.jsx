import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GraficoBarras from '../components/GraficoBarras'
import { obtenerCalculo, obtenerDetalleCalculo } from '../api/calculosApi'
import { obtenerEvidenciasEvento } from '../api/evidenciasApi'
import GraficoTorta from '../components/GraficoTorta'
import { obtenerEvento } from '../api/eventosApi'
import { agruparPorCampo } from '../utilidades/agruparCalculo'
import { obtenerTicketsEvento } from '../api/ticketsApi'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PaginaDetalleCalculoHistorico() {
  const { id, calculoId } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [calculo, setCalculo] = useState(null)
  const [detalle, setDetalle] = useState([])
  const [evidencias, setEvidencias] = useState([])
  const [ticketsData, setTicketsData] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tabActiva, setTabActiva] = useState('categoria')

  const cargar = useCallback(async function cargar() {
    try {
      const [rEvento, rCalculo, rDetalle, rEvidencias, rTickets] = await Promise.all([
        obtenerEvento(id),
        obtenerCalculo(calculoId),
        obtenerDetalleCalculo(calculoId),
        obtenerEvidenciasEvento(id),
        obtenerTicketsEvento(id)
      ])

      setEvento(rEvento.data)
      setCalculo(rCalculo.data)
      setDetalle(rDetalle.data || [])
      setEvidencias(rEvidencias.data || [])
      setTicketsData(rTickets.data || [])
    } catch {
      setEvento(null)
      setCalculo(null)
      setDetalle([])
      setEvidencias([])
      setTicketsData([])
    } finally {
      setCargando(false)
    }
  }, [id, calculoId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const evidenciasFiltradas = useMemo(
    () => evidencias.filter((item) => item.calculo_id === Number(calculoId)),
    [evidencias, calculoId]
  )

  const datosCategoria = useMemo(() => agruparPorCampo(detalle, 'categoria'), [detalle])
  const datosOrigen = useMemo(() => agruparPorCampo(detalle, 'origen'), [detalle])

  const inputs = detalle.filter((item) => item.origen === 'input')
  const movilidades = detalle.filter((item) => item.origen === 'movilidad_empleado')
  const tickets = detalle.filter((item) => item.origen === 'ticket')

  const ticketsAgrupados = useMemo(() => {
    const mapa = {}
    tickets.forEach(item => {
      const key = item.input_id || 'sin_id'
      if (!mapa[key]) {
        const tInfo = ticketsData.find(t => t.id === item.input_id)
        mapa[key] = {
          ticket_id: tInfo ? tInfo.ticket_id : (item.input_id ? `Ticket #${item.input_id}` : 'Ticket sin ID'),
          movilidades: [],
          totalEmisiones: 0
        }
      }
      mapa[key].movilidades.push(item)
      mapa[key].totalEmisiones += Number(item.emisiones || 0)
    })
    return Object.values(mapa)
  }, [tickets, ticketsData])

  const publicUrl = evento?.public_slug ? `${window.location.origin}/public/${evento.public_slug}` : null

  if (cargando) return <LoadingSpinner mensaje="Cargando historial de cálculo..." fullscreen />
  if (!evento || !calculo) return <p className="text-center p-8 text-gray-500 font-medium">No se pudo cargar el detalle del cálculo.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb de navegación */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <Link to="/eventos" className="hover:text-indigo-600 transition-colors">Eventos</Link>
        <span className="text-gray-300">/</span>
        <Link to={`/eventos/${id}`} className="hover:text-indigo-600 transition-colors">{evento.nombre}</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500">Cálculo v{calculo.version}</span>
      </div>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">Detalle de cálculo</h1>
          <p className="text-sm text-gray-500">
            Historial de cálculos de <span className="font-semibold text-gray-700">{evento.nombre}</span>
          </p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <button
            onClick={() => navigate(`/eventos/${id}`)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al evento</span>
          </button>
          {publicUrl && (
            <a
              href={publicUrl}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Ver público</span>
            </a>
          )}
        </div>
      </div>

      {/* Resumen del evento como barra horizontal descriptiva */}
      <div className="bg-white p-3 sm:px-4 sm:py-3 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Resumen
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span>{evento.fecha}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>{evento.ciudad}, {evento.region}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>👥</span>
            <span className="font-medium text-gray-800">{evento.cantidad_asistentes?.toLocaleString()} asistentes</span>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Versión */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 w-fit mx-auto sm:mx-0">
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Versión</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">v{calculo.version}</p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Historial de versión</p>
          </div>
        </div>

        {/* Card 2: Total */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 w-fit mx-auto sm:mx-0">
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Huella total</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
              {Number(calculo.total).toFixed(2)}
              <span className="text-[10px] font-medium text-gray-400 ml-1">CO2e</span>
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Emisión calculada</p>
          </div>
        </div>

        {/* Card 3: Estado */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className={`p-2 sm:p-3 rounded-lg shrink-0 w-fit mx-auto sm:mx-0 ${
            calculo.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1 flex justify-center sm:justify-start">
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                calculo.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {calculo.estado}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">Progreso actual</p>
          </div>
        </div>

        {/* Card 4: Activo */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center sm:flex-row sm:items-center sm:text-left gap-2 sm:gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-200">
          <div className={`p-2 sm:p-3 rounded-lg shrink-0 w-fit mx-auto sm:mx-0 ${
            calculo.es_actual ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
          }`}>
            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activo</p>
            <div className="mt-1 flex justify-center sm:justify-start">
              <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                calculo.es_actual ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {calculo.es_actual ? 'Sí (Activo)' : 'No (Histórico)'}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">Cálculo de referencia</p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-4 text-center md:text-left">Auditoría del cálculo</h2>

          {/* VISTA MÓVIL (Con pestañas) */}
          <div className="md:hidden space-y-6">
            <div className="flex p-1 bg-gray-100 border border-gray-200 rounded-xl">
              <button
                onClick={() => setTabActiva('categoria')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${tabActiva === 'categoria'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Por Categoría
              </button>
              <button
                onClick={() => setTabActiva('origen')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${tabActiva === 'origen'
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
            <div className="grid lg:grid-cols-2 gap-9">
              <div>
                <h3 className="text-sm font-semibold mb-3">Emisiones por categoría</h3>
                <GraficoBarras datos={datosCategoria} />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Emisiones por origen</h3>
                <GraficoBarras datos={datosOrigen} />
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
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
            <p className="break-all"><strong>Hash datos:</strong> {calculo.hash_datos || '-'}</p>
            <p className="break-all"><strong>Hash resultado:</strong> {calculo.hash_resultado || '-'}</p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Aportes</h2>
          {inputs.length === 0 ? <p className="text-sm text-gray-500">No hay inputs asociados a este cálculo.</p> : (
            <div className="grid grid-cols-2 gap-2.5">
              {inputs.map(item => (
                <div key={item.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-2.5 text-[10px] sm:text-xs space-y-1 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 capitalize text-xs break-words" title={item.subtipo}>{item.subtipo || 'Sin subtipo'}</p>
                    <p className="text-gray-500">Valor: <span className="font-medium text-gray-700">{item.input_valor} {item.input_unidad}</span></p>
                    <p className="text-gray-500">Dimensión: <span className="font-medium text-gray-700">{item.factor_valor} {item.factor_unidad}</span></p>
                    <p className="text-gray-400 break-words" title={item.factor_fuente}>Fuente: {item.factor_fuente || '-'}</p>
                    <p className="text-gray-400">Versión: {item.factor_version || '-'}</p>
                  </div>
                  <div className="border-t border-gray-200/60 pt-1 mt-1 text-[11px] font-semibold text-emerald-700">
                    {Number(item.emisiones).toFixed(2)} kgCO2e
                  </div>
                  {item.comentario && (
                    <p className="text-[9px] text-gray-400 italic break-words mt-1 border-t border-dashed border-gray-200 pt-1">"{item.comentario}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Logística</h2>
          {movilidades.length === 0 ? <p className="text-sm text-gray-500">No hay movilidad de empleados en este cálculo.</p> : (
            <div className="grid grid-cols-2 gap-2.5">
              {movilidades.map(item => (
                <div key={item.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-2.5 text-[10px] sm:text-xs space-y-1 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 capitalize text-xs break-words" title={item.subtipo}>{item.subtipo || 'Movilidad'}</p>
                    <p className="text-gray-500">Distancia: <span className="font-medium text-gray-700">{item.input_valor} {item.input_unidad}</span></p>
                    <p className="text-gray-500">Personas: <span className="font-medium text-gray-700">{item.cantidad_empleados || '-'}</span></p>
                    <p className="text-gray-500">Dimensión: <span className="font-medium text-gray-700">{item.factor_valor} {item.factor_unidad}</span></p>
                    <p className="text-gray-400 break-words" title={item.factor_fuente}>Fuente: {item.factor_fuente || '-'}</p>
                    <p className="text-gray-400">Versión: {item.factor_version || '-'}</p>
                  </div>
                  <div className="border-t border-gray-200/60 pt-1 mt-1 text-[11px] font-semibold text-emerald-700">
                    {Number(item.emisiones).toFixed(2)} kgCO2e
                  </div>
                  {item.comentario && (
                    <p className="text-[9px] text-gray-400 italic break-words mt-1 border-t border-dashed border-gray-200 pt-1">"{item.comentario}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Tickets</h2>
          {ticketsAgrupados.length === 0 ? <p className="text-sm text-gray-500">No hay tickets asociados a este cálculo.</p> : (
            <div className="space-y-4">
              {ticketsAgrupados.map(ticketGroup => (
                <div key={ticketGroup.ticket_id} className="border rounded-xl p-3.5 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">Ticket: {ticketGroup.ticket_id}</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Total: {ticketGroup.totalEmisiones.toFixed(2)} kgCO2e
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {ticketGroup.movilidades.map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm text-[10px] sm:text-xs space-y-0.5 min-w-0">
                        <p className="font-bold text-gray-800 capitalize break-words" title={item.subtipo}>{item.subtipo || 'Movilidad'}</p>
                        <p className="text-gray-500">Valor: {item.input_valor} {item.input_unidad}</p>
                        <p className="text-gray-500">Dimensión: {item.factor_valor} {item.factor_unidad}</p>
                        <p className="text-gray-400 break-words" title={item.factor_fuente}>Fuente: {item.factor_fuente || '-'}</p>
                        <p className="text-gray-400">Versión: {item.factor_version || '-'}</p>
                        <p className="font-semibold text-emerald-700 border-t border-gray-100 pt-1 mt-1">
                          {Number(item.emisiones).toFixed(2)} kgCO2e
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Evidencias</h2>
          {evidenciasFiltradas.length === 0 ? <p className="text-sm text-gray-500">No hay evidencias asociadas a este cálculo.</p> : (
            <ul className="space-y-3">
              {evidenciasFiltradas.map(item => (
                <li key={item.id} className="border rounded p-3">
                  <a className="font-medium text-indigo-600" href={item.url} target="_blank" rel="noreferrer">{item.filename}</a>
                  <p className="text-sm text-gray-500">Tipo: {item.tipo}</p>
                  <p className="text-sm text-gray-500">Creado: {new Date(item.creado_en).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
