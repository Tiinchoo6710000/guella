import clienteApi from './clienteApi'

export const obtenerInputsEvento = (eventoId) => clienteApi.get(`/inputs/evento/${eventoId}`)

/**
 * Crea un nuevo dato de entrada (Input).
 * El payload ya no requiere 'factor_id'. Ahora debe incluir 'categoria' y 'subtipo'
 * para que el backend resuelva la Dimensión correspondiente según la región.
 */
export const crearInput = (payload) => clienteApi.post('/inputs', payload)
export const eliminarInput = (id) => clienteApi.delete(`/inputs/${id}`)
export const obtenerHistorialInput = (id) => clienteApi.get(`/inputs/${id}/historial`)
