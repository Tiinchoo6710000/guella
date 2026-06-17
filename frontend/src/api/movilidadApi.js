import clienteApi from './clienteApi'

export const crearMovilidad = (payload) => clienteApi.post('/movilidad-empleados', payload)
export const obtenerMovilidadEvento = (eventoId) => clienteApi.get(`/movilidad-empleados/evento/${eventoId}`)
export const eliminarMovilidad = (id) => clienteApi.delete(`/movilidad-empleados/${id}`)
