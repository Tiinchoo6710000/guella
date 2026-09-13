import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Encabezado() {
  const { usuario, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const linkClase = ({ isActive }) =>
    `relative py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${isActive
      ? 'text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 shadow-xs'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border border-transparent'
    }`

  const bottomLinkClase = ({ isActive }) =>
    `flex-1 flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold transition-all duration-150 ${isActive
      ? 'text-emerald-600 font-bold'
      : 'text-gray-500 hover:text-gray-800'
    }`

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Header Superior */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="w-full px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand / Logo */}
          <Link to="/eventos" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-emerald-100 group-hover:scale-105 transition-transform duration-200">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 leading-none text-sm sm:text-base tracking-tight group-hover:text-emerald-700 transition-colors">
                Güella
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                MRV Platform
              </span>
            </div>
          </Link>

          {/* Navigation — Escritorio (md en adelante) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 flex-1 justify-center">
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
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-800 leading-none">{usuario.nombre}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${esAdmin ? 'text-emerald-600' : 'text-indigo-500'}`}>
                  {esAdmin ? 'Admin' : 'Productor'}
                </span>
              </div>
            )}

            {/* Avatar */}
            {usuario && (
              <div 
                title={`${usuario.nombre} (${esAdmin ? 'Admin' : 'Productor'})`}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs ${esAdmin ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}
              >
                {usuario.nombre?.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <button
              id="btn-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menú Inferior Fijo en Móvil (< md) para el Administrador */}
      {esAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-lg md:hidden flex items-center justify-around h-15 px-2 safe-bottom">
          <NavLink to="/usuarios" className={bottomLinkClase}>
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <span className="leading-tight mt-0.5">Usuarios</span>
              </>
            )}
          </NavLink>

          <NavLink to="/factores" className={bottomLinkClase}>
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
                  </svg>
                </div>
                <span className="leading-tight mt-0.5">Dimensiones</span>
              </>
            )}
          </NavLink>

          <NavLink to="/eventos" className={bottomLinkClase}>
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.253 3.75m-18 0h18M4.5 7.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V9.75A2.25 2.25 0 014.5 7.5z" />
                  </svg>
                </div>
                <span className="leading-tight mt-0.5">Eventos</span>
              </>
            )}
          </NavLink>
        </nav>
      )}
    </>
  )
}
