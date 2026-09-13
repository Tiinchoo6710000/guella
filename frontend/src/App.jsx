import { useLocation } from 'react-router-dom'
import Encabezado from './components/Encabezado'
import RutasApp from './routes/RutasApp'

const RUTAS_SIN_ENCABEZADO = ['/public/', '/login', '/cambiar-password', '/forgot-password', '/reset-password']

export default function App() {
  const location = useLocation()
  const sinEncabezado = RUTAS_SIN_ENCABEZADO.some(r => location.pathname.startsWith(r))

  return (
    <div className={sinEncabezado ? "min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30" : "min-h-screen bg-gray-50 text-gray-900"}>
      {!sinEncabezado && <Encabezado />}
      <main className={sinEncabezado ? "" : "p-4 sm:p-6 lg:p-8 w-full"}>
        <RutasApp />
      </main>
    </div>
  )
}
