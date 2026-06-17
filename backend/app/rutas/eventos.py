import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import OperationalError
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.permisos import verificar_propietario_evento
from app.core.seguridad import asegurar_admin_fijo, obtener_usuario_actual
from app.db.base_de_datos import obtener_db
from app.esquemas.evento import EventoCrear
from app.modelos.calculo import Calculo
from app.modelos.evidencia import Evidencia
from app.modelos.evento import Evento
from app.modelos.input_evento import InputEvento
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.ticket_asistente import TicketAsistente
from app.servicios.factores.resolutor import asegurar_mappings_movilidad

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/eventos", tags=["Eventos"])


def serializar_evento(evento, calculo_actual=None):
    return {
        "id": evento.id,
        "nombre": evento.nombre,
        "fecha": evento.fecha,
        "pais": evento.pais,
        "region": evento.region,
        "ciudad": evento.ciudad,
        "cantidad_asistentes": evento.cantidad_asistentes,
        "estado": evento.estado,
        "calculo_pendiente": evento.calculo_pendiente,
        "public_slug": evento.public_slug,
        "public_url": f"/public/evento/{evento.public_slug}" if evento.public_slug else None,
        "hash_datos": evento.hash_datos,
        "hash_resultado": evento.hash_resultado,
        "calculo_actual": (
            {
                "id": calculo_actual.id,
                "total": calculo_actual.total,
                "version": calculo_actual.version,
                "estado": calculo_actual.estado,
                "es_actual": calculo_actual.es_actual
            }
            if calculo_actual
            else None
        )
    }


@router.post("")
def crear_evento(
    datos: EventoCrear,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    if datos.cantidad_asistentes <= 0:
        raise HTTPException(
            status_code=400,
            detail="La cantidad de asistentes debe ser mayor a 0"
        )

    try:
        asegurar_admin_fijo(db)

        # Manejo robusto de usuario_actual (soporta dict o objeto)
        id_usuario = usuario_actual.get("id") if isinstance(usuario_actual, dict) else getattr(usuario_actual, "id", None)

        evento = Evento(
            nombre=datos.nombre.strip(),
            fecha=datos.fecha,
            pais=datos.pais.strip(),
            region=datos.region.strip(),
            ciudad=datos.ciudad.strip(),
            cantidad_asistentes=datos.cantidad_asistentes,
            usuario_id=id_usuario
        )

        db.add(evento)
        db.flush() # Usamos flush para obtener el ID sin cerrar la transacción

        # Asegurar mappings iniciales pasando el objeto evento para evitar re-consultas
        asegurar_mappings_movilidad(db, evento)

        db.commit()
        db.refresh(evento)

    except OperationalError:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="No se puede conectar a la base de datos. Verifique que PostgreSQL esté en ejecución y que DATABASE_URL sea correcta."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear evento: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al crear el evento: {str(e)}"
        )

    return serializar_evento(evento)


@router.get("")
def listar_eventos(
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    eventos = db.query(Evento).order_by(Evento.fecha.desc(), Evento.id.desc()).all()
    evento_ids = [evento.id for evento in eventos]
    calculos_actuales = {
        calculo.evento_id: calculo
        for calculo in db.query(Calculo).filter(
            Calculo.evento_id.in_(evento_ids),
            Calculo.es_actual == True
        ).all()
    }

    return [
        serializar_evento(evento, calculos_actuales.get(evento.id))
        for evento in eventos
    ]


@router.get("/{evento_id}")
def obtener_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario_actual)

    # Sincronización automática de dimensiones al consultar el detalle
    asegurar_mappings_movilidad(db, evento)
    db.commit()
    db.refresh(evento)

    calculo_actual = db.query(Calculo).filter(
        Calculo.evento_id == evento_id,
        Calculo.es_actual == True
    ).first()

    return serializar_evento(evento, calculo_actual)


@router.get("/{evento_id}/calculos")
def listar_calculos_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario_actual)

    calculos = db.query(Calculo).filter(
        Calculo.evento_id == evento_id
    ).order_by(Calculo.version.desc()).all()

    return [
        {
            "id": calculo.id,
            "evento_id": calculo.evento_id,
            "version": calculo.version,
            "total": calculo.total,
            "estado": calculo.estado,
            "es_actual": calculo.es_actual
        }
        for calculo in calculos
    ]


@router.get("/{evento_id}/resumen")
def obtener_resumen_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario_actual)

    # Sincronización proactiva: asegura mapeos incluso si los factores se crearon después del evento
    asegurar_mappings_movilidad(db, evento)
    db.commit()
    db.refresh(evento)

    calculo_actual = db.query(Calculo).filter(
        Calculo.evento_id == evento_id,
        Calculo.es_actual == True
    ).first()

    resumen = serializar_evento(evento, calculo_actual)
    resumen.update({
        "inputs_count": db.query(InputEvento).filter(
            InputEvento.evento_id == evento_id,
            InputEvento.es_actual == True
        ).count(),
        "tickets_count": db.query(TicketAsistente).filter(
            TicketAsistente.evento_id == evento_id
        ).count(),
        "movilidades_count": db.query(MovilidadEmpleado).filter(
            MovilidadEmpleado.evento_id == evento_id
        ).count(),
        "evidencias_count": db.query(Evidencia).filter(
            Evidencia.evento_id == evento_id
        ).count()
    })
    return resumen


@router.get("/{evento_id}/evidencias")
def listar_evidencias_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario_actual)

    evidencias = db.query(Evidencia).filter(
        Evidencia.evento_id == evento_id
    ).order_by(Evidencia.id.desc()).all()

    return [
        {
            "id": evidencia.id,
            "evento_id": evidencia.evento_id,
            "calculo_id": evidencia.calculo_id,
            "filename": evidencia.filename,
            "url": evidencia.url,
            "tipo": evidencia.tipo,
            "creado_en": evidencia.creado_en
        }
        for evidencia in evidencias
    ]


@router.delete("/{evento_id}")
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario_actual)

    db.delete(evento)
    db.commit()

    return {
        "ok": True,
        "mensaje": "Evento eliminado correctamente"
    }
