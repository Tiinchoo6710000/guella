import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clienteApi from '../api/clienteApi'
import { useAuth } from '../context/AuthContext'

export default function PaginaCambiarPassword() {
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { actualizarUsuario, usuario } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)
    try {
      await clienteApi.post('/auth/cambiar-password', { nueva_password: nueva })
      actualizarUsuario({ debe_cambiar_password: false })
      navigate('/eventos')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cambiar la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight">Cambio de contraseña</h1>
            <p className="text-slate-400 text-sm mt-2 text-center leading-relaxed">
              Hola <span className="text-emerald-400 font-semibold">{usuario?.nombre}</span>, es tu primer ingreso.<br />
              Por seguridad, definí tu nueva contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nueva contraseña</label>
              <input
                id="nueva-password"
                type="password"
                value={nueva}
                onChange={e => setNueva(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                autoFocus
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmar contraseña</label>
              <input
                id="confirmar-password"
                type="password"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repetí la contraseña"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Indicador de fuerza */}
            {nueva && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const fuerza = nueva.length >= 8 ? (nueva.length >= 12 ? ((/[A-Z]/.test(nueva) && /[0-9]/.test(nueva)) ? 4 : 3) : 2) : (nueva.length > 0 ? 1 : 0)
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < fuerza
                            ? fuerza <= 1 ? 'bg-red-500' : fuerza <= 2 ? 'bg-amber-500' : fuerza <= 3 ? 'bg-emerald-500' : 'bg-emerald-400'
                            : 'bg-white/10'
                        }`}
                      />
                    )
                  })}
                </div>
                <p className="text-[10px] text-slate-500">
                  {nueva.length < 8 ? 'Muy corta' : nueva.length < 12 ? 'Aceptable' : ((/[A-Z]/.test(nueva) && /[0-9]/.test(nueva)) ? 'Muy fuerte' : 'Fuerte')}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              id="btn-cambiar-password"
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 mt-2"
            >
              {cargando ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar nueva contraseña'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
