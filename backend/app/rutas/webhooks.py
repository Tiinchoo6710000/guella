from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import (
    Session,
    joinedload
)

from app.db.base_de_datos import (
    obtener_db
)

from app.core.seguridad import (
    obtener_usuario_actual
)

from app.core.permisos import (
    verificar_propietario_evento
)

from app.modelos.evento import (
    Evento
)

from app.modelos.input_evento import (
    InputEvento
)

from app.modelos.ticket_asistente import (
    TicketAsistente
)

from app.modelos.movilidad_ticket import (
    MovilidadTicket
)

from app.modelos.movilidad_empleado import (
    MovilidadEmpleado
)

from app.esquemas.ticket_asistente import (
    TicketAsistenteCrear
)

from app.servicios.hash_service import (
    generar_hash_evento
)


router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"]
)


TRANSPORTES_VALIDOS = [
    "auto",
    "moto",
    "bici",
    "bus",
    "tren",
    "avion",
    "caminata"
]


@router.post("/tickets")
def recibir_ticket(
    datos: TicketAsistenteCrear,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(
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
        # VALIDAR TICKET
        # =====================

        if not datos.ticket_id.strip():
            raise HTTPException(
                status_code=400,
                detail="ticket_id inválido"
            )

        ticket_existente = db.query(
            TicketAsistente
        ).filter(
            TicketAsistente.ticket_id
            == datos.ticket_id,
            TicketAsistente.evento_id
            == datos.evento_id
        ).first()

        if ticket_existente:
            raise HTTPException(
                status_code=400,
                detail="El ticket ya existe en este evento"
            )

        # =====================
        # VALIDAR MOVILIDADES
        # =====================

        if len(datos.movilidades) == 0:
            raise HTTPException(
                status_code=400,
                detail="Debe existir al menos una movilidad"
            )

        if len(datos.movilidades) > 5:
            raise HTTPException(
                status_code=400,
                detail="Máximo 5 movilidades por ticket"
            )

        for movilidad in datos.movilidades:

            if not movilidad.transporte.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Transporte inválido"
                )

            if movilidad.transporte not in TRANSPORTES_VALIDOS:
                raise HTTPException(
                    status_code=400,
                    detail="Transporte inválido"
                )

            if movilidad.distancia <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="La distancia debe ser mayor a 0"
                )

        # =====================
        # PERSISTIR
        # =====================

        nuevo_ticket = TicketAsistente(
            ticket_id=datos.ticket_id,
            evento_id=datos.evento_id
        )

        db.add(nuevo_ticket)

        # necesitamos el ID real
        db.flush()

        for movilidad in datos.movilidades:

            nueva_movilidad = MovilidadTicket(
                transporte=movilidad.transporte,
                distancia=movilidad.distancia,
                ticket_id=nuevo_ticket.id
            )

            db.add(nueva_movilidad)

        # =====================
        # ACTUALIZAR HASH
        # =====================

        inputs_actuales = (
            db.query(InputEvento)
            .options(
                joinedload(InputEvento.factor)
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

        return {
            "ok": True,
            "mensaje": "Ticket registrado correctamente",
            "ticket_id": datos.ticket_id,
            "evento_id": datos.evento_id,
            "movilidades": len(
                datos.movilidades
            )
        }

    except Exception:
        db.rollback()
        raise


@router.get("/tickets/{evento_id}")
def listar_tickets_evento(
    evento_id: int,
    db: Session = Depends(
        obtener_db
    ),
    usuario_actual: dict = Depends(
        obtener_usuario_actual
    )
):

    evento = db.query(
        Evento
    ).filter(
        Evento.id == evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
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
            == evento_id
        )
        .all()
    )

    resultado = []

    for ticket in tickets:

        resultado.append({
            "id": ticket.id,
            "ticket_id": ticket.ticket_id,
            "movilidades": [
                {
                    "transporte": m.transporte,
                    "distancia": m.distancia
                }
                for m in ticket.movilidades
            ]
        })

    return resultado


@router.delete("/tickets/{ticket_id}")
def eliminar_ticket(
    ticket_id: int,
    db: Session = Depends(
        obtener_db
    ),
    usuario_actual: dict = Depends(
        obtener_usuario_actual
    )
):

    ticket = db.query(
        TicketAsistente
    ).filter(
        TicketAsistente.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket no encontrado"
        )

    evento = db.query(
        Evento
    ).filter(
        Evento.id == ticket.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    db.delete(ticket)

    inputs_actuales = (
        db.query(InputEvento)
        .options(
            joinedload(InputEvento.factor)
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
        "mensaje": "Ticket eliminado correctamente"
    }
