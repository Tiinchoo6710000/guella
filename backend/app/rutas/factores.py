from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from app.core.seguridad import obtener_usuario_actual
from app.db.base_de_datos import obtener_db
from app.esquemas.factor_emision import FactorCrear
from app.modelos.factor_emision import FactorEmision
from app.modelos.evento import Evento
from app.modelos.input_evento import InputEvento
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.ticket_factor_mapping import TicketFactorMapping
from app.servicios.mrv.validador import validar_factor
from app.servicios.factores.region import normalizar_region
from app.servicios.factores.resolutor import listar_factores_por_region_evento

router = APIRouter(prefix="/factores", tags=["Factores de Emisión"])


def serializar_factor(factor):
    return {
        "id": factor.id,
        "categoria": factor.categoria,
        "subtipo": factor.subtipo,
        "valor": factor.valor,
        "unidad": factor.unidad,
        "fuente": factor.fuente,
        "version": factor.version,
        "vigencia": factor.vigencia,
        "region": factor.region,
        "comentario": factor.comentario,
        "label": f"{factor.subtipo} ({factor.fuente} v{factor.version} - {factor.region})"
    }


@router.post("/")
def crear_factor(
    datos: FactorCrear,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    datos.region = datos.region.strip()
    region_norm = normalizar_region(datos.region)

    candidatos = db.query(FactorEmision).filter(
        FactorEmision.categoria == datos.categoria,
        FactorEmision.subtipo == datos.subtipo,
        FactorEmision.version == datos.version,
        FactorEmision.vigencia == datos.vigencia,
    ).all()
    existente = next(
        (f for f in candidatos if normalizar_region(f.region) == region_norm),
        None,
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un factor con la misma categoría, subtipo, versión y vigencia"
        )

    nuevo_factor = FactorEmision(**datos.model_dump())
    validar_factor(nuevo_factor)

    db.add(nuevo_factor)
    db.commit()
    db.refresh(nuevo_factor)

    return serializar_factor(nuevo_factor)


@router.get("/")
def listar_factores(
    evento_id: Optional[int] = Query(None),
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if evento_id:
        evento = db.query(Evento).filter(Evento.id == evento_id).first()
        if not evento:
            return []
        factores = listar_factores_por_region_evento(db, evento)
        return [serializar_factor(factor) for factor in factores]

    factores = db.query(FactorEmision).order_by(
        FactorEmision.categoria,
        FactorEmision.subtipo,
        FactorEmision.version.desc(),
        FactorEmision.id.desc(),
    ).all()

    return [serializar_factor(factor) for factor in factores]

@router.delete("/{factor_id}")
def eliminar_factor(
    factor_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    factor = db.query(FactorEmision).filter(FactorEmision.id == factor_id).first()
    if not factor:
        raise HTTPException(status_code=404, detail="Factor no encontrado")

    try:
        # Verificación explícita antes de intentar borrar
        if db.query(InputEvento).filter(InputEvento.factor_id == factor_id).first():
            raise HTTPException(status_code=400, detail="El factor aún tiene datos de entrada vinculados (InputEvento).")
        
        if db.query(TicketFactorMapping).filter(TicketFactorMapping.factor_id == factor_id).first():
            raise HTTPException(status_code=400, detail="El factor está siendo usado en un mapeo de movilidad (TicketFactorMapping).")
        
        if db.query(DetalleCalculo).filter(DetalleCalculo.factor_id == factor_id).first():
            raise HTTPException(status_code=400, detail="El factor es parte de un historial de cálculo (DetalleCalculo).")

        db.delete(factor)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Error de integridad: Este factor todavía está referenciado en la base de datos por registros que no fueron eliminados."
        )
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    return {"ok": True, "mensaje": "Factor eliminado correctamente"}
