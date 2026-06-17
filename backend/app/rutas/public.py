from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db
from app.modelos.calculo import Calculo
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.evento import Evento

router = APIRouter(prefix="/public", tags=["Public"])


def construir_respuesta_publica(public_slug: str, db: Session):
    evento = db.query(Evento).filter(Evento.public_slug == public_slug).first()

    if not evento:
        raise HTTPException(
            status_code=404,
            detail="Evento público no encontrado"
        )

    calculo_actual = db.query(Calculo).filter(
        Calculo.evento_id == evento.id,
        Calculo.es_actual == True
    ).first()

    detalles = []
    if calculo_actual:
        detalles = [
            {
                "categoria": detalle.categoria,
                "subtipo": detalle.subtipo,
                "emisiones": detalle.emisiones,
                "origen": detalle.origen
            }
            for detalle in db.query(DetalleCalculo).filter(
                DetalleCalculo.calculo_id == calculo_actual.id
            ).all()
        ]

    return {
        "id": evento.id,
        "nombre": evento.nombre,
        "fecha": evento.fecha,
        "pais": evento.pais,
        "region": evento.region,
        "ciudad": evento.ciudad,
        "cantidad_asistentes": evento.cantidad_asistentes,
        "public_slug": evento.public_slug,
        "hash_resultado": evento.hash_resultado,
        "calculo": {
            "id": calculo_actual.id,
            "total": calculo_actual.total,
            "total_kgco2e": calculo_actual.total,
            "estado": calculo_actual.estado,
            "version": calculo_actual.version
        } if calculo_actual else None,
        "detalles": detalles
    }


@router.get("/evento/{public_slug}")
def obtener_evento_publico(
    public_slug: str,
    db: Session = Depends(obtener_db)
):
    return construir_respuesta_publica(public_slug, db)


@router.get("/{public_slug}")
def obtener_evento_publico_compatibilidad(
    public_slug: str,
    db: Session = Depends(obtener_db)
):
    return construir_respuesta_publica(public_slug, db)
