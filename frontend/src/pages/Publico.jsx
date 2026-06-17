import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import clienteApi from '../api/clienteApi'
import GraficoBarras from '../components/GraficoBarras'
import GraficoTorta from '../components/GraficoTorta'
import { agruparPorCampo } from '../utilidades/agruparCalculo'


export default function PaginaPublica() {
  const { slug } = useParams()
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await clienteApi.get(`/public/${slug}`)
        setDatos(res.data)
      } catch {
        setDatos(null)
      }
    }
    cargar()
  }, [slug])

  const porCategoria = useMemo(() => agruparPorCampo(datos?.detalles || [], 'categoria'), [datos])
  const porOrigen = useMemo(() => agruparPorCampo(datos?.detalles || [], 'origen'), [datos])
  const total = datos?.calculo?.total || 0

  if (!datos) return <p>Cargando página pública...</p>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="bg-white border rounded-lg p-6 shadow-sm">
        <p className="text-sm text-emerald-700 font-semibold">Reporte público de emisiones</p>
        <h1 className="text-3xl font-bold text-gray-950 mt-1">{datos.nombre}</h1>
        <p className="text-gray-600 mt-2">{datos.fecha} - {datos.ciudad}, {datos.pais}</p>
        <div className="mt-6">
          <p className="text-sm text-gray-500">Emisión total calculada</p>
          <p className="text-5xl font-bold text-gray-950">{Number(total).toFixed(2)} kgCO2e</p>
        </div>
      </section>

      <section className="grid md:grid-cols-[1fr_280px] gap-6">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Auditoría de emisiones</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Emisiones por categoría</h3>
              <GraficoBarras datos={porCategoria} />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Emisiones por origen</h3>
              <GraficoBarras datos={porOrigen} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Distribución por categoría</h3>
              <GraficoTorta datos={porCategoria} tamaño={220} />
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Distribución por origen</h3>
              <GraficoTorta datos={porOrigen} tamaño={220} />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Datos del cálculo</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Asistentes</dt>
              <dd className="font-semibold">{datos.cantidad_asistentes}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Versión</dt>
              <dd className="font-semibold">{datos.calculo?.version || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Estado</dt>
              <dd className="font-semibold">{datos.calculo?.estado || '-'}</dd>
            </div>

           
          </dl>
        </div>
      </section>
    </div>
  )
}
