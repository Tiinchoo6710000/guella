import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GraficoBarras from '../components/GraficoBarras'
import { obtenerCalculo, obtenerDetalleCalculo } from '../api/calculosApi'
import { obtenerEvidenciasEvento } from '../api/evidenciasApi'
import GraficoTorta from '../components/GraficoTorta'
import { obtenerEvento } from '../api/eventosApi'
import { agruparPorCampo } from '../utilidades/agruparCalculo'

export default function PaginaDetalleCalculoHistorico() {
  const { id, calculoId } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [calculo, setCalculo] = useState(null)
  const [detalle, setDetalle] = useState([])
  const [evidencias, setEvidencias] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async function cargar() {
    try {
      const [rEvento, rCalculo, rDetalle, rEvidencias] = await Promise.all([
        obtenerEvento(id),
        obtenerCalculo(calculoId),
        obtenerDetalleCalculo(calculoId),
        obtenerEvidenciasEvento(id)
      ])

      setEvento(rEvento.data)
      setCalculo(rCalculo.data)
      setDetalle(rDetalle.data || [])
      setEvidencias(rEvidencias.data || [])
    } catch {
      setEvento(null)
      setCalculo(null)
      setDetalle([])
      setEvidencias([])
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

  const publicUrl = evento?.public_slug ? `${window.location.origin}/public/${evento.public_slug}` : null

  if (cargando) return <p>Cargando detalle de cálculo...</p>
  if (!evento || !calculo) return <p>No se pudo cargar el detalle del cálculo.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Detalle de cálculo</h1>
          <p className="text-gray-600">Evento {evento.nombre} · Cálculo v{calculo.version}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/eventos/${id}`)} className="border border-gray-200 text-gray-700 px-3 py-2 rounded">Volver al evento</button>
          {publicUrl && (
            <a href={publicUrl} className="bg-indigo-600 text-white px-3 py-2 rounded">Ver público</a>
          )}
        </div>
      </div>

      <section className="grid md:grid-cols-4 gap-4">
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

      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-4">Auditoría del cálculo</h2>
          <div className="grid md:grid-cols-2 gap-9">
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
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribución por categoría</h3>
              <GraficoTorta datos={datosCategoria} tamaño={220} />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribución por origen</h3>
              <GraficoTorta datos={datosOrigen} tamaño={220} />
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-3 text-xs text-gray-600">
            <p className="break-all"><strong>Hash datos:</strong> {calculo.hash_datos || '-'}</p>
            <p className="break-all"><strong>Hash resultado:</strong> {calculo.hash_resultado || '-'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Resumen del evento</h2>
          <p className="text-sm text-gray-500">{evento.fecha} · {evento.ciudad}, {evento.region}</p>
          <p className="mt-3 text-sm text-gray-600">Asistentes: {evento.cantidad_asistentes}</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Aportes</h2>
          {inputs.length === 0 ? <p className="text-sm text-gray-500">No hay inputs asociados a este cálculo.</p> : (
            <div className="space-y-3">
              {inputs.map(item => (
                <div key={item.id} className="border rounded p-3">
                  <p className="font-medium">{item.subtipo || 'Sin subtipo'}</p>
                  <p className="text-sm text-gray-600">Valor: {item.input_valor} {item.input_unidad}</p>
                  <p className="text-sm text-gray-600">Dimension: {item.factor_valor} {item.factor_unidad}</p>
                  <p className="text-sm text-gray-600">Emisiones: {Number(item.emisiones).toFixed(2)} kgCO2e</p>
                  {item.comentario && (
                    <p className="text-sm text-gray-600">Comentario: {item.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Logistica</h2>
          {movilidades.length === 0 ? <p className="text-sm text-gray-500">No hay movilidad de empleados en este cálculo.</p> : (
            <div className="space-y-3">
              {movilidades.map(item => (
                <div key={item.id} className="border rounded p-3">
                  <p className="font-medium">{item.subtipo || 'Movilidad'}</p>
                  <p className="text-sm text-gray-600">Distancia: {item.input_valor} {item.input_unidad}</p>
                  <p className="text-sm text-gray-600">Personas: {item.cantidad_empleados || '-'}</p>
                  <p className="text-sm text-gray-600">Dimension: {item.factor_valor} {item.factor_unidad}</p>
                  {item.comentario && (
                    <p className="text-sm text-gray-600">Comentario: {item.comentario}</p>
                  )}
                  <p className="text-sm text-gray-600">Emisiones: {Number(item.emisiones).toFixed(2)} kgCO2e</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="font-semibold mb-3">Tickets</h2>
          {tickets.length === 0 ? <p className="text-sm text-gray-500">No hay tickets asociados a este cálculo.</p> : (
            <div className="space-y-3">
              {tickets.map(item => (
                <div key={item.id} className="border rounded p-3">
                  <p className="font-medium">{item.subtipo || 'Ticket'}</p>
                  <p className="text-sm text-gray-600">Valor: {item.input_valor} {item.input_unidad}</p>
                  <p className="text-sm text-gray-600">Emisiones: {Number(item.emisiones).toFixed(2)} kgCO2e</p>
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
