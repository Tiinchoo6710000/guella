import { useState } from 'react'
import { Link } from 'react-router-dom'
import clienteApi from '../api/clienteApi'

export default function PaginaForgotPassword() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await clienteApi.post('/auth/forgot-password', { email })
      setEnviado(true)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Ocurrió un error al procesar tu solicitud. Por favor intentá nuevamente.'
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
            <h1 className="text-white font-bold text-xl tracking-tight">Recuperar Contraseña</h1>
            <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-widest mt-1">
              MRV Platform
            </p>
          </div>

          {enviado ? (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">¡Revisá tu casilla de correo!</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Hemos enviado un enlace seguro a <strong className="text-emerald-400">{email}</strong> para restablecer tu contraseña.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-slate-400 text-left space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">⏱️</span>
                  <span>El enlace tiene una validez de <strong>1 hora</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">📁</span>
                  <span>Si no lo encontrás en tu bandeja de entrada, revisá la carpeta de <strong>spam o correo no deseado</strong>.</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-center transition-all shadow-lg shadow-emerald-500/20 text-sm"
                >
                  Volver al inicio de sesión
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEnviado(false)
                    setEmail('')
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ¿Probar con otro correo?
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-300 text-sm text-center mb-6 leading-relaxed">
                Ingresá el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Botón Enviar */}
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
                      Enviando instrucciones...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
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
