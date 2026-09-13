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
import LoadingSpinner from '../components/LoadingSpinner'

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
  const [compartiendo, setCompartiendo] = useState(false)
  const [mensajeCompartido, setMensajeCompartido] = useState('')

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

  async function manejarCompartirQR() {
    const svg = document.getElementById('qr-code-calculo-svg')
    if (!svg || !publicUrl) return

    setCompartiendo(true)
    setMensajeCompartido('')

    try {
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const qrSize = 500
          const padding = 40
          const canvas = document.createElement('canvas')
          canvas.width = qrSize + padding * 2
          canvas.height = qrSize + padding * 2 + 100
          const ctx = canvas.getContext('2d')

          // Fondo blanco
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Dibujar QR
          ctx.drawImage(img, padding, padding, qrSize, qrSize)

          // Texto del Evento
          ctx.fillStyle = '#0f172a'
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'center'
          const nombreEvento = evento?.nombre || 'Evento'
          const textoCorto = nombreEvento.length > 35 ? nombreEvento.slice(0, 32) + '...' : nombreEvento
          ctx.fillText(textoCorto, canvas.width / 2, qrSize + padding + 40)

          // Subtítulo
          ctx.fillStyle = '#64748b'
          ctx.font = '16px system-ui, -apple-system, sans-serif'
          ctx.fillText('Huella de carbono verificada • Güella', canvas.width / 2, qrSize + padding + 70)

          URL.revokeObjectURL(svgUrl)

          canvas.toBlob(async (blob) => {
            if (!blob) {
              setCompartiendo(false)
              return
            }

            const fileName = `QR_${(evento?.nombre || 'evento').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
            const file = new File([blob], fileName, { type: 'image/png' })

            let compartidoExitoso = false

            // 1. Intentar Web Share API con archivo
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: `QR Huella de carbono - ${evento?.nombre || 'Evento'}`,
                  text: `Mirá la huella de carbono de ${evento?.nombre || 'Evento'}:`,
                  url: publicUrl,
                  files: [file]
                })
                compartidoExitoso = true
                setMensajeCompartido('¡QR compartido con éxito!')
              } catch (err) {
                if (err.name === 'AbortError') {
                  setCompartiendo(false)
                  return
                }
              }
            } else if (navigator.share) {
              // 2. Intentar Web Share API solo URL
              try {
                await navigator.share({
                  title: `QR Huella de carbono - ${evento?.nombre || 'Evento'}`,
                  text: `Mirá la huella de carbono de ${evento?.nombre || 'Evento'}:`,
                  url: publicUrl
                })
                compartidoExitoso = true
                setMensajeCompartido('¡Enlace compartido!')
              } catch (err) {
                if (err.name === 'AbortError') {
                  setCompartiendo(false)
                  return
                }
              }
            }

            // Si no se compartió por Share API (ej. desktop), descargar imagen y copiar enlace
            if (!compartidoExitoso) {
              const downloadUrl = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = downloadUrl
              link.download = fileName
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(downloadUrl)

              if (navigator.clipboard) {
                try {
                  await navigator.clipboard.writeText(publicUrl)
                  setMensajeCompartido('¡QR descargado y enlace copiado al portapapeles!')
                } catch {
                  setMensajeCompartido('¡QR descargado exitosamente!')
                }
              } else {
                setMensajeCompartido('¡QR descargado exitosamente!')
              }
            }

            setTimeout(() => {
              setMensajeCompartido('')
            }, 4000)
            setCompartiendo(false)
          }, 'image/png')
        } catch (err) {
          console.error('Error generando imagen QR:', err)
          setCompartiendo(false)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        setCompartiendo(false)
        alert('Error procesando el código QR')
      }

      img.src = svgUrl
    } catch (err) {
      console.error('Error al compartir QR:', err)
      setCompartiendo(false)
    }
  }

  if (errorEvento) {
    return (
      <div className="w-full">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800">
          <p className="font-bold">No se pudo cargar el evento</p>
          <p className="text-sm mt-1">{errorEvento}</p>
        </div>
        <Link to="/eventos" className="inline-block mt-4 text-indigo-600 font-medium">Volver a eventos</Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-white border border-gray-150 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-1.5 inline-block">Cálculo de Emisiones</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Calcular evento</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {evento?.nombre ? (
              <span>Evento: <strong className="text-gray-800">{evento.nombre}</strong> · Región: <strong className="text-gray-800">{evento.region}</strong></span>
            ) : (
              'Carga datos, verifica la lista y calcula el resultado en kgCO2e.'
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 w-full md:flex md:w-auto md:gap-3">
          <button
            type="button"
            onClick={() => cargarDatos()}
            className="w-full md:w-auto text-center text-xs sm:text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            Actualizar listas
          </button>
          <Link
            to={`/eventos/${id}`}
            className="w-full md:w-auto text-center text-xs sm:text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 active:scale-95 flex items-center justify-center"
          >
            Volver al evento
          </Link>
        </div>
      </div>

      {erroresParciales.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-sm">
          <p className="font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Algunos datos no se pudieron cargar
          </p>
          <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
            {erroresParciales.map(error => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      {cargando ? <LoadingSpinner mensaje="Cargando datos de cálculo..." /> : (
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 sm:gap-8">
          <section className="space-y-6 sm:space-y-8">
            {/* Dimensiones de movilidad */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-sm w-full">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Dimensiones de movilidad</h2>
              <p className="text-xs text-gray-500 mb-4">
                Asignadas automáticamente según la región del evento ({evento?.region}).
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                {mappingsVisibles.map(m => (
                  <div key={m.subtipo} className={`p-3 rounded-xl border text-xs transition-all w-full ${m.factor_id ? 'bg-emerald-50/60 border-emerald-150 text-emerald-950 shadow-sm' : 'bg-rose-50/60 border-rose-150 text-rose-950'}`}>
                    <div className="font-bold uppercase tracking-wider mb-1">{m.subtipo}</div>
                    <div className="truncate text-[11px] opacity-80" title={m.factor_fuente}>{m.factor_fuente || 'No encontrada'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agregar datos */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Agregar datos de emisiones (Dimensiones)</h2>
              {dimensionesInputs.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900 shadow-sm">
                  <p className="font-semibold">No hay dimensiones de aporte para la región {evento?.region}.</p>
                  <p className="mt-1 opacity-80">Cargá dimensiones en la sección Dimensiones usando exactamente la misma región que el evento.</p>
                </div>
              ) : (
                <FormularioInput dimensiones={dimensionesInputs} onCreado={manejarCrearInput} eventoId={id} evento={evento} />
              )}
            </div>

            {/* Lista verificable de inputs */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-lg font-bold text-gray-900">Lista verificable de inputs</h2>
                {inputs.length > 0 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {inputs.length} {inputs.length === 1 ? 'input' : 'inputs'}
                  </span>
                )}
              </div>
              {inputs.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">No hay inputs cargados.</p>
              ) : (
                <div className="max-h-[460px] overflow-y-auto pr-1.5 p-0.5 rounded-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inputs.map(input => (
                      <div key={input.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:bg-gray-50/50 transition-colors flex flex-col justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <ChecklistInput input={input} />
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-auto">
                          <button
                            onClick={() => manejarEliminarInput(input.id)}
                            className="w-full text-center text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold bg-red-50 hover:bg-red-100/80 py-2 rounded-xl border border-red-100 transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Movilidad Logística */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-lg font-bold text-gray-900">Movilidad Logística</h2>
                {movilidad.length > 0 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {movilidad.length} {movilidad.length === 1 ? 'registro' : 'registros'}
                  </span>
                )}
              </div>
              <FormularioMovilidad onCreado={manejarCrearMovilidad} eventoId={id} />
              {movilidad.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">No hay movilidad registrada.</p>
              ) : (
                <div className="mt-4 max-h-[380px] overflow-y-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
                  <ul className="divide-y divide-gray-200">
                    {movilidad.map(item => {
                      const esReal = item.tipo_fuente === 'real' || item.tipo_fuente === 'verificado'
                      return (
                        <li key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold capitalize text-sm text-gray-900">{item.transporte}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600 font-medium">{item.distancia} km</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600 font-medium">{item.cantidad_empleados} {item.cantidad_empleados === 1 ? 'persona' : 'personas'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${esReal ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                {esReal ? 'Verificado' : 'Estimado'}
                              </span>
                            </div>
                            {item.comentario && (
                              <p className="text-xs text-gray-450 italic mt-1.5 pl-2 border-l-2 border-gray-200 truncate" title={item.comentario}>
                                "{item.comentario}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => manejarEliminarMovilidad(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold shrink-0 bg-red-50 hover:bg-red-100/80 px-3.5 py-2 rounded-xl border border-red-100 transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-8">
            {/* Webhook Tickets */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">Tickets recibidos</h2>
                {tickets.length > 0 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">Ingresados automáticamente por webhook externo.</p>
              {tickets.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-4 text-center">No hay tickets cargados.</p>
              ) : (
                <div className="max-h-[340px] md:max-h-[480px] lg:max-h-[580px] xl:max-h-[660px] overflow-y-auto pr-1.5 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 shadow-sm flex flex-col justify-center hover:bg-gray-100/70 transition-colors">
                        <strong className="text-gray-900 text-xs truncate" title={ticket.ticket_id}>{ticket.ticket_id}</strong>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">{ticket.movilidades?.length || 0} movilidades</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmación */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmación</h2>
              <p className="text-xs text-gray-500 mb-4">El cálculo final procesa todos los inputs de dimensiones, movilidad del personal y tickets recibidos.</p>
              <button
                onClick={manejarCalcular}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-150 active:scale-98 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
                disabled={!mappingCompleto()}
              >
                Calcular Emisiones
              </button>
              {!mappingCompleto() && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 shadow-sm">
                  <p className="font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Faltan factores de movilidad
                  </p>
                  <p className="mt-1 opacity-90">El sistema no puede calcular el evento porque no existen dimensiones de movilidad en la base de datos para la región <strong>{evento?.region}</strong>.</p>
                  <p className="mt-2 font-semibold">Carga dimensiones para: {transportesFaltantes().join(', ')}</p>
                </div>
              )}
            </div>

            {/* Resultado activo */}
            {resultado && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-950 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Resultado activo</h3>
                <p className="text-4xl font-extrabold mt-2 tracking-tight">{Number(resultado.total).toFixed(2)} <span className="text-sm font-medium opacity-80">kgCO2e</span></p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                  <span>Versión {resultado.version}</span>
                  <span>•</span>
                  <span className="capitalize">{resultado.estado}</span>
                </div>
                {publicUrl && (
                  <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl shadow-inner">
                      <QRCodeSVG id="qr-code-calculo-svg" value={publicUrl} size={128} />
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-4">
                      <button
                        type="button"
                        onClick={manejarCompartirQR}
                        disabled={compartiendo}
                        className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-xl shadow-md shadow-indigo-950/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        <span>{compartiendo ? 'Generando...' : 'Compartir QR / Imagen'}</span>
                      </button>

                      <a
                        className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl border border-white/10 transition-colors"
                        href={`/public/${resultado.public_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        <span>Abrir página pública</span>
                      </a>

                      {mensajeCompartido && (
                        <div className="text-[11px] text-emerald-300 font-medium bg-emerald-950/80 border border-emerald-500/40 rounded-lg py-1 px-2 mt-1 text-center">
                          {mensajeCompartido}
                        </div>
                      )}
                    </div>
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
