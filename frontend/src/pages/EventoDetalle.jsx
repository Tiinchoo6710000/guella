import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { eliminarCalculo, obtenerDetalleCalculo } from '../api/calculosApi'
import { crearEvidencia, obtenerEvidenciasEvento } from '../api/evidenciasApi'
import { eliminarEvento, obtenerCalculosEvento, obtenerEvento } from '../api/eventosApi'
import { obtenerInputsEvento } from '../api/inputsApi'
import GraficoBarras from '../components/GraficoBarras'
import GraficoTorta from '../components/GraficoTorta'
import { agruparPorCampo } from '../utilidades/agruparCalculo'

export default function PaginaEventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [calculos, setCalculos] = useState([])
  const [detalleActivo, setDetalleActivo] = useState([])
  const [evidencias, setEvidencias] = useState([])
  const [inputs, setInputs] = useState([])
  const [evidencia, setEvidencia] = useState({ filename: '', url: '', tipo: 'pdf' })
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async function cargar() {
    try {
      const [rEvento, rCalculos, rEvidencias, rInputs] = await Promise.all([
        obtenerEvento(id),
        obtenerCalculosEvento(id),
        obtenerEvidenciasEvento(id),
        obtenerInputsEvento(id)
      ])

      setEvento(rEvento.data)
      setCalculos(rCalculos.data || [])
      setEvidencias(rEvidencias.data || [])
      setInputs(rInputs.data || [])

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

  async function manejarCrearEvidencia(e) {
    e.preventDefault()

    if (!evento?.calculo_actual?.id) {
      alert('Primero debes generar un cálculo activo para asociar la evidencia')
      return
    }

    try {
      await crearEvidencia({
        evento_id: Number(id),
        calculo_id: evento.calculo_actual.id,
        filename: evidencia.filename,
        url: evidencia.url,
        tipo: evidencia.tipo
      })
      setEvidencia({ filename: '', url: '', tipo: 'pdf' })
      await cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creando evidencia')
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
    if (!confirm('¿Eliminar este evento y toda su información?')) return
    await eliminarEvento(id)
    navigate('/eventos')
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

  if (cargando) return <p>Cargando evento...</p>
  if (!evento) return <p>No se pudo cargar el evento.</p>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">{evento.nombre}</h1>
          <p className="text-gray-600">{evento.fecha} - {evento.ciudad}, {evento.region}, {evento.pais}</p>
        </div>
        <div className="flex gap-2">
            <Link to={`/eventos/${id}/calculo`} className="bg-indigo-600 text-white px-3 py-2 rounded">Calcular</Link>
          <button onClick={manejarEliminarEvento} className="border border-red-200 text-red-700 px-3 py-2 rounded">Eliminar evento</button>
        </div>
      </div>

      <section className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Asistentes</p>
          <p className="text-2xl font-bold">{evento.cantidad_asistentes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Estado</p>
          <p className={`text-2xl font-bold inline-flex items-center gap-2 ${estadoClases}`}>{estado}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Cálculo activo</p>
          <p className="text-2xl font-bold">{evento.calculo_actual ? `v${evento.calculo_actual.version}` : '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{evento.calculo_actual ? `${Number(evento.calculo_actual.total).toFixed(2)} kgCO2e` : '-'}</p>
        </div>
      </section>

      {/* Mappings moved to la sección de cálculo */}

      {evento.calculo_actual && (
        <section className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4">Auditoría del cálculo activo</h2>
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
              <p className="break-all"><strong>Hash datos:</strong> {evento.hash_datos || '-'}</p>
              <p className="break-all"><strong>Hash resultado:</strong> {evento.hash_resultado || '-'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
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
          <h2 className="font-semibold mb-3">Evidencias</h2>
          <form onSubmit={manejarCrearEvidencia} className="grid gap-2 mb-4">
            <input className="border p-2 rounded" placeholder="Nombre del archivo o evidencia" value={evidencia.filename} onChange={e => setEvidencia({ ...evidencia, filename: e.target.value })} required />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de factor/emisión (auditoría)</label>
              <select className="border p-2 rounded w-full" value={evidencia.url} onChange={e => setEvidencia({ ...evidencia, url: e.target.value })} required>
                <option value="">Seleccionar factor...</option>
                {inputs.map(inp => (
                  <option key={`${inp.categoria}-${inp.subcategoria}`} value={`${inp.categoria} - ${inp.subcategoria}`}>
                    {inp.categoria} - {inp.subcategoria}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de archivo</label>
              <select className="border p-2 rounded w-full" value={evidencia.tipo} onChange={e => setEvidencia({ ...evidencia, tipo: e.target.value })}>
                <optgroup label="📄 Documentos">
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="doc">Word (.doc, .docx)</option>
                  <option value="xls">Excel (.xls, .xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                </optgroup>
                <optgroup label="🖼️ Imágenes">
                  <option value="jpg">JPG (.jpg, .jpeg)</option>
                  <option value="png">PNG (.png)</option>
                  <option value="webp">WEBP (.webp)</option>
                </optgroup>
                <optgroup label="📦 Comprimidos">
                  <option value="zip">ZIP (.zip)</option>
                </optgroup>
              </select>
            </div>
            <p className="text-xs text-gray-500">Se asociará esta evidencia al cálculo activo.</p>
            <button disabled={!evento?.calculo_actual} className="bg-emerald-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">Agregar evidencia</button>
          </form>
          {evidencias.length === 0 ? <p className="text-sm text-gray-500">No hay evidencias cargadas.</p> : (
            <ul className="space-y-2">
              {evidencias.map(item => (
                <li key={item.id} className="border rounded p-2 text-sm">
                  <a className="font-medium text-indigo-600" href={item.url} target="_blank" rel="noreferrer">{item.filename}</a>
                  <p className="text-gray-500">{item.tipo}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
