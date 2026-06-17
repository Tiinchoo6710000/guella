from .base import EstrategiaBase

class EstrategiaCatering(EstrategiaBase):

    def calcular(self, inputs, tickets=None, movilidad_empleados=None):
        total = 0
        detalles = []

        for i in inputs:
            if i.factor.categoria != "catering":
                continue

            f = i.factor
            self.validar(i, f)

            emisiones = i.valor * f.valor

            total += emisiones

            detalles.append(
                self.construir_detalle(i, f, emisiones, "catering", f.subtipo)
            )

        return total, detalles