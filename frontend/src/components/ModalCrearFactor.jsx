import { useState } from 'react'
import clienteApi from '../api/clienteApi'

const opciones = {
  energia: ['electricidad', 'diesel_generador', 'nafta_generador', 'solar'],
  residuos: ['reciclable', 'organico', 'rechazo'],
  agua: ['red', 'transportada'],
  catering: ['carne', 'vegano', 'vegetariano', 'bebidas'],
  produccion: ['papel', 'plastico', 'textil', 'madera'],
  movilidad: ['auto', 'moto', 'bici', 'bus', 'tren', 'avion', 'caminata']
}

const categorias = [
  { key: 'energia', label: 'Energía' },
  { key: 'residuos', label: 'Residuos' },
  { key: 'agua', label: 'Agua' },
  { key: 'catering', label: 'Catering' },
  { key: 'produccion', label: 'Producción' },
  { key: 'movilidad', label: 'Movilidad' }
]

const unidades = {
  electricidad: 'kwh',
  diesel_generador: 'litros',
  nafta_generador: 'litros',
  solar: 'kwh',
  reciclable: 'kg',
  organico: 'kg',
  rechazo: 'kg',
  red: 'litros',
  transportada: 'litros',
  carne: 'kg',
  vegano: 'kg',
  vegetariano: 'kg',
  bebidas: 'litros',
  papel: 'kg',
  plastico: 'kg',
  textil: 'kg',
  madera: 'kg',
  auto: 'km',
  moto: 'km',
  bici: 'km',
  bus: 'km',
  tren: 'km',
  avion: 'km',
  caminata: 'km'
}

export default function ModalCrearFactor({ onCerrar, onCreado }) {
  const [categoria, setCategoria] = useState('energia')
  const [subtipo, setSubtipo] = useState('electricidad')
  const [valor, setValor] = useState('')
  const [fuente, setFuente] = useState('')
  const [version, setVersion] = useState('1.0')
  const [vigencia, setVigencia] = useState('')
  const [region, setRegion] = useState('')
  const [comentario, setComentario] = useState('')

  function cambiarCategoria(nuevaCategoria) {
    setCategoria(nuevaCategoria)
    setSubtipo(opciones[nuevaCategoria][0])
  }

  async function manejarCrear(e) {
    e.preventDefault()
    try {
      const payload = {
        categoria,
        subtipo,
        valor: Number(valor),
        unidad: unidades[subtipo],
        fuente,
        version,
        vigencia,
        region,
        comentario
      }
      const res = await clienteApi.post('/factores/', payload)
      if (onCreado) onCreado(res.data)
      onCerrar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creando factor')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Crear Dimension</h2>
        <form onSubmit={manejarCrear} className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
          <select className="w-full border p-2 rounded" value={categoria} onChange={e => cambiarCategoria(e.target.value)}>
            {categorias.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
          </select>
          <label className="text-xs font-semibold text-gray-500 uppercase">Subtipo</label>
          <select className="w-full border p-2 rounded" value={subtipo} onChange={e => setSubtipo(e.target.value)}>
            {opciones[categoria].map(opcion => <option key={opcion} value={opcion}>{opcion}</option>)}
          </select>
          <input className="w-full border p-2 rounded bg-gray-50" value={unidades[subtipo]} readOnly />
          <input className="w-full border p-2 rounded" type="number" step="0.000001" min="0" placeholder="Valor del factor en kgCO2e por unidad" value={valor} onChange={e => setValor(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Región (ej: Argentina, Global...)" value={region} onChange={e => setRegion(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Fuente" value={fuente} onChange={e => setFuente(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Versión" value={version} onChange={e => setVersion(e.target.value)} required />
          <input className="w-full border p-2 rounded" placeholder="Vigencia" value={vigencia} onChange={e => setVigencia(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCerrar} className="px-3 py-2">Cancelar</button>
            <button type="submit" className="bg-emerald-600 text-white px-3 py-2 rounded">Crear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
