from .base import EstrategiaBase


class EstrategiaMovilidad(EstrategiaBase):
    def __init__(self, factores, ticket_factor_mappings=None, empleado_factor_mappings=None):
        super().__init__(factores)
        self.ticket_factor_mappings = ticket_factor_mappings or []
        self.empleado_factor_mappings = empleado_factor_mappings or []

    def calcular(
        self,
        inputs,
        tickets=None,
        movilidad_empleados=None
    ):

        total = 0
        detalles = []

        # =====================
        # MOVILIDAD EMPLEADOS
        # =====================

        if movilidad_empleados:

            for movilidad in movilidad_empleados:

                mapping = next(
                    (
                        m for m in self.empleado_factor_mappings
                        if m.subtipo == movilidad.transporte
                    ),
                    None
                )
                factor = mapping.factor if mapping else None

                if not factor:
                    raise Exception(
                        f"No existe factor de movilidad empleado para {movilidad.transporte}"
                    )

                # IMPORTANTE:
                # distancia ya representa el total
                # cargado manualmente por el productor
                # de TODOS los empleados.
                emisiones = (
                    movilidad.distancia
                    * factor.valor
                )

                total += emisiones

                detalles.append({
                    "categoria": "movilidad",
                    "subtipo": movilidad.transporte,
                    "emisiones": emisiones,

                    "input_valor": movilidad.distancia,
                    "input_unidad": "km",

                    "cantidad_empleados": movilidad.cantidad_empleados,

                    "factor_id": factor.id,
                    "factor_valor": factor.valor,
                    "factor_unidad": factor.unidad,
                    "factor_version": factor.version,
                    "factor_fuente": factor.fuente,
                    "tipo_fuente": movilidad.tipo_fuente,

                    "origen": "movilidad_empleado",
                    "input_id": None,
                    "input_version": None
                })

        # =====================
        # MOVILIDAD ASISTENTES
        # =====================

        if tickets:

            for ticket in tickets:

                for movilidad in ticket.movilidades:

                    mapping = next(
                        (
                            m for m in self.ticket_factor_mappings
                            if m.subtipo == movilidad.transporte
                        ),
                        None
                    )
                    factor = mapping.factor if mapping else None

                    if not factor:
                        raise Exception(
                            f"No existe factor de movilidad ticket para {movilidad.transporte}"
                        )

                    emisiones = (
                        movilidad.distancia
                        * factor.valor
                    )

                    total += emisiones

                    detalles.append({
                        "categoria": "movilidad",
                        "subtipo": movilidad.transporte,
                        "emisiones": emisiones,

                        "input_valor": movilidad.distancia,
                        "input_unidad": "km",

                        "factor_id": factor.id,
                        "factor_valor": factor.valor,
                        "factor_unidad": factor.unidad,
                        "factor_version": factor.version,
                        "factor_fuente": factor.fuente,

                        "origen": "ticket",
                        "input_id": None,
                        "input_version": None
                    })

        return total, detalles
