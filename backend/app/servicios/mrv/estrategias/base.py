class EstrategiaBase:

    def __init__(self, factores):
        self.factores = factores

    # SAFEGUARD (no reemplaza validación del sistema)
    def validar(self, input, factor):
        if input.unidad != factor.unidad:
            raise ValueError(
                f"[SAFEGUARD] Unidad inválida: {input.unidad} != {factor.unidad}"
            )

    def construir_detalle(
        self,
        input,
        factor,
        emisiones,
        categoria,
        subtipo
    ):
        return {
            "categoria": categoria,
            "subtipo": subtipo,
            "emisiones": emisiones,

            "input_valor": input.valor,
            "input_unidad": input.unidad,

            "factor_valor": factor.valor,
            "factor_unidad": factor.unidad,
            "factor_version": factor.version,
            "factor_fuente": factor.fuente,
            "factor_id": factor.id,

            "origen": "input",
            "input_id": input.id,
            "input_version": input.version
        }