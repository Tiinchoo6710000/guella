import clienteApi from './clienteApi'

export const obtenerEventos = () => clienteApi.get('/eventos')
export const crearEvento = (payload) => clienteApi.post('/eventos', payload)
export const obtenerEvento = (id) => clienteApi.get(`/eventos/${id}`)
export const eliminarEvento = (id) => clienteApi.delete(`/eventos/${id}`)
export const obtenerResumenEvento = (id) => clienteApi.get(`/eventos/${id}/resumen`)
export const obtenerCalculosEvento = (id) => clienteApi.get(`/eventos/${id}/calculos`)
