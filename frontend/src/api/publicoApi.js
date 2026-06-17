import clienteApi from './clienteApi'

export const obtenerPublico = (slug) => clienteApi.get(`/public/${slug}`)
