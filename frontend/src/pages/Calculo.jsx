import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { crearCalculo } from '../api/calculosApi'
import { obtenerFactores } from '../api/factoresApi'
import { obtenerMappings } from '../api/ticketFactorMappingsApi'
import { crearInput, eliminarInput, obtenerInputsEvento } from '../api/inputsApi'
import { crearMovilidad, eliminarMovilidad, obtenerMovilidadEvento } from '../api/movilidadApi'
import { obtenerTicketsEvento } from '../api/ticketsApi'
import { obtenerEvento } from '../api/eventosApi'
import ChecklistInput from '../components/ChecklistInput'
import FormularioInput from '../components/FormularioInput'
import FormularioMovilidad from '../components/FormularioMovilidad'

const TRANSPORTES_MOVILIDAD = ['auto', 'moto', 'bici', 'bus', 'tren', 'avion', 'caminata']

function mensajeError(error) {
  return error?.response?.data?.detail || error?.message || 'Error desconocido'
}

async function cargarRecurso(nombre, peticion, asignar) {
  try {
    const respuesta = await peticion()
    asignar(respuesta)
    return null
  } catch (error) {
    console.error(`Error al cargar ${nombre}:`, error)
    return `${nombre}: ${mensajeError(error)}`
  }
}

export default function PaginaCalculo() {
  const { id } = useParams()
  const [evento, setEvento] = useState(null)
  const [inputs, setInputs] = useState([])
  const [factores, setFactores] = useState([])
  const [tickets, setTickets] = useState([])
  const [movilidad, setMovilidad] = useState([])
  const [mappings, setMappings] = useState([])
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorEvento, setErrorEvento] = useState(null)
  const [erroresParciales, setErroresParciales] = useState([])

  const dimensionesInputs = useMemo(
    () => factores.filter(f => f.categoria?.toLowerCase() !== 'movilidad'),
    [factores]
  )

  const mappingsVisibles = useMemo(() => {
    const porSubtipo = new Map(mappings.map(m => [m.subtipo, m]))
    return TRANSPORTES_MOVILIDAD.map(subtipo => porSubtipo.get(subtipo) || {
      subtipo,
      factor_id: null,
      factor_fuente: null
    })
  }, [mappings])

  const cargarDatos = useCallback(async function cargarDatos(opciones = {}) {
    const silencioso = opciones.silencioso === true
    if (!silencioso) {
      setCargando(true)
    }

    setErrorEvento(null)
    setErroresParciales([])

    const errores = []

    try {
      const rEvento = await obtenerEvento(id)
      setEvento(rEvento.data || null)
    } catch (error) {
      console.error('Error al cargar evento:', error)
      setEvento(null)
      setErrorEvento(mensajeError(error))
      if (!silencioso) setCargando(false)
      return
    }

    const resultados = await Promise.all([
      cargarRecurso('inputs', () => obtenerInputsEvento(id), r => setInputs(r.data || [])),
      cargarRecurso('dimensiones', () => obtenerFactores(id), r => setFactores(r.data || [])),
      cargarRecurso('tickets', () => obtenerTicketsEvento(id), r => setTickets(r.data || [])),
      cargarRecurso('movilidad empleados', () => obtenerMovilidadEvento(id), r => setMovilidad(r.data || [])),
      cargarRecurso('mappings de movilidad', () => obtenerMappings(id, 'general'), r => {
        setMappings(r.data?.mappings || [])
      })
    ])

    const parciales = resultados.filter(Boolean)
    if (parciales.length > 0) {
      setErroresParciales(parciales)
    }

    if (!silencioso) setCargando(false)
  }, [id])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  useEffect(() => {
    function refrescarAlVolver() {
      if (document.visibilityState === 'visible') {
        cargarDatos({ silencioso: true })
      }
    }

    window.addEventListener('focus', refrescarAlVolver)
    document.addEventListener('visibilitychange', refrescarAlVolver)
    return () => {
      window.removeEventListener('focus', refrescarAlVolver)
      document.removeEventListener('visibilitychange', refrescarAlVolver)
    }
  }, [cargarDatos])

  async function manejarCrearInput(payload) {
    await crearInput(payload)
    await cargarDatos({ silencioso: true })
  }

  async function manejarCrearMovilidad(payload) {
    await crearMovilidad(payload)
    await cargarDatos({ silencioso: true })
  }

  async function manejarEliminarInput(inputId) {
    await eliminarInput(inputId)
    await cargarDatos({ silencioso: true })
  }

  async function manejarEliminarMovilidad(movilidadId) {
    await eliminarMovilidad(movilidadId)
    await cargarDatos({ silencioso: true })
  }

  async function manejarCalcular() {
    try {
      const res = await crearCalculo(id)
      setResultado(res.data)
      await cargarDatos({ silencioso: true })
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al calcular')
    }
  }

  function mappingCompleto() {
    return TRANSPORTES_MOVILIDAD.every(subtipo => {
      const map = mappingsVisibles.find(m => m.subtipo === subtipo)
      return map?.factor_id != null
    })
  }

  function transportesFaltantes() {
    return TRANSPORTES_MOVILIDAD.filter(subtipo => {
      const map = mappingsVisibles.find(m => m.subtipo === subtipo)
      return !map || map.factor_id == null
    })
  }

  const publicUrl = resultado?.public_slug
    ? `${window.location.origin}/public/${resultado.public_slug}`
    : null

  if (errorEvento) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800">
          <p className="font-bold">No se pudo cargar el evento</p>
          <p className="text-sm mt-1">{errorEvento}</p>
        </div>
        <Link to="/eventos" className="inline-block mt-4 text-indigo-600 font-medium">Volver a eventos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Calcular evento</h1>
          <p className="text-sm text-gray-600">
            {evento?.nombre ? `${evento.nombre} · Región: ${evento.region}` : 'Carga datos, verifica la lista y calcula el resultado en kgCO2e.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => cargarDatos()}
            className="w-full sm:w-auto text-center text-sm border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 font-medium"
          >
            Actualizar listas
          </button>
          <Link to={`/eventos/${id}`} className="w-full sm:w-auto text-center text-indigo-600 font-medium border border-transparent px-3 py-2">Volver al evento</Link>
        </div>
      </div>

      {erroresParciales.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded text-amber-900">
          <p className="font-bold">Algunos datos no se pudieron cargar</p>
          <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
            {erroresParciales.map(error => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      {cargando ? <p>Cargando datos...</p> : (
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="space-y-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h2 className="font-semibold mb-2">Dimensiones de movilidad</h2>
              <p className="text-sm text-gray-600 mb-4">
                Asignadas automáticamente según la región del evento ({evento?.region}).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mappingsVisibles.map(m => (
                  <div key={m.subtipo} className={`p-2 rounded border text-xs ${m.factor_id ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="font-bold uppercase">{m.subtipo}</div>
                    <div className="truncate">{m.factor_fuente || 'No encontrada'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Agregar datos de emisiones (Dimensiones)</h2>
              {dimensionesInputs.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
                  <p className="font-semibold">No hay dimensiones de input para la región {evento?.region}.</p>
                  <p className="mt-1">Cargá dimensiones en la sección Dimensiones usando exactamente la misma región que el evento.</p>
                </div>
              ) : (
                <FormularioInput dimensiones={dimensionesInputs} onCreado={manejarCrearInput} eventoId={id} evento={evento} />
              )}
            </div>

            <div>
              <h2 className="font-semibold mb-2">Lista verificable de inputs</h2>
              {inputs.length === 0 ? <p className="text-sm text-gray-500">No hay inputs cargados.</p> : (
                <div className="grid grid-cols-2 gap-3">
                  {inputs.map(input => (
                    <div key={input.id} className="flex items-start sm:items-center justify-between gap-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50 shadow-sm">
                      <div className="flex-1 min-w-0"><ChecklistInput input={input} /></div>
                      <button onClick={() => manejarEliminarInput(input.id)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-semibold shrink-0 self-start sm:self-auto bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 transition-colors">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold mb-2">Movilidad Logistica</h2>
              <FormularioMovilidad onCreado={manejarCrearMovilidad} eventoId={id} />
              {movilidad.length === 0 ? <p className="mt-2 text-sm text-gray-500">No hay movilidad registrada.</p> : (
                <ul className="mt-3 space-y-2">
                  {movilidad.map(item => {
                    const esReal = item.tipo_fuente === 'real' || item.tipo_fuente === 'verificado'
                    return (
                      <li key={item.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold capitalize text-sm text-gray-900">{item.transporte}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">{item.distancia} km</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-600">{item.cantidad_empleados} {item.cantidad_empleados === 1 ? 'persona' : 'personas'}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${esReal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {esReal ? 'Verificado' : 'Estimado'}
                            </span>
                          </div>
                          {item.comentario && (
                            <p className="text-xs text-gray-400 italic mt-1 truncate" title={item.comentario}>
                              "{item.comentario}"
                            </p>
                          )}
                        </div>
                        <button onClick={() => manejarEliminarMovilidad(item.id)} className="text-red-600 text-sm font-medium shrink-0">Eliminar</button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h2 className="font-semibold mb-2">Tickets recibidos por webhook</h2>
              {tickets.length === 0 ? <p className="text-sm text-gray-500">No hay tickets cargados.</p> : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-2.5 bg-gray-50/50 shadow-sm flex flex-col justify-center">
                      <strong className="text-gray-900">{ticket.ticket_id}</strong>
                      <span className="text-xs text-gray-500 mt-1">{ticket.movilidades?.length || 0} movilidades</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h2 className="font-semibold mb-2">Confirmación</h2>
              <p className="text-sm text-gray-600 mb-4">El cálculo toma inputs actuales, movilidad empleados y todos los tickets recibidos.</p>
              <button onClick={manejarCalcular} className="w-full bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400" disabled={!mappingCompleto()}>Calcular</button>
              {!mappingCompleto() && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
                  <p className="font-semibold">Faltan factores de movilidad para la región.</p>
                  <p className="mt-1">El sistema no puede calcular el evento porque no existen dimensiones de movilidad en la base de datos para la región <strong>{evento?.region}</strong>.</p>
                  <p className="mt-2 font-medium">Carga dimensiones para: {transportesFaltantes().join(', ')}</p>
                </div>
              )}
            </div>

            {resultado && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold">Resultado activo</h3>
                <p className="text-3xl font-bold mt-2">{Number(resultado.total).toFixed(2)} kgCO2e</p>
                <p className="text-sm text-gray-600">Versión {resultado.version} - {resultado.estado}</p>
                {publicUrl && (
                  <div className="mt-4">
                    <QRCodeSVG value={publicUrl} size={132} />
                    <a className="block mt-2 text-indigo-600 font-medium" href={`/public/${resultado.public_slug}`}>Abrir página pública</a>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
