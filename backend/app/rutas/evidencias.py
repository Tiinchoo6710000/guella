import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

from app.db.base_de_datos import obtener_db
from app.core.seguridad import obtener_usuario_actual
from app.core.permisos import verificar_propietario_evento

from app.modelos.evidencia import Evidencia
from app.modelos.evento import Evento
from app.modelos.calculo import Calculo
from app.esquemas.evidencia import EvidenciaCrear

router = APIRouter(prefix="/evidencias", tags=["Evidencias"])


@router.post("/upload")
def subir_archivo_evidencia(
    file: UploadFile = File(...),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    os.makedirs("uploads", exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join("uploads", unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo guardar el archivo: {str(e)}"
        )
        
    return {
        "url": f"/uploads/{unique_filename}",
        "filename": file.filename
    }


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


@router.delete("/{evidencia_id}")
def eliminar_evidencia(
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

    # Eliminar el archivo del almacenamiento local si aplica
    if evidencia.url.startswith("/uploads/"):
        file_path = evidencia.url.lstrip("/") # Quitar la barra inicial para la ruta relativa local
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error al eliminar archivo físico {file_path}: {e}")

    db.delete(evidencia)
    db.commit()

    return {
        "ok": True,
        "detail": "Evidencia eliminada exitosamente"
    }
