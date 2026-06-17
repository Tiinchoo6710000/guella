from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.db.base_de_datos import obtener_db
from app.modelos.input_evento import InputEvento
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.esquemas.input_evento import InputEventoCrear
from app.core.seguridad import obtener_usuario_actual
from app.core.permisos import verificar_propietario_evento
from app.servicios.hash_service import generar_hash_evento
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.servicios.factores.resolutor import obtener_factor_por_region, asegurar_mappings_movilidad

router = APIRouter(prefix="/inputs", tags=["Inputs"])

@router.post("/")
def crear_input(
    datos: InputEventoCrear,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    try:

        evento = db.query(Evento).filter(
            Evento.id == datos.evento_id
        ).first()

        verificar_propietario_evento(
            evento,
            usuario_actual
        )

        # AUTOMATISMO PURO: Resolvemos por región.
        categoria = datos.categoria
        subtipo = datos.subtipo

        # Si el frontend no mandó categoría/subtipo (como sucede en el formulario manual actual),
        # las obtenemos del factor_id para poder aplicar la lógica de resolución regional.
        if (not categoria or not subtipo) and getattr(datos, 'factor_id', None):
            f_ref = db.query(FactorEmision).filter(FactorEmision.id == datos.factor_id).first()
            if f_ref:
                categoria = f_ref.categoria
                subtipo = f_ref.subtipo

        if not categoria or not subtipo:
             raise HTTPException(400, "Se requiere categoría y subtipo para asignación automática.")
        
        # RESOLUCIÓN AUTOMÁTICA: Buscamos el factor por la región del evento
        factor = obtener_factor_por_region(db, evento, categoria, subtipo)

        if not factor:
            raise HTTPException(
                400,
                f"No existe un factor de emisión cargado para la región '{evento.region}' en la categoría '{categoria}' ({subtipo})."
            )

        if datos.valor <= 0:
            raise HTTPException(
                400,
                "El valor debe ser mayor a 0"
            )

        if datos.tipo_fuente not in [
            "real",
            "estimado"
        ]:
            raise HTTPException(
                400,
                "tipo_fuente inválido"
            )

        # ==========================
        # VERSIONADO
        # ==========================

        ultimo = db.query(
            func.max(InputEvento.version)
        ).filter(
            InputEvento.evento_id == datos.evento_id,
            InputEvento.factor_id == factor.id
        ).scalar()

        if not ultimo:
            ultimo = 0

        db.query(InputEvento).filter(
            InputEvento.evento_id == datos.evento_id,
            InputEvento.factor_id == factor.id,
            InputEvento.es_actual == True
        ).update({
            "es_actual": False
        })

        nuevo_input = InputEvento(
            evento_id=datos.evento_id,
            factor_id=factor.id,
            valor=datos.valor,
            unidad=factor.unidad,
            tipo_fuente=datos.tipo_fuente,
            comentario=datos.comentario, # Guardar el comentario
            version=ultimo + 1, 
            es_actual=True
        )

        db.add(nuevo_input)

        # importante:
        # flush sin commit
        db.flush()

        # ==========================
        # RECALCULAR HASH
        # ==========================

        inputs_actuales = db.query(
            InputEvento
        ).options(
            joinedload(InputEvento.factor)
        ).filter(
            InputEvento.evento_id == datos.evento_id,
            InputEvento.es_actual == True
        ).all()

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
        
        evento.hash_datos = generar_hash_evento(
            inputs=inputs_actuales,
            tickets=tickets,
            movilidad_empleados=movilidad_empleados
        )
        evento.calculo_pendiente = True

        # ==========================
        # COMMIT FINAL
        # ==========================

        db.commit()

        db.refresh(nuevo_input)

        return {
            "ok": True,
            "mensaje": "Input versionado correctamente",
            "input_id": nuevo_input.id,
            "version": nuevo_input.version
        }

    except Exception:
        db.rollback()
        raise



@router.get("/evento/{evento_id}")
def listar_inputs_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):

    evento = db.query(Evento).filter(
        Evento.id == evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    # Asegurar que los inputs mostrados usen las dimensiones (factores) más recientes
    asegurar_mappings_movilidad(db, evento)
    db.commit()
    db.refresh(evento)

    inputs = (
        db.query(InputEvento)
        .options(
            joinedload(InputEvento.factor)
        )
        .filter(
            InputEvento.evento_id == evento_id,
            InputEvento.es_actual == True
        )
        .all()
    )

    resultado = []

    for input_item in inputs:

        resultado.append({
            "id": input_item.id,
            "evento_id": input_item.evento_id,
            "factor_id": input_item.factor_id,

            "categoria": input_item.factor.categoria,
            "subcategoria": input_item.factor.subtipo,

            "valor": input_item.valor,
            "unidad": input_item.unidad,
            "tipo_fuente": input_item.tipo_fuente,
            "comentario": input_item.comentario, # Incluir el comentario

            "version": input_item.version,
            "es_actual": input_item.es_actual,
            "creado_en": input_item.creado_en
        })

    return resultado


@router.get("/{input_id}/historial")
def historial_input(
    input_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):

    input_actual = db.query(InputEvento).filter(
        InputEvento.id == input_id
    ).first()

    if not input_actual:
        raise HTTPException(
            status_code=404,
            detail="Input no encontrado"
        )

    evento = db.query(Evento).filter(
        Evento.id == input_actual.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    historial = (
        db.query(InputEvento)
        .options(
            joinedload(InputEvento.factor)
        )
        .filter(
            InputEvento.evento_id == input_actual.evento_id,
            InputEvento.factor_id == input_actual.factor_id
        )
        .order_by(
            InputEvento.version.desc()
        )
        .all()
    )

    resultado = []

    for input_item in historial:

        resultado.append({
            "id": input_item.id,
            "evento_id": input_item.evento_id,
            "factor_id": input_item.factor_id,

            "categoria": input_item.factor.categoria,
            "subcategoria": input_item.factor.subtipo,

            "valor": input_item.valor,
            "unidad": input_item.unidad,
            "tipo_fuente": input_item.tipo_fuente,
            "comentario": input_item.comentario, # Incluir el comentario

            "version": input_item.version,
            "es_actual": input_item.es_actual,
            "creado_en": input_item.creado_en
        })

    return resultado


@router.delete("/{input_id}")
def eliminar_input(
    input_id: int,
    db: Session = Depends(obtener_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):

    input_item = db.query(InputEvento).filter(
        InputEvento.id == input_id
    ).first()

    if not input_item:
        raise HTTPException(
            status_code=404,
            detail="Input no encontrado"
        )

    evento = db.query(Evento).filter(
        Evento.id == input_item.evento_id
    ).first()

    verificar_propietario_evento(
        evento,
        usuario_actual
    )

    if input_item.es_actual:
        anterior = db.query(InputEvento).filter(
            InputEvento.evento_id == input_item.evento_id,
            InputEvento.factor_id == input_item.factor_id,
            InputEvento.id != input_item.id
        ).order_by(
            InputEvento.version.desc()
        ).first()

        if anterior:
            anterior.es_actual = True

    db.delete(input_item)

    inputs_actuales = db.query(
        InputEvento
    ).options(
        joinedload(InputEvento.factor)
    ).filter(
        InputEvento.evento_id == input_item.evento_id,
        InputEvento.es_actual == True
    ).all()

    tickets = (
        db.query(TicketAsistente)
        .options(
            joinedload(
                TicketAsistente.movilidades
            )
        )
        .filter(
            TicketAsistente.evento_id == input_item.evento_id
        )
        .all()
    )

    movilidad_empleados = (
        db.query(MovilidadEmpleado)
        .filter(
            MovilidadEmpleado.evento_id == input_item.evento_id
        )
        .all()
    )

    db.flush()

    evento.hash_datos = generar_hash_evento(
        inputs=inputs_actuales,
        tickets=tickets,
        movilidad_empleados=movilidad_empleados
    )
    evento.calculo_pendiente = True
    db.commit()

    return {
        "ok": True,
        "mensaje": "Input eliminado correctamente"
    }
