import Encabezado from './components/Encabezado'
import RutasApp from './routes/RutasApp'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Encabezado />
      <main className="p-6">
        <RutasApp />
      </main>
    </div>
  )
}
