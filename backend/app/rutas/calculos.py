import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.permisos import verificar_propietario_evento
from app.core.seguridad import obtener_usuario_actual
from app.db.base_de_datos import obtener_db
from app.modelos.calculo import Calculo
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.input_evento import InputEvento
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.ticket_factor_mapping import TicketFactorMapping
from app.servicios.hash_service import generar_hash_evento
from app.servicios.mrv.engine import ejecutar_mrv
from app.servicios.mrv.estado import calcular_estado
from app.servicios.factores.resolutor import asegurar_mappings_movilidad, TRANSPORTES_VALIDOS

router = APIRouter(prefix="/calculos", tags=["Calculos"])


def serializar_calculo(calculo):
    return {
        "id": calculo.id,
        "evento_id": calculo.evento_id,
        "total": calculo.total,
        "total_kgco2e": calculo.total,
        "estado": calculo.estado,
        "version": calculo.version,
        "es_actual": calculo.es_actual
    }


@router.get("/{calculo_id}/detalle")
def obtener_detalle_calculo(
    calculo_id: int,
    db: Session = Depends(obtener_db),
    usuario=Depends(obtener_usuario_actual)
):
    calculo = db.query(Calculo).filter(Calculo.id == calculo_id).first()
    if not calculo:
        raise HTTPException(404, "Cálculo no encontrado")

    evento = db.query(Evento).filter(Evento.id == calculo.evento_id).first()
    verificar_propietario_evento(evento, usuario)

    return db.query(DetalleCalculo).filter(
        DetalleCalculo.calculo_id == calculo_id
    ).all()


@router.post("/{evento_id}")
def calcular_evento(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario=Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario)

    # 1. Asegurar que los mappings de movilidad existan y sean los más recientes para la región
    asegurar_mappings_movilidad(db, evento_id)

    # LAS DE MOVILIDAD SI O SI TIENEN QUE ESTAR TODAS CARGADAS PARA PODER CALCULAR
    # cargamos todos los mappings asociados al evento (sin discriminar por tipo)
    mappings = db.query(TicketFactorMapping).filter(
        TicketFactorMapping.evento_id == evento_id
    ).options(joinedload(TicketFactorMapping.factor)).all()

    faltantes = set(TRANSPORTES_VALIDOS) - {m.subtipo for m in mappings if m.factor_id is not None}
    if faltantes:
        raise HTTPException(
            status_code=400,
            detail=f"Error: Faltan dimensiones de movilidad para la región '{evento.region}'. Debe cargar los factores para: {', '.join(sorted(list(faltantes)))}"
        )

    inputs = (
        db.query(InputEvento)
        .options(joinedload(InputEvento.factor))
        .filter(
            InputEvento.evento_id == evento_id,
            InputEvento.es_actual == True
        )
        .all()
    )

    tickets = (
        db.query(TicketAsistente)
        .options(joinedload(TicketAsistente.movilidades))
        .filter(TicketAsistente.evento_id == evento_id)
        .all()
    )

    movilidad_empleados = db.query(MovilidadEmpleado).filter(
        MovilidadEmpleado.evento_id == evento_id
    ).all()

    movilidad_map = {mov.id: mov for mov in movilidad_empleados} # Mapa para buscar movilidades por ID
    factores = db.query(FactorEmision).all()

    # Usamos el mismo set de mappings para tickets y empleados (mapping general del evento)
    total, detalles_engine = ejecutar_mrv(
        inputs,
        tickets,
        movilidad_empleados,
        factores,
        ticket_factor_mappings=mappings,
        empleado_factor_mappings=mappings
    )

    ultimo = db.query(func.max(Calculo.version)).filter(
        Calculo.evento_id == evento_id
    ).scalar() or 0

    db.query(Calculo).filter(
        Calculo.evento_id == evento_id,
        Calculo.es_actual == True
    ).update({"es_actual": False})

    estado = calcular_estado(inputs, movilidad_empleados)

    nuevo_calculo = Calculo(
        total=total,
        estado=estado,
        evento_id=evento_id,
        version=ultimo + 1,
        es_actual=True
    )

    db.add(nuevo_calculo)
    db.flush()

    # Crear un mapa para buscar rápidamente los inputs por su ID y recuperar los comentarios
    input_map = {inp.id: inp for inp in inputs}

    for detalle in detalles_engine:
        # Si el detalle se originó de un input, intentar obtener su comentario del InputEvento original
        if detalle.get("origen") == "input" and detalle.get("input_id"):
            original_input = input_map.get(detalle["input_id"])
            if original_input:
                detalle["comentario"] = original_input.comentario
        # Si el detalle se originó de una movilidad de empleado, intentar obtener su comentario
        elif detalle.get("origen") == "movilidad_empleado":
            original_movilidad = None
            movilidad_id_from_detail = detalle.get("movilidad_id")

            if movilidad_id_from_detail:
                original_movilidad = movilidad_map.get(movilidad_id_from_detail)
            else:
                # Fallback: si movilidad_id no está en el detalle del motor MRV,
                # intentamos encontrar el MovilidadEmpleado original por sus atributos.
                # Esto es un workaround asumiendo que EstrategiaMovilidad no devuelve movilidad_id.
                # Podría no ser único si existen múltiples entradas de movilidad idénticas.
                for mov in movilidad_empleados:
                    if (mov.transporte == detalle.get("subtipo") and
                        mov.distancia == detalle.get("input_valor") and
                        mov.cantidad_empleados == detalle.get("cantidad_empleados") and
                        mov.tipo_fuente == detalle.get("tipo_fuente")):
                        original_movilidad = mov
                        break

            if original_movilidad:
                detalle["comentario"] = original_movilidad.comentario # Añadir el comentario al diccionario de detalle
                # Además, si movilidad_id faltaba, lo establecemos en el detalle para consistencia
                if not detalle.get("movilidad_id"):
                    detalle["movilidad_id"] = original_movilidad.id

        db.add(DetalleCalculo(
            categoria=detalle["categoria"],
            subtipo=detalle.get("subtipo"),
            emisiones=detalle["emisiones"],
            input_id=detalle.get("input_id"),
            input_version=detalle.get("input_version"),
            input_valor=detalle.get("input_valor"),
            input_unidad=detalle.get("input_unidad"),
            factor_id=detalle.get("factor_id"),
            factor_valor=detalle.get("factor_valor"),
            factor_unidad=detalle.get("factor_unidad"),
            factor_version=detalle.get("factor_version"),
            factor_fuente=detalle.get("factor_fuente"),
            cantidad_empleados=detalle.get("cantidad_empleados"),
            tipo_fuente=detalle.get("tipo_fuente"),
            origen=detalle.get("origen"),
            comentario=detalle.get("comentario"), # Se agrega el comentario
            calculo_id=nuevo_calculo.id
        ))

    evento.hash_datos = generar_hash_evento(
        inputs=inputs,
        tickets=tickets,
        movilidad_empleados=movilidad_empleados
    )
    evento.hash_resultado = generar_hash_evento(
        inputs=inputs,
        tickets=tickets,
        movilidad_empleados=movilidad_empleados,
        detalles=detalles_engine,
        total=total
    )
    evento.estado = estado
    evento.calculo_pendiente = False
    if not evento.public_slug:
        evento.public_slug = secrets.token_urlsafe(10)

    db.commit()
    db.refresh(nuevo_calculo)

    respuesta = serializar_calculo(nuevo_calculo)
    respuesta.update({
        "ok": True,
        "calculo_id": nuevo_calculo.id,
        "public_slug": evento.public_slug,
        "hash_datos": evento.hash_datos,
        "hash_resultado": evento.hash_resultado,
        "detalles": len(detalles_engine)
    })
    return respuesta


@router.get("/evento/{evento_id}")
def obtener_calculo_actual(
    evento_id: int,
    db: Session = Depends(obtener_db),
    usuario=Depends(obtener_usuario_actual)
):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    verificar_propietario_evento(evento, usuario)

    calculo = db.query(Calculo).filter(
        Calculo.evento_id == evento_id,
        Calculo.es_actual == True
    ).first()

    if not calculo:
        raise HTTPException(status_code=404, detail="Evento sin cálculo")

    return serializar_calculo(calculo)


@router.get("/{calculo_id}")
def obtener_calculo_por_id(
    calculo_id: int,
    db: Session = Depends(obtener_db),
    usuario=Depends(obtener_usuario_actual)
):
    calculo = db.query(Calculo).filter(Calculo.id == calculo_id).first()
    if not calculo:
        raise HTTPException(status_code=404, detail="Cálculo no encontrado")

    evento = db.query(Evento).filter(Evento.id == calculo.evento_id).first()
    verificar_propietario_evento(evento, usuario)

    respuesta = serializar_calculo(calculo)
    respuesta.update({
        "hash_datos": evento.hash_datos,
        "hash_resultado": evento.hash_resultado
    })
    return respuesta


@router.delete("/{calculo_id}")
def eliminar_calculo(
    calculo_id: int,
    db: Session = Depends(obtener_db),
    usuario=Depends(obtener_usuario_actual)
):
    calculo = db.query(Calculo).filter(Calculo.id == calculo_id).first()
    if not calculo:
        raise HTTPException(status_code=404, detail="Cálculo no encontrado")

    evento = db.query(Evento).filter(Evento.id == calculo.evento_id).first()
    verificar_propietario_evento(evento, usuario)

    if calculo.es_actual:
        raise HTTPException(status_code=400, detail="No se puede eliminar el cálculo activo")

    db.delete(calculo)
    db.commit()

    return {
        "ok": True,
        "mensaje": "Cálculo eliminado correctamente"
    }
