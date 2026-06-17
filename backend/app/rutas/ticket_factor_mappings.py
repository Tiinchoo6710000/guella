from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.base_de_datos import obtener_db
from app.core.seguridad import obtener_usuario_actual
from app.core.permisos import verificar_propietario_evento
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.ticket_factor_mapping import TicketFactorMapping

from app.esquemas.ticket_factor_mapping import (
    TicketFactorMappingGuardar,
    TicketFactorMappingRespuesta,
    TicketFactorItemRespuesta
)
from app.servicios.factores.resolutor import asegurar_mappings_movilidad, TRANSPORTES_VALIDOS


router = APIRouter(prefix="/eventos", tags=["TicketFactorMapping"])


def validar_tipo(tipo: str):
    # Permitimos 'ticket', 'empleado' o 'general' para simplificar mapeo único por evento
    if tipo not in ["ticket", "empleado", "general"]:
        raise HTTPException(status_code=400, detail="Tipo inválido. Use 'ticket', 'empleado' o 'general'.")


@router.get("/{evento_id}/movilidad-factor-mapping/{tipo}", response_model=TicketFactorMappingRespuesta)
def obtener_mappings(evento_id: int, tipo: str, db: Session = Depends(obtener_db), usuario=Depends(obtener_usuario_actual)):
    validar_tipo(tipo)
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario)

    # 1. Ejecutamos la resolución automática por región antes de devolver nada
    asegurar_mappings_movilidad(db, evento_id)
    db.commit()

    # 2. Devolvemos los mappings del evento. Ignoramos el 'tipo' en el filtro de la DB
    # para asegurar que el frontend siempre vea los mappings 'general' que auto-creamos.
    mappings = db.query(TicketFactorMapping).filter(
        TicketFactorMapping.evento_id == evento_id
    ).options(joinedload(TicketFactorMapping.factor)).all()

    items = []
    for m in mappings:
        items.append(TicketFactorItemRespuesta(
            subtipo=m.subtipo,
            factor_id=m.factor_id,
            factor_valor=getattr(m.factor, 'valor', None),
            factor_version=getattr(m.factor, 'version', None),
            factor_fuente=getattr(m.factor, 'fuente', None),
            factor_unidad=getattr(m.factor, 'unidad', None),
            label=f"{m.subtipo} - {getattr(m.factor, 'fuente', 'Sin asignar')}"
        ))

    return {"mappings": items}

# SE ELIMINÓ EL ENDPOINT PUT guardar_mappings PARA EVITAR SELECCIÓN MANUAL
