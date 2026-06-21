import { useLocation } from 'react-router-dom'
import Encabezado from './components/Encabezado'
import RutasApp from './routes/RutasApp'

export default function App() {
  const location = useLocation()
  const esRutaPublica = location.pathname.startsWith('/public/')

  return (
    <div className={esRutaPublica ? "min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30" : "min-h-screen bg-gray-50 text-gray-900"}>
      {!esRutaPublica && <Encabezado />}
      <main className={esRutaPublica ? "" : "p-6"}>
        <RutasApp />
      </main>
    </div>
  )
}
