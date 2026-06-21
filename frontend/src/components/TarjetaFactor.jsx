export default function TarjetaFactor({ factor, onEliminar }) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm relative group">
      <button
        onClick={onEliminar}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
        title="Eliminar Dimension"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      <h3 className="font-semibold text-gray-950">{factor.categoria} - {factor.subtipo}</h3>
      <p className="text-sm text-gray-700">{factor.valor} kgCO2e / {factor.unidad}</p>
      <p className="text-xs text-gray-500 mt-2">Region: {factor.region}</p>
      <p className="text-xs text-gray-500 mt-2">Fuente: {factor.fuente}</p>
      <p className="text-xs text-gray-500">Versión {factor.version} - Vigencia {factor.vigencia}</p>
    </div>
  )
}
