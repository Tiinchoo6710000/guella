import clienteApi from './clienteApi'

export const crearCalculo = (eventoId) => clienteApi.post(`/calculos/${eventoId}`)
export const obtenerCalculo = (id) => clienteApi.get(`/calculos/${id}`)
export const obtenerCalculoActual = (eventoId) => clienteApi.get(`/calculos/evento/${eventoId}`)
export const obtenerDetalleCalculo = (id) => clienteApi.get(`/calculos/${id}/detalle`)
export const eliminarCalculo = (id) => clienteApi.delete(`/calculos/${id}`)
