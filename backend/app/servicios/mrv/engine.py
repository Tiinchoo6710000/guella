from app.servicios.mrv.estrategias.energia import EstrategiaEnergia
from app.servicios.mrv.estrategias.residuos import EstrategiaResiduos
from app.servicios.mrv.estrategias.agua import EstrategiaAgua
from app.servicios.mrv.estrategias.catering import EstrategiaCatering
from app.servicios.mrv.estrategias.produccion import EstrategiaProduccion
from app.servicios.mrv.estrategias.movilidad import EstrategiaMovilidad



def ejecutar_mrv(inputs,tickets,movilidad_empleados,factores,ticket_factor_mappings=None, empleado_factor_mappings=None):

    estrategias = [
        EstrategiaEnergia(factores),
        EstrategiaResiduos(factores),
        EstrategiaAgua(factores),
        EstrategiaCatering(factores),
        EstrategiaProduccion(factores),
        EstrategiaMovilidad(factores, ticket_factor_mappings, empleado_factor_mappings)
    ]

    total = 0
    detalles = []

    for estrategia in estrategias:

        subtotal, detalles_estrategia = estrategia.calcular(
        inputs,
        tickets,
        movilidad_empleados
    )

        total += subtotal
        detalles.extend(detalles_estrategia)

    return total, detalles