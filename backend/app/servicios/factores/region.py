import unicodedata


def normalizar_region(region: str) -> str:
    """Compara regiones sin distinguir mayúsculas, espacios ni acentos."""
    if not region:
        return ""
    texto = region.strip().casefold()
    descompuesto = unicodedata.normalize("NFD", texto)
    return "".join(c for c in descompuesto if not unicodedata.combining(c))
