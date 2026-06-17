import { useEffect, useState } from 'react'
import clienteApi from '../api/clienteApi'
import TarjetaEvento from '../components/TarjetaEvento'
import ModalCrearEvento from '../components/ModalCrearEvento'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <button
          onClick={() => setAbrirModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear evento
        </button>
      </div>

      {cargando ? (
        <p>Cargando eventos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
