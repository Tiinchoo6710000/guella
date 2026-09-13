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

      {/* Contenido */}
      {cargando ? (
        <LoadingSpinner mensaje="Cargando usuarios..." />
      ) : productores.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">Sin productores registrados</h3>
          <p className="text-sm text-gray-500">Creá el primer productor usando el botón de arriba.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Productor</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Registro</th>
                <th className="text-center px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eventos</th>
                <th className="text-center px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productores.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-600 font-bold text-sm">{p.nombre.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 leading-none">{p.nombre}</p>
                        <p className="text-xs text-gray-400 mt-0.5 md:hidden">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-gray-600">{p.email}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-500 text-xs">{formatFecha(p.creado_en)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                      {p.cantidad_eventos}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.debe_cambiar_password ? (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sin activar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setProductorAEditar(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                      title="Editar productor"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      <span className="text-xs font-medium hidden sm:inline">Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

