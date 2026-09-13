from fastapi import HTTPException


CATEGORIAS = {
    "energia": [
        "electricidad",
        "diesel_generador",
        "nafta_generador",
        "solar"
    ],

    "residuos": [
        "reciclable",
        "organico",
        "rechazo"
    ],

    "agua": [
        "red",
        "transportada"
    ],

    "catering": [
        "carne",
        "vegano",
        "vegetariano",
        "bebidas"
    ],

    "produccion": [
        "papel",
        "plastico",
        "textil",
        "madera"
    ],

    "movilidad": [
        "auto",
        "moto",
        "bici",
        "bus",
        "tren",
        "avion",
        "caminata"
    ]
}


# ==========================
# CONTRATO DE UNIDADES
# ==========================

UNIDADES_POR_SUBTIPO = {

    # ==========================
    # ENERGÍA
    # ==========================
    ("energia", "electricidad"): "kwh",
    ("energia", "diesel_generador"): "m3",
    ("energia", "nafta_generador"): "m3",
    ("energia", "solar"): "kwh",

    # ==========================
    # RESIDUOS
    # ==========================
    ("residuos", "reciclable"): "kg",
    ("residuos", "organico"): "kg",
    ("residuos", "rechazo"): "kg",

    # ==========================
    # AGUA
    # ==========================
    ("agua", "red"): "m3",
    ("agua", "transportada"): "m3",

    # ==========================
    # CATERING
    # ==========================
    ("catering", "carne"): "kg",
    ("catering", "vegano"): "kg",
    ("catering", "vegetariano"): "kg",
    ("catering", "bebidas"): "m3",

    # ==========================
    # PRODUCCIÓN
    # ==========================
    ("produccion", "papel"): "kg",
    ("produccion", "plastico"): "kg",
    ("produccion", "textil"): "kg",
    ("produccion", "madera"): "kg",

    # ==========================
    # MOVILIDAD
    # ==========================
    ("movilidad", "auto"): "km",
    ("movilidad", "moto"): "km",
    ("movilidad", "bici"): "km",
    ("movilidad", "bus"): "km",
    ("movilidad", "tren"): "km",
    ("movilidad", "avion"): "km",
    ("movilidad", "caminata"): "km",
}


def validar_factor(factor):

    # ==========================
    # 1. categoría válida
    # ==========================
    if factor.categoria not in CATEGORIAS:
        raise HTTPException(
            status_code=400,
            detail="Categoría inválida"
        )

    # ==========================
    # 2. subtipo válido
    # ==========================
    if factor.subtipo not in CATEGORIAS[factor.categoria]:
        raise HTTPException(
            status_code=400,
            detail="Subtipo inválido para la categoría"
        )

    # ==========================
    # 3. unidad válida
    # ==========================
    unidad_esperada = UNIDADES_POR_SUBTIPO.get(
        (factor.categoria, factor.subtipo)
    )

    if not unidad_esperada:
        raise HTTPException(
            status_code=400,
            detail="No existe regla de unidad para este factor"
        )

    if factor.unidad != unidad_esperada:
        raise HTTPException(
            status_code=400,
            detail=f"Unidad inválida. Se espera: {unidad_esperada}"
        )