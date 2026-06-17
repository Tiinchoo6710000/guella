import { Link, NavLink } from 'react-router-dom'

export default function Encabezado() {
  const linkClase = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-emerald-700' : 'text-gray-700 hover:text-gray-950'}`

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/eventos" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white font-bold">G</div>
          <span className="font-semibold text-gray-950">Guella</span>
        </Link>

        <nav className="flex gap-4">
          <NavLink to="/factores" className={linkClase}>Dimensiones</NavLink>
          <NavLink to="/eventos" className={linkClase}>Eventos</NavLink>
        </nav>
      </div>
    </header>
  )
}
