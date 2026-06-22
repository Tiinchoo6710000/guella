import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GraficoBarras from '../components/GraficoBarras'
import { obtenerCalculo, obtenerDetalleCalculo } from '../api/calculosApi'
import { obtenerEvidenciasEvento } from '../api/evidenciasApi'
import GraficoTorta from '../components/GraficoTorta'
import { obtenerEvento } from '../api/eventosApi'
import { agruparPorCampo } from '../utilidades/agruparCalculo'
import { obtenerTicketsEvento } from '../api/ticketsApi'

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

  if (cargando) return <p>Cargando detalle de cálculo...</p>
  if (!evento || !calculo) return <p>No se pudo cargar el detalle del cálculo.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Detalle de cálculo</h1>
          <p className="text-gray-600">Evento {evento.nombre} · Cálculo v{calculo.version}</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <button onClick={() => navigate(`/eventos/${id}`)} className="flex-1 sm:flex-initial border border-gray-200 text-gray-700 px-3 py-2 rounded text-center font-medium">Volver al evento</button>
          {publicUrl && (
            <a href={publicUrl} className="flex-1 sm:flex-initial bg-indigo-600 text-white px-3 py-2 rounded text-center font-medium">Ver público</a>
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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Versión</p>
          <p className="text-2xl font-bold">v{calculo.version}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{Number(calculo.total).toFixed(2)} kgCO2e</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Estado</p>
          <p className="text-2xl font-bold">{calculo.estado}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Activo</p>
          <p className="text-2xl font-bold">{calculo.es_actual ? 'Sí' : 'No'}</p>
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
