import { useEffect, useState } from 'react'
import clienteApi from '../api/clienteApi'
import LoadingSpinner from '../components/LoadingSpinner'

function formatFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function ModalCrearProductor({ onCerrar, onCreado }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await clienteApi.post('/usuarios', { nombre, email, password })
      onCreado(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el productor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nuevo Productor</h2>
            <p className="text-xs text-gray-500 mt-0.5">El productor deberá cambiar su contraseña en el primer ingreso</p>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre completo</label>
            <input
              id="nuevo-productor-nombre"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: María González"
              required
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input
              id="nuevo-productor-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="productora@empresa.com"
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Contraseña inicial</label>
            <input
              id="nuevo-productor-password"
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mín. 6 caracteres"
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <p className="text-[10px] text-gray-400">Esta es la contraseña de primer ingreso. El productor la deberá cambiar.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              id="btn-crear-productor"
              type="submit"
              disabled={cargando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creando...</>
              ) : 'Crear productor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalEditarProductor({ productor, onCerrar, onActualizado }) {
  const [nombre, setNombre] = useState(productor?.nombre || '')
  const [email, setEmail] = useState(productor?.email || '')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await clienteApi.put(`/usuarios/${productor.id}`, { nombre, email })
      onActualizado(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el productor.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar Productor</h2>
            <p className="text-xs text-gray-500 mt-0.5">Modificá los datos del productor</p>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre completo</label>
            <input
              id="editar-productor-nombre"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: María González"
              required
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input
              id="editar-productor-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="productora@empresa.com"
              required
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCerrar} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              id="btn-guardar-productor"
              type="submit"
              disabled={cargando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Guardando...</>
              ) : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaginaUsuarios() {
  const [productores, setProductores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abrirModal, setAbrirModal] = useState(false)
  const [productorAEditar, setProductorAEditar] = useState(null)
  const [procesandoId, setProcesandoId] = useState(null)
  const [mensajeEstado, setMensajeEstado] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    try {
      const res = await clienteApi.get('/usuarios')
      setProductores(res.data || [])
    } catch {
      setProductores([])
    } finally {
      setCargando(false)
    }
  }

  async function manejarAlternarEstado(productor) {
    const estaActivo = productor.activo !== false
    const accion = estaActivo ? 'desactivar' : 'activar'
    const mensajeConfirm = estaActivo
      ? `¿Estás seguro de que deseas desactivar la cuenta de ${productor.nombre}? El productor no podrá iniciar sesión pero todos sus datos y eventos se mantendrán intactos.`
      : `¿Deseas activar nuevamente la cuenta de ${productor.nombre}? Podrá volver a iniciar sesión con normalidad.`

    if (!window.confirm(mensajeConfirm)) return

    setProcesandoId(productor.id)
    try {
      const res = await clienteApi.patch(`/usuarios/${productor.id}/estado`)
      setProductores(prev => prev.map(p => p.id === productor.id ? res.data : p))
      setMensajeEstado(`Cuenta de ${productor.nombre} ${res.data.activo ? 'activada' : 'desactivada'} correctamente.`)
      setTimeout(() => setMensajeEstado(''), 4000)
    } catch (err) {
      alert(err.response?.data?.detail || `Error al ${accion} la cuenta.`)
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Usuarios</h1>
          <p className="text-sm text-gray-500">Administrá los usuarios productores de la plataforma.</p>
        </div>
        <button
          id="btn-nuevo-productor"
          onClick={() => setAbrirModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl w-full sm:w-auto font-semibold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo productor
        </button>
      </div>

      {mensajeEstado && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{mensajeEstado}</span>
        </div>
      )}

      {/* Contenido */}
      {cargando ? (
        <LoadingSpinner mensaje="Cargando usuarios..." />
      ) : productores.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Sin productores registrados</h3>
          <p className="text-sm text-gray-500">Creá el primer productor usando el botón de arriba.</p>
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL (< md): Tarjetas de usuarios */}
          <div className="md:hidden space-y-3">
            {productores.map(p => (
              <div 
                key={p.id} 
                className={`bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3 transition-all ${
                  p.activo === false ? 'bg-gray-50/40 opacity-80' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      p.activo === false 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                    }`}>
                      <span className="font-bold text-sm">{p.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm leading-tight truncate ${p.activo === false ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{p.nombre}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <div className="shrink-0">
                    {p.activo === false ? (
                      <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5">
                        Desactivado
                      </span>
                    ) : p.debe_cambiar_password ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5">
                        Sin activar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5">
                        Activo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>Eventos asociados: <strong className="text-gray-800">{p.cantidad_eventos}</strong></span>
                  <span className="text-[11px]">{formatFecha(p.creado_en)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setProductorAEditar(p)}
                    className="flex-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <span>Editar</span>
                  </button>

                  {p.activo === false ? (
                    <button
                      onClick={() => manejarAlternarEstado(p)}
                      disabled={procesandoId === p.id}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[36px]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>Activar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => manejarAlternarEstado(p)}
                      disabled={procesandoId === p.id}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[36px]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span>Desactivar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VISTA ESCRITORIO (>= md): Tabla completa con scroll seguro */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Productor</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registro</th>
                    <th className="text-center px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eventos</th>
                    <th className="text-center px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productores.map(p => (
                    <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors group ${p.activo === false ? 'bg-gray-50/30 opacity-75' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            p.activo === false 
                              ? 'bg-gray-100 text-gray-400' 
                              : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                          }`}>
                            <span className="font-bold text-sm">{p.nombre.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className={`font-semibold leading-none ${p.activo === false ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{p.nombre}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={p.activo === false ? 'text-gray-400' : 'text-gray-600'}>{p.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 text-xs">{formatFecha(p.creado_en)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                          {p.cantidad_eventos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.activo === false ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                            <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Desactivado
                          </span>
                        ) : p.debe_cambiar_password ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                            <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Sin activar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                            <svg className="w-2.5 h-2.5 fill-emerald-500" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="6" />
                            </svg>
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setProductorAEditar(p)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                            title="Editar productor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span className="text-xs font-medium hidden sm:inline">Editar</span>
                          </button>

                          {p.activo === false ? (
                            <button
                              onClick={() => manejarAlternarEstado(p)}
                              disabled={procesandoId === p.id}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer inline-flex items-center justify-center gap-1 text-xs font-semibold disabled:opacity-50"
                              title="Activar cuenta"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>Activar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => manejarAlternarEstado(p)}
                              disabled={procesandoId === p.id}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer inline-flex items-center justify-center gap-1 text-xs font-semibold disabled:opacity-50"
                              title="Desactivar cuenta"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              <span>Desactivar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {abrirModal && (
        <ModalCrearProductor
          onCerrar={() => setAbrirModal(false)}
          onCreado={(nuevo) => {
            setProductores([nuevo, ...productores])
            setAbrirModal(false)
          }}
        />
      )}

      {productorAEditar && (
        <ModalEditarProductor
          productor={productorAEditar}
          onCerrar={() => setProductorAEditar(null)}
          onActualizado={(actualizado) => {
            setProductores(prev => prev.map(p => p.id === actualizado.id ? actualizado : p))
            setProductorAEditar(null)
          }}
        />
      )}
    </div>
  )
}

