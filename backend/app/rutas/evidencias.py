from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db
from app.core.seguridad import obtener_usuario_actual
from app.core.permisos import verificar_propietario_evento

from app.modelos.evidencia import Evidencia
from app.modelos.evento import Evento
from app.modelos.calculo import Calculo
from app.esquemas.evidencia import EvidenciaCrear

router = APIRouter(prefix="/evidencias", tags=["Evidencias"])


@router.post("/")
def crear_evidencia(
    datos: EvidenciaCrear,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):

    evento = db.query(Evento).filter(
        Evento.id == datos.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    if datos.calculo_id:
        calculo = db.query(Calculo).filter(
            Calculo.id == datos.calculo_id,
            Calculo.evento_id == datos.evento_id
        ).first()

        if not calculo:
            raise HTTPException(
                status_code=400,
                detail="Cálculo no válido para este evento"
            )

    evidencia = Evidencia(
        evento_id=datos.evento_id,
        calculo_id=datos.calculo_id,
        filename=datos.filename,
        url=datos.url,
        tipo=datos.tipo
    )

    db.add(evidencia)
    db.commit()
    db.refresh(evidencia)

    return {
        "ok": True,
        "evidencia_id": evidencia.id
    }


@router.get("/{evidencia_id}")
def obtener_evidencia(
    evidencia_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):

    evidencia = db.query(Evidencia).filter(
        Evidencia.id == evidencia_id
    ).first()

    if not evidencia:
        raise HTTPException(
            status_code=404,
            detail="Evidencia no encontrada"
        )

    evento = db.query(Evento).filter(
        Evento.id == evidencia.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    return {
        "id": evidencia.id,
        "evento_id": evidencia.evento_id,
        "calculo_id": evidencia.calculo_id,
        "filename": evidencia.filename,
        "url": evidencia.url,
        "tipo": evidencia.tipo,
        "creado_en": evidencia.creado_en
    }
