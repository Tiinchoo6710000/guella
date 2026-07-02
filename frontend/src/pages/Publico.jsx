import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import clienteApi from '../api/clienteApi'
import GraficoBarrasPublico from '../components/publico/GraficoBarrasPublico'
import GraficoTortaPublico from '../components/publico/GraficoTortaPublico'
import { agruparPorCampo } from '../utilidades/agruparCalculo'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PaginaPublica() {
  const { slug } = useParams()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)
  const [equivalenciaActiva, setEquivalenciaActiva] = useState('arboles')
  const [tabActiva, setTabActiva] = useState('categoria')
  const [totalAnimado, setTotalAnimado] = useState(0)
  const animacionCompletada = useRef(null)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await clienteApi.get(`/public/${slug}`)
        setDatos(res.data)
        setError(false)
      } catch (err) {
        setDatos(null)
        setError(true)
      }
    }
    cargar()
  }, [slug])

  const porCategoria = useMemo(() => agruparPorCampo(datos?.detalles || [], 'categoria'), [datos])
  const porOrigen = useMemo(() => agruparPorCampo(datos?.detalles || [], 'origen'), [datos])
  const total = datos?.calculo?.total || 0

  // Animación de cuenta del total utilizando requestAnimationFrame con control de useRef para evitar repeticiones
  useEffect(() => {
    const totalNum = Number(total)
    if (!totalNum) {
      setTotalAnimado(0)
      animacionCompletada.current = null
      return
    }

    // Si ya completamos la animación para esta cifra exacta, evitamos reiniciar
    if (animacionCompletada.current === totalNum) {
      setTotalAnimado(totalNum)
      return
    }

    let frameId
    const startTime = performance.now()
    const duracion = 1000 // 1 segundo exacto de duración

    const animar = (now) => {
      const transcurrido = now - startTime
      const progreso = Math.min(transcurrido / duracion, 1)

      setTotalAnimado(progreso * totalNum)

      if (progreso < 1) {
        frameId = requestAnimationFrame(animar)
      } else {
        setTotalAnimado(totalNum)
        animacionCompletada.current = totalNum // Marcar como completado para esta cifra
      }
    }

    frameId = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(frameId)
  }, [total])



  // Datos para equivalencias interactivas
  const equivalencias = {
    arboles: {
      titulo: 'Compensación Forestal',
      valor: total / 22, // Absorción anual aprox de un árbol maduro
      unidad: 'árboles / año',
      descripcion: 'Número de árboles maduros necesarios absorbiendo CO2 durante todo un año para compensar el impacto generado.',
      detalle: 'Un árbol promedio absorbe aproximadamente 22 kg de CO2 al año.',
      colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      icono: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3m0 0H9m3 0h3M9.75 18a3.75 3.75 0 000-7.5M9.75 10.5a3.75 3.75 0 117.5 0v0A3.75 3.75 0 0118 13.5v3M3.75 18h16.5M12 3a9 9 0 00-6.75 14.25m13.5 0A9 9 0 0012 3z" />
        </svg>
      )
    },
    auto: {
      titulo: 'Kilómetros de Conducción',
      valor: total / 0.12, // Promedio 120g CO2/km
      unidad: 'km en coche',
      descripcion: 'Distancia equivalente recorrida por un automóvil mediano a gasolina para generar esta misma huella.',
      detalle: 'Basado en un factor de emisión estándar de 120 gramos de CO2 por kilómetro.',
      colorClass: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      icono: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h7.5m3 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m3 0H21m-1.5-3H4.5m15 0L17 8.25m-14 7.5L5.5 8.25M17 8.25h-2.5m-5.5 0H5.5m9 0a2.25 2.25 0 00-2.25-2.25h-3.375A2.25 2.25 0 006.75 8.25M17 8.25h1.5a2.25 2.25 0 012.25 2.25v2.25H3v-2.25A2.25 2.25 0 015.25 8.25h1.5" />
        </svg>
      )
    },
    celular: {
      titulo: 'Cargas de Smartphone',
      valor: total / 0.0083, // Aprox 8.3 gramos por carga completa (incl. pérdidas de red)
      unidad: 'cargas de batería',
      descripcion: 'La cantidad de veces que podrías recargar por completo la batería de un celular con esta energía.',
      detalle: 'Una carga promedio de smartphone equivale a unos 8.3 gramos de CO2 emitidos.',
      colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      glowColor: 'rgba(245, 158, 11, 0.4)',
      icono: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 15h9" />
        </svg>
      )
    }
  }

  const equiv = equivalencias[equivalenciaActiva]

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="w-16 h-16 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Evento no encontrado</h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-md">No logramos cargar la información de esta página. Verifica el enlace o vuelve a escanear el código QR.</p>
      </div>
    )
  }

  if (!datos) {
    return <LoadingSpinner mensaje="Obteniendo reporte ambiental..." oscuro fullscreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 px-4 md:px-8 max-w-7xl mx-auto pt-6 md:pt-12">
      {/* Encabezado Principal / Branding */}
      <header className="text-center mb-8 md:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Reporte Público de Huella
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight drop-shadow-md">
          {datos.nombre}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-slate-400 mt-3 font-medium">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {datos.fecha}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:inline" />
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {datos.ciudad}, {datos.pais}
          </span>
          {datos.cantidad_asistentes && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {datos.cantidad_asistentes.toLocaleString()} asistentes
              </span>
            </>
          )}
        </div>
      </header>

      {/* Grid General */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* COLUMNA IZQUIERDA: Métrica e Interactivos (Lg: 5/12 cols) */}
        <section className="lg:col-span-5 space-y-6">

          {/* Tarjeta de Huella de Carbono */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Huella de Carbono Total</p>

            <div className="my-6 inline-flex flex-col items-center justify-center p-8 w-56 h-56 rounded-full border border-emerald-500/30 bg-emerald-500/[0.04] shadow-[inset_0_0_40px_rgba(16,185,129,0.15),0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[inset_0_0_50px_rgba(16,185,129,0.25),0_0_50px_rgba(16,185,129,0.35)] transition-all duration-500 relative group">
              {/* Soft pulsing aura glow background */}
              <div className="absolute -inset-1 rounded-full bg-emerald-600/10 blur-xl animate-pulse pointer-events-none group-hover:bg-emerald-200/20" />

              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter transition-all duration-300 group-hover:scale-105 z-10">
                {totalAnimado.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-1.5 z-10">
                kgCO2e
              </span>

              {/* Outer pulsing ring 1 */}
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping opacity-25 pointer-events-none" style={{ animationDuration: '1.5s' }} />

              {/* Outer pulsing ring 2 (delayed for wave effect) */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/25 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '1.5s', animationDelay: '0.75s' }} />
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-2">
              Esta métrica representa el impacto ambiental acumulado de todas las actividades logísticas, consumo energético e insumos del evento.
            </p>
          </div>

          {/* Tarjeta de Equivalencias Interactivas */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-base text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Impacto en la vida real
            </h3>

            {/* Botones de Control */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {Object.keys(equivalencias).map((key) => {
                const eq = equivalencias[key]
                const esActivo = equivalenciaActiva === key
                return (
                  <button
                    key={key}
                    onClick={() => setEquivalenciaActiva(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer outline-none focus:ring-1 focus:ring-slate-700 ${esActivo
                      ? 'bg-slate-800/80 border-slate-700 text-white font-semibold shadow-md scale-[1.02]'
                      : 'bg-slate-950/40 border-slate-900/50 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                      }`}
                  >
                    <span className={`transition-transform duration-300 ${esActivo ? 'scale-110' : 'opacity-70'}`}>
                      {eq.icono}
                    </span>
                    <span className="text-[10px] mt-1.5 tracking-wider truncate w-full capitalize">
                      {key === 'arboles' ? 'Bosques' : key === 'auto' ? 'Coches' : 'Cargas'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Panel de Detalle de Equivalencia */}
            <div
              className={`p-5 rounded-xl border transition-all duration-500 ${equiv.colorClass}`}
              style={{ boxShadow: `inset 0 0 20px ${equiv.glowColor}` }}
            >
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                {equiv.titulo}
              </h4>

              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {equiv.valor.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs font-semibold text-slate-300 capitalize">
                  {equiv.unidad}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-3 border-t border-slate-800/50 pt-3">
                {equiv.descripcion}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                Nota: {equiv.detalle}
              </p>
            </div>
          </div>

        </section>

        {/* COLUMNA DERECHA: Gráficos y Desglose (Lg: 7/12 cols) */}
        <section className="lg:col-span-7 space-y-6">

          {/* VISTA MÓVIL (Con pestañas de categorías vs orígenes) */}
          <div className="md:hidden space-y-4">

            {/* Selector de Pestañas Móvil */}
            <div className="flex p-1 bg-slate-900/80 border border-slate-800/60 rounded-xl">
              <button
                onClick={() => setTabActiva('categoria')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${tabActiva === 'categoria'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Por Categoría
              </button>
              <button
                onClick={() => setTabActiva('origen')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${tabActiva === 'origen'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Por Origen
              </button>
            </div>

            {/* Contenido Móvil Condicional */}
            {tabActiva === 'categoria' ? (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Emisiones por Categoría (kgCO2e)
                  </h3>
                  <GraficoBarrasPublico datos={porCategoria} />
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center">
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-5 text-left w-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Distribución por Categoría (%)
                  </h3>
                  <GraficoTortaPublico datos={porCategoria} tamaño={200} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Emisiones por Origen (kgCO2e)
                  </h3>
                  <GraficoBarrasPublico datos={porOrigen} />
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col items-center">
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 mb-5 text-left w-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Distribución por Origen (%)
                  </h3>
                  <GraficoTortaPublico datos={porOrigen} tamaño={200} />
                </div>
              </div>
            )}
          </div>

          {/* VISTA ESCRITORIO / TABLET (Grid Completo - Sin Pestañas) */}
          <div className="hidden md:grid gap-6">

            {/* Sección Categorías */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-base text-slate-100 mb-6 flex items-center gap-2 pb-3 border-b border-slate-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Auditoría por Categoría de Impacto
              </h3>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Carga total</h4>
                  <GraficoBarrasPublico datos={porCategoria} />
                </div>
                <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-slate-800/60 pt-6 md:pt-0 md:pl-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 w-full text-center md:text-left">Porcentajes</h4>
                  <GraficoTortaPublico datos={porCategoria} tamaño={210} />
                </div>
              </div>
            </div>

            {/* Sección Orígenes */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-base text-slate-100 mb-6 flex items-center gap-2 pb-3 border-b border-slate-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Auditoría por Origen de la Emisión
              </h3>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Carga total</h4>
                  <GraficoBarrasPublico datos={porOrigen} />
                </div>
                <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-slate-800/60 pt-6 md:pt-0 md:pl-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 w-full text-center md:text-left">Porcentajes</h4>
                  <GraficoTortaPublico datos={porOrigen} tamaño={210} />
                </div>
              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  )
}
