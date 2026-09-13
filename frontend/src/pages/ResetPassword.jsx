import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import clienteApi from '../api/clienteApi'

export default function PaginaResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [completado, setCompletado] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('El enlace no contiene un token válido de recuperación.')
      return
    }

    if (nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas ingresadas no coinciden.')
      return
    }

    setCargando(true)
    try {
      await clienteApi.post('/auth/reset-password', {
        token,
        nueva_password: nuevaPassword,
      })
      setCompletado(true)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'El enlace de recuperación es inválido o ha expirado. Por favor solicitá uno nuevo.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
              <span className="text-white font-black text-2xl leading-none">G</span>
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight">Restablecer Contraseña</h1>
            <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-widest mt-1">
              MRV Platform
            </p>
          </div>

          {!token ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-slate-300 text-sm">
                No se encontró un token válido en el enlace de recuperación.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-center text-sm transition-all"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : completado ? (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">¡Contraseña restablecida!</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tu nueva contraseña ha sido guardada correctamente. Ya podés iniciar sesión con tus nuevas credenciales.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-center transition-all shadow-lg shadow-emerald-500/20 text-sm"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-300 text-sm text-center mb-6 leading-relaxed">
                Ingresá tu nueva clave para actualizar el acceso a tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nueva Contraseña */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={nuevaPassword}
                      onChange={e => setNuevaPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(v => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {mostrarPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={confirmarPassword}
                      onChange={e => setConfirmarPassword(e.target.value)}
                      placeholder="Repetí la contraseña"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                    </div>
                    {error.includes('expirado') && (
                      <Link
                        to="/forgot-password"
                        className="block text-center text-xs text-emerald-400 hover:text-emerald-300 underline"
                      >
                        Solicitar un nuevo enlace de recuperación
                      </Link>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 mt-2 text-sm"
                >
                  {cargando ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Actualizando contraseña...
                    </>
                  ) : (
                    'Guardar nueva contraseña'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
