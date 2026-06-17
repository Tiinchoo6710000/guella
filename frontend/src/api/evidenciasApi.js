import clienteApi from './clienteApi'

export const crearEvidencia = (payload) => clienteApi.post('/evidencias', payload)
export const obtenerEvidenciasEvento = (eventoId) => clienteApi.get(`/eventos/${eventoId}/evidencias`)
