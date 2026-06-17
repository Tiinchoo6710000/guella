import clienteApi from './clienteApi'

/**
 * Obtiene el listado de "Dimensiones" (Factores de Emisión).
 * @param {number|null} [eventoId] - Si se proporciona, el backend filtra automáticamente
 * las dimensiones que coinciden con la región del evento.
 */
export const obtenerFactores = (eventoId = null) => {
  const params = eventoId != null && eventoId !== '' ? { evento_id: Number(eventoId) } : {}
  return clienteApi.get('/factores', { params })
}

export const crearFactor = (payload) => clienteApi.post('/factores', payload) // Crear nueva Dimensión
