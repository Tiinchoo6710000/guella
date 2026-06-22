import clienteApi from './clienteApi'

export const crearEvidencia = (payload) => clienteApi.post('/evidencias', payload)
export const obtenerEvidenciasEvento = (eventoId) => clienteApi.get(`/eventos/${eventoId}/evidencias`)
export const subirArchivoEvidencia = (formData) => clienteApi.post('/evidencias/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
export const eliminarEvidencia = (evidenciaId) => clienteApi.delete(`/evidencias/${evidenciaId}`)
