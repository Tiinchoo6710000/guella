import { Link, NavLink } from 'react-router-dom'

export default function Encabezado() {
  const linkClase = ({ isActive }) =>
    `relative py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
      ? 'text-emerald-700 bg-emerald-50/60 border border-emerald-100/50 shadow-sm'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 border border-transparent'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/eventos" className="flex items-center gap-2.5 group">
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

        {/* Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <NavLink to="/factores" className={linkClase}>
            Dimensiones
          </NavLink>
          <NavLink to="/eventos" className={linkClase}>
            Eventos
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
