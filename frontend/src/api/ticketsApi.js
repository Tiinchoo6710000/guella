import clienteApi from './clienteApi'

export const obtenerTicketsEvento = (eventoId) => clienteApi.get(`/webhooks/tickets/${eventoId}`)
