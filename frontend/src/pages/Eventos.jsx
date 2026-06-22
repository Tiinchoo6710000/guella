import { useEffect, useState } from 'react'
import clienteApi from '../api/clienteApi'
import TarjetaEvento from '../components/TarjetaEvento'
import ModalCrearEvento from '../components/ModalCrearEvento'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PaginaEventos() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abrirModal, setAbrirModal] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await clienteApi.get('/eventos')
        setEventos(res.data || [])
      } catch {
        setEventos([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto font-medium"
        >
          Crear evento
        </button>
      </div>

      {cargando ? (
        <LoadingSpinner mensaje="Cargando eventos..." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {eventos.map((e) => (
            <TarjetaEvento key={e.id} evento={e} />
          ))}
        </div>
      )}

      {abrirModal && (
        <ModalCrearEvento onCerrar={() => setAbrirModal(false)} onCreado={(nuevo) => setEventos([nuevo, ...eventos])} />
      )}
    </div>
  )
}
