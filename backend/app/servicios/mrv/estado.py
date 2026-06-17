def calcular_estado(
    inputs,
    movilidad_empleados=None
):

    movilidad_empleados = (
        movilidad_empleados or []
    )

    fuentes = []

    # INPUTS
    for i in inputs:
        fuentes.append(
            i.tipo_fuente
        )

    # MOVILIDAD EMPLEADOS
    for m in movilidad_empleados:
        fuentes.append(
            m.tipo_fuente
        )

    if len(fuentes) == 0:
        return "estimado"

    reales = len([
        f for f in fuentes
        if f == "real"
    ])

    ratio = reales / len(fuentes)

    if ratio >= 0.8:
        return "verificado"

    return "estimado"