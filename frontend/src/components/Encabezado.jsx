import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Encabezado() {
  const { usuario, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const linkClase = ({ isActive }) =>
    `relative py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
      ? 'text-emerald-700 bg-emerald-50/60 border border-emerald-100/50 shadow-sm'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 border border-transparent'
    }`

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/eventos" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-100 group-hover:scale-105 transition-transform duration-200">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-none text-base tracking-tight group-hover:text-emerald-700 transition-colors">
              Güella
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              MRV Platform
            </span>
          </div>
        </Link>

        {/* Navigation — adaptada por rol */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
          {esAdmin && (
            <NavLink to="/usuarios" className={linkClase}>
              Usuarios
            </NavLink>
          )}
          {esAdmin && (
            <NavLink to="/factores" className={linkClase}>
              Dimensiones
            </NavLink>
          )}
          <NavLink to="/eventos" className={linkClase}>
            Eventos
          </NavLink>
        </nav>

        {/* Usuario actual + Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {usuario && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-800 leading-none">{usuario.nombre}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${esAdmin ? 'text-emerald-600' : 'text-indigo-500'}`}>
                {esAdmin ? 'Admin' : 'Productor'}
              </span>
            </div>
          )}

          {/* Avatar */}
          {usuario && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${esAdmin ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
              {usuario.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <button
            id="btn-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
