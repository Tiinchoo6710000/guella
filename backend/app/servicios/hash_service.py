import json
import hashlib


def generar_hash_evento(
    inputs,
    tickets,
    movilidad_empleados=None,
    detalles=None,
    total=0
):
    movilidad_empleados = movilidad_empleados or []
    detalles = detalles or []

    # ==========================
    # INPUTS
    # ==========================

    data_inputs = []

    for i in sorted(inputs, key=lambda x: x.id):

        factor = getattr(i, "factor", None)

        data_inputs.append({
            "id": i.id,
            "version": i.version,
            "valor": i.valor,
            "unidad": i.unidad,
            "tipo_fuente": i.tipo_fuente,

            "factor": {
                "id": factor.id if factor else None,
                "categoria": factor.categoria if factor else None,
                "subtipo": factor.subtipo if factor else None,
                "valor": factor.valor if factor else None,
                "unidad": factor.unidad if factor else None,
                "version": factor.version if factor else None,
                "fuente": factor.fuente if factor else None
            }
        })

    # ==========================
    # TICKETS
    # ==========================

    data_tickets = []

    for ticket in sorted(
        tickets,
        key=lambda x: x.ticket_id
    ):

        movilidades = sorted(
            ticket.movilidades,
            key=lambda x: (
                x.transporte,
                x.distancia
            )
        )

        data_tickets.append({
            "ticket_id": ticket.ticket_id,

            "movilidades": [
                {
                    "transporte": m.transporte,
                    "distancia": m.distancia
                }
                for m in movilidades
            ]
        })

    # ==========================
    # MOVILIDAD EMPLEADOS
    # ==========================

    data_movilidad_empleados = []

    for m in sorted(
        movilidad_empleados,
        key=lambda x: (
            x.transporte,
            x.distancia
        )
    ):

        data_movilidad_empleados.append({
            "transporte": m.transporte,
            "distancia": m.distancia,
            "cantidad_empleados": m.cantidad_empleados,
            "tipo_fuente": m.tipo_fuente
        })

    # ==========================
    # DETALLES
    # ==========================

    detalles_ordenados = sorted(
        detalles,
        key=lambda x: (
            x.get("categoria", ""),
            x.get("subtipo", "")
        )
    )

    # ==========================
    # PAYLOAD
    # ==========================

    payload = {
        "inputs": data_inputs,
        "tickets": data_tickets,
        "movilidad_empleados": data_movilidad_empleados,
        "detalles": detalles_ordenados,
        "total": round(float(total), 8)
    }

    texto = json.dumps(
        payload,
        sort_keys=True,
        ensure_ascii=False
    )

    return hashlib.sha256(
        texto.encode("utf-8")
    ).hexdigest()