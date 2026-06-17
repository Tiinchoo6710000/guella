import clienteApi from './clienteApi'

export const obtenerMappings = (eventoId, tipo) => clienteApi.get(`/eventos/${eventoId}/movilidad-factor-mapping/${tipo}`)

/**
 * DEPRECATED: La asignación de Dimensiones de movilidad ahora es automática en el backend.
 * Se mantiene este export para evitar errores de importación en la UI mientras se eliminan las llamadas.
 */
export const guardarMappings = () => {
  console.warn('guardarMappings ha sido desactivado. El sistema ahora mapea dimensiones automáticamente por región.')
  return Promise.resolve({ data: { mensaje: "Asignación automática activada" } })
}
