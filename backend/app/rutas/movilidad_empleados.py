from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import (
    Session,
    joinedload
)

from app.db.base_de_datos import obtener_db
from app.core.seguridad import obtener_usuario_actual
from app.core.permisos import verificar_propietario_evento

from app.modelos.evento import Evento
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.input_evento import InputEvento
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.ticket_factor_mapping import TicketFactorMapping

from app.esquemas.movilidad_empleado import (
    MovilidadEmpleadoCrear
)

from app.servicios.hash_service import (
    generar_hash_evento
)
from app.servicios.factores.resolutor import asegurar_mappings_movilidad

router = APIRouter(
    prefix="/movilidad-empleados",
    tags=["Movilidad Empleados"]
)

from app.servicios.factores.resolutor import TRANSPORTES_VALIDOS

@router.post("/")
def crear_movilidad_empleado(
    datos: MovilidadEmpleadoCrear,
    db: Session = Depends(obtener_db),
    usuario_actual=Depends(
        obtener_usuario_actual
    )
):

    try:

        # =====================
        # VALIDAR EVENTO
        # =====================

        evento = db.query(
            Evento
        ).filter(
            Evento.id == datos.evento_id
        ).first()

        verificar_propietario_evento(
            evento,
            usuario_actual
        )

        # =====================
        # VALIDACIONES
        # =====================

        if datos.transporte not in TRANSPORTES_VALIDOS:
            raise HTTPException(
                400,
                "Transporte inválido"
            )

        if datos.distancia <= 0:
            raise HTTPException(
                400,
                "Distancia inválida"
            )

        if datos.cantidad_empleados <= 0:
            raise HTTPException(
                400,
                "Cantidad inválida"
            )

        if datos.tipo_fuente not in [
            "real",
            "estimado"
        ]:
            raise HTTPException(
                400,
                "tipo_fuente inválido"
            )

        # =====================
        # VALIDAR FACTOR MOVILIDAD POR EVENTO (mapping general)
        # =====================

        # Asegurar resolución automática antes de validar
        asegurar_mappings_movilidad(db, datos.evento_id)

        factor_movilidad = db.query(
            TicketFactorMapping
        ).filter(
            TicketFactorMapping.evento_id == datos.evento_id,
            TicketFactorMapping.subtipo == datos.transporte
        ).first()

        if not factor_movilidad:
            raise HTTPException(
                400,
                f"Faltan dimensiones para la región {evento.region}: {datos.transporte}"
            )

        # =====================
        # CREAR MOVILIDAD
        # =====================

        nueva = MovilidadEmpleado(
            **datos.model_dump()
        )

        db.add(nueva)

        # importante:
        # guardar temporalmente
        # sin commit
        db.flush()

        # =====================
        # RECALCULAR HASH
        # =====================

        inputs_actuales = (
            db.query(InputEvento)
            .options(
                joinedload(
                    InputEvento.factor
                )
            )
            .filter(
                InputEvento.evento_id
                == datos.evento_id,
                InputEvento.es_actual
                == True
            )
            .all()
        )

        tickets = (
            db.query(TicketAsistente)
            .options(
                joinedload(
                    TicketAsistente.movilidades
                )
            )
            .filter(
                TicketAsistente.evento_id
                == datos.evento_id
            )
            .all()
        )

        movilidad_empleados = (
            db.query(MovilidadEmpleado)
            .filter(
                MovilidadEmpleado.evento_id
                == datos.evento_id
            )
            .all()
        )

        evento.hash_datos = (
            generar_hash_evento(
                inputs=inputs_actuales,
                tickets=tickets,
                movilidad_empleados=movilidad_empleados
            )
        )
        evento.calculo_pendiente = True

        # =====================
        # COMMIT FINAL
        # =====================

        db.commit()
        db.refresh(nueva)

        return {
            "ok": True,
            "id": nueva.id
        }

    except Exception:
        db.rollback()
        raise


@router.get("/evento/{evento_id}")
def listar_movilidad_empleados_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual=Depends(
        obtener_usuario_actual
    )
):

    evento = db.query(Evento).filter(
        Evento.id == evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    movilidades = db.query(MovilidadEmpleado).filter(
        MovilidadEmpleado.evento_id == evento_id
    ).all()

    return [
        {
            "id": m.id,
            "transporte": m.transporte,
            "distancia": m.distancia,
            "cantidad_empleados": m.cantidad_empleados,
            "tipo_fuente": m.tipo_fuente,
            "comentario": m.comentario # Incluir el comentario
        }
        for m in movilidades
    ]


@router.delete("/{movilidad_id}")
def eliminar_movilidad_empleado(
    movilidad_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual=Depends(
        obtener_usuario_actual
    )
):

    movilidad = db.query(MovilidadEmpleado).filter(
        MovilidadEmpleado.id == movilidad_id
    ).first()

    if not movilidad:
        raise HTTPException(
            status_code=404,
            detail="Movilidad no encontrada"
        )

    evento = db.query(Evento).filter(
        Evento.id == movilidad.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    db.delete(movilidad)

    inputs_actuales = (
        db.query(InputEvento)
        .options(
            joinedload(
                InputEvento.factor
            )
        )
        .filter(
            InputEvento.evento_id == evento.id,
            InputEvento.es_actual == True
        )
        .all()
    )

    tickets = (
        db.query(TicketAsistente)
        .options(
            joinedload(
                TicketAsistente.movilidades
            )
        )
        .filter(
            TicketAsistente.evento_id == evento.id
        )
        .all()
    )

    movilidad_empleados = (
        db.query(MovilidadEmpleado)
        .filter(
            MovilidadEmpleado.evento_id == evento.id
        )
        .all()
    )

    db.flush()

    evento.hash_datos = (
        generar_hash_evento(
            inputs=inputs_actuales,
            tickets=tickets,
            movilidad_empleados=movilidad_empleados
        )
    )
    evento.calculo_pendiente = True
    db.commit()

    return {
        "ok": True,
        "mensaje": "Movilidad eliminada correctamente"
    }
