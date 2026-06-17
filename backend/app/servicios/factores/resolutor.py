from typing import Union
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.modelos.factor_emision import FactorEmision
from app.modelos.evento import Evento
from app.modelos.input_evento import InputEvento
from app.modelos.ticket_factor_mapping import TicketFactorMapping
from app.servicios.factores.region import normalizar_region

TRANSPORTES_VALIDOS = [
    "auto",
    "moto",
    "bici",
    "bus",
    "tren",
    "avion",
    "caminata"
]

def obtener_factor_por_region(db: Session, evento: Evento, categoria: str, subtipo: str):
    """
    Busca el factor (dimensión) más reciente para la región del evento basándose en la categoría y subtipo.
    Normaliza regiones (trim, minúsculas y sin acentos) para la comparación.
    """
    region_norm = normalizar_region(evento.region)
    cat_norm = categoria.strip().lower()
    sub_norm = subtipo.strip().lower()

    candidatos = (
        db.query(FactorEmision)
        .filter(
            func.lower(func.trim(FactorEmision.categoria)) == cat_norm,
            func.lower(func.trim(FactorEmision.subtipo)) == sub_norm,
        )
        .order_by(FactorEmision.version.desc(), FactorEmision.id.desc())
        .all()
    )

    for factor in candidatos:
        if normalizar_region(factor.region) == region_norm:
            return factor

    return None


def deduplicar_ultima_version(factores: list[FactorEmision]) -> list[FactorEmision]:
    """Conserva solo la versión más reciente por categoría/subtipo (lista ya ordenada por versión desc)."""
    vistos: dict[tuple[str, str], FactorEmision] = {}
    for factor in factores:
        key = (factor.categoria.strip().lower(), factor.subtipo.strip().lower())
        if key not in vistos:
            vistos[key] = factor
    return list(vistos.values())


def listar_factores_por_region_evento(db: Session, evento: Evento) -> list[FactorEmision]:
    """Factores de la región del evento, solo última versión por categoría/subtipo."""
    region_norm = normalizar_region(evento.region)
    factores = (
        db.query(FactorEmision)
        .order_by(
            FactorEmision.categoria,
            FactorEmision.subtipo,
            FactorEmision.version.desc(),
            FactorEmision.id.desc(),
        )
        .all()
    )
    de_region = [f for f in factores if normalizar_region(f.region) == region_norm]
    return deduplicar_ultima_version(de_region)

def asegurar_mappings_movilidad(db: Session, evento_o_id: Union[Evento, int]):
    """
    Verifica si existen los mappings de movilidad para el evento.
    Si faltan, intenta resolverlos automáticamente basándose en la región.
    """
    if isinstance(evento_o_id, int):
        evento = db.query(Evento).filter(Evento.id == evento_o_id).first()
    else:
        evento = evento_o_id

    if not evento:
        return

    # 1. Sincronizar Mappings de Movilidad (Tickets/Empleados)
    for transporte in TRANSPORTES_VALIDOS:
        factor = obtener_factor_por_region(db, evento, "movilidad", transporte)

        mapping_existente = db.query(TicketFactorMapping).filter(
            TicketFactorMapping.evento_id == evento.id,
            func.lower(func.trim(TicketFactorMapping.subtipo)) == transporte.lower()
        ).first()

        factor_id = factor.id if factor else None

        if mapping_existente:
            if mapping_existente.factor_id != factor_id:
                mapping_existente.factor_id = factor_id
                evento.calculo_pendiente = True
        else:
            mapping = TicketFactorMapping(
                evento_id=evento.id,
                tipo="general",
                subtipo=transporte,
                factor_id=factor_id
            )
            db.add(mapping)
            evento.calculo_pendiente = True

    # 2. Sincronizar Inputs Manuales a la última versión disponible para la región
    inputs_actuales = db.query(InputEvento).options(joinedload(InputEvento.factor)).filter(
        InputEvento.evento_id == evento.id,
        InputEvento.es_actual == True
    ).all()

    for inp in inputs_actuales:
        factor_nuevo = obtener_factor_por_region(db, evento, inp.factor.categoria, inp.factor.subtipo)
        if factor_nuevo and inp.factor_id != factor_nuevo.id:
            inp.factor_id = factor_nuevo.id
            inp.unidad = factor_nuevo.unidad
            # No modificamos el comentario aquí, ya que es un campo informativo del usuario.
            evento.calculo_pendiente = True