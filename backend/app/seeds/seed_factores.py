from datetime import date
import random

from app.db.base_de_datos import SesionLocal, Base, motor

from app.modelos.usuario import Usuario
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.input_evento import InputEvento
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.movilidad_ticket import MovilidadTicket
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.calculo import Calculo
from app.modelos.ticket_factor_mapping import TicketFactorMapping
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.evidencia import Evidencia

from app.core.seguridad import generar_hash_password


FACTORES = {

    "energia": {
        "electricidad": (0.343, "kwh"),
        "nafta_generador": (2.31, "litros"),
        "diesel_generador": (2.68, "litros"),
        "solar": (0.05, "kwh"),
    },

    "residuos": {
        "reciclable": (0.08, "kg"),
        "organico": (0.25, "kg"),
        "rechazo": (0.57, "kg"),
    },

    "agua": {
        "red": (0.000298, "litros"),
        "transportada": (0.0006, "litros"),
    },

    "catering": {
        "carne": (27.0, "kg"),
        "vegano": (2.0, "kg"),
        "vegetariano": (4.5, "kg"),
        "bebidas": (0.4, "litros"),
    },

    "produccion": {
        "papel": (1.1, "kg"),
        "plastico": (2.5, "kg"),
        "textil": (8.2, "kg"),
        "madera": (0.4, "kg"),
    },

    "movilidad": {
        "auto": (0.192, "km"),
        "moto": (0.103, "km"),
        "bici": (0.0, "km"),
        "caminata": (0.0, "km"),
        "bus": (0.105, "km"),
        "tren": (0.041, "km"),
        "avion": (0.255, "km"),
    }
}


# SOLO INPUTS REALES (SIN MOVILIDAD)
INPUTS_TEST = {
    "electricidad": 22000,
    "nafta_generador": 950,
    "diesel_generador": 1350,
    "solar": 9800,

    "reciclable": 320,
    "organico": 720,
    "rechazo": 980,

    "red": 42000,
    "transportada": 15000,

    "carne": 520,
    "vegano": 230,
    "vegetariano": 270,
    "bebidas": 5200,

    "papel": 320,
    "plastico": 110,
    "textil": 180,
    "madera": 340,
}


TRANSPORTES = [
    "auto",
    "moto",
    "bus",
    "tren",
    "bici",
    "avion",
    "caminata"
]


def run_seed():

    db = SesionLocal()

    try:

        # Ensure tables exist before seeding.
        Base.metadata.create_all(bind=motor)

        # =====================================
        # LIMPIAR DB
        # =====================================

        db.query(DetalleCalculo).delete()
        db.query(Calculo).delete()

        db.query(MovilidadTicket).delete()
        db.query(TicketAsistente).delete()
        db.query(TicketFactorMapping).delete()

        db.query(MovilidadEmpleado).delete()

        db.query(InputEvento).delete()
        db.query(FactorEmision).delete()
        db.query(Evidencia).delete()

        db.query(Evento).delete()
        db.query(Usuario).delete()

        db.commit()

        print("DB limpiada")

        # =====================================
        # USUARIO DEMO
        # =====================================

        usuario = Usuario(
            nombre="Productor Demo",
            email="productor@guella.com",
            contrasena_hash=generar_hash_password(
                "123456"
            ),
            rol="productor"
        )

        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        print("Usuario creado")

        # =====================================
        # EVENTOS DEMO
        # =====================================

        eventos_demo = [
            Evento(
                nombre="Festival Córdoba 2026",
                fecha=date(2026, 8, 20),
                pais="Argentina",
                region="Cordoba",
                ciudad="Cordoba",
                cantidad_asistentes=5000,
                usuario_id=usuario.id,
                calculo_pendiente=True,
                public_slug="festival-cordoba-2026"
            ),
            Evento(
                nombre="Concierto Buenos Aires 2026",
                fecha=date(2026, 11, 12),
                pais="Argentina",
                region="Buenos Aires",
                ciudad="Buenos Aires",
                cantidad_asistentes=3200,
                usuario_id=usuario.id,
                calculo_pendiente=True,
                public_slug="concierto-buenos-aires-2026"
            )
        ]

        db.add_all(eventos_demo)
        db.commit()

        for evento in eventos_demo:
            db.refresh(evento)

        print("Eventos creados")

        # =====================================
        # FACTORES GLOBALES
        # =====================================

        factores_creados = []

        for categoria, subtipos in FACTORES.items():

            for subtipo, (
                valor,
                unidad
            ) in subtipos.items():

                factor = FactorEmision(
                    categoria=categoria,
                    subtipo=subtipo,
                    valor=valor,
                    unidad=unidad,
                    fuente="DEFRA",
                    version="1",
                    vigencia="2026",
                    region="Global",
                    comentario="Factor cargado por defecto vía semilla"
                )

                factores_creados.append(
                    factor
                )

        db.add_all(factores_creados)
        db.commit()

        print("Factores creados")

        factores_db = db.query(
            FactorEmision
        ).all()

        mapa_factores = {
            (
                f.categoria,
                f.subtipo
            ): f
            for f in factores_db
        }

        # =====================================
        # INPUTS EVENTOS
        # =====================================

        inputs = []

        contador = 0

        for evento in eventos_demo:
            for (
                categoria,
                subtipo
            ), factor in mapa_factores.items():

                # MOVILIDAD NO VA COMO INPUT
                if categoria == "movilidad":
                    continue

                input_evento = InputEvento(
                    evento_id=evento.id,
                    factor_id=factor.id,
                    valor=INPUTS_TEST[subtipo],
                    unidad=factor.unidad,
                    tipo_fuente=random.choice(
                        ["real", "estimado"]
                    ),
                    version=1,
                    es_actual=True
                )

                inputs.append(
                    input_evento
                )

                contador += 1

        db.add_all(inputs)
        db.commit()

        print(
            f"{contador} inputs creados en {len(eventos_demo)} eventos"
        )

        # =====================================
        # MOVILIDAD EMPLEADOS
        # =====================================

        movilidades_empleados = [
            MovilidadEmpleado(
                evento_id=eventos_demo[0].id,
                transporte="auto",
                distancia=850,
                cantidad_empleados=12,
                tipo_fuente=random.choice(["real", "estimado"])
            ),
            MovilidadEmpleado(
                evento_id=eventos_demo[0].id,
                transporte="bus",
                distancia=400,
                cantidad_empleados=8,
                tipo_fuente=random.choice(["real", "estimado"])
            ),
            MovilidadEmpleado(
                evento_id=eventos_demo[0].id,
                transporte="tren",
                distancia=120,
                cantidad_empleados=18,
                tipo_fuente=random.choice(["real", "estimado"])
            ),
            MovilidadEmpleado(
                evento_id=eventos_demo[1].id,
                transporte="bus",
                distancia=310,
                cantidad_empleados=10,
                tipo_fuente=random.choice(["real", "estimado"])
            ),
            MovilidadEmpleado(
                evento_id=eventos_demo[1].id,
                transporte="auto",
                distancia=420,
                cantidad_empleados=6,
                tipo_fuente=random.choice(["real", "estimado"])
            ),
            MovilidadEmpleado(
                evento_id=eventos_demo[1].id,
                transporte="tren",
                distancia=90,
                cantidad_empleados=5,
                tipo_fuente=random.choice(["real", "estimado"])
            )
        ]

        db.add_all(
            movilidades_empleados
        )

        db.commit()

        print(
            "Movilidad empleados creada"
        )

        # =====================================
        # TICKETS
        # =====================================

        tickets_creados = 40

        for numero in range(1, tickets_creados + 1):

            ticket = TicketAsistente(
                ticket_id=f"QR-{numero:03}",
                evento_id=eventos_demo[0].id
            )

            db.add(ticket)
            db.flush()

            cantidad_mov = random.randint(
                1,
                4
            )

            usados = random.sample(
                TRANSPORTES,
                cantidad_mov
            )

            for transporte in usados:

                movilidad = MovilidadTicket(
                    transporte=transporte,
                    distancia=random.randint(
                        5,
                        120
                    ),
                    ticket_id=ticket.id
                )

                db.add(movilidad)

        tickets_segundo_evento = 20

        for numero in range(1, tickets_segundo_evento + 1):

            ticket = TicketAsistente(
                ticket_id=f"QB-{numero:03}",
                evento_id=eventos_demo[1].id
            )

            db.add(ticket)
            db.flush()

            cantidad_mov = random.randint(
                1,
                4
            )

            usados = random.sample(
                TRANSPORTES,
                cantidad_mov
            )

            for transporte in usados:

                movilidad = MovilidadTicket(
                    transporte=transporte,
                    distancia=random.randint(
                        5,
                        100
                    ),
                    ticket_id=ticket.id
                )

                db.add(movilidad)

        db.commit()

        print(f"{tickets_creados} tickets creados para el primer evento")
        print(f"{tickets_segundo_evento} tickets creados para el segundo evento")

        # =====================================
        # EVIDENCIAS
        # =====================================

        evidencias = [
            Evidencia(
                evento_id=eventos_demo[0].id,
                calculo_id=None,
                filename="factura_energia.pdf",
                url="https://demo.guella.com/evidencias/factura_energia.pdf",
                tipo="documento"
            ),
            Evidencia(
                evento_id=eventos_demo[0].id,
                calculo_id=None,
                filename="certificado_residuos.jpg",
                url="https://demo.guella.com/evidencias/certificado_residuos.jpg",
                tipo="imagen"
            ),
            Evidencia(
                evento_id=eventos_demo[1].id,
                calculo_id=None,
                filename="plan_movilidad_empleados.pdf",
                url="https://demo.guella.com/evidencias/plan_movilidad_empleados.pdf",
                tipo="documento"
            )
        ]

        db.add_all(evidencias)
        db.commit()

        print("Evidencias creadas")

        print("\n======================")
        print("SEED COMPLETADO")
        print("======================")
        print(
            "Usuario: productor@guella.com"
        )
        print("Password: 123456")
        print(
            f"Eventos IDs: {[evento.id for evento in eventos_demo]}"
        )
        print("Factores: 24")
        print(f"Inputs: {contador}")
        print(f"Tickets: {tickets_creados + tickets_segundo_evento}")
        print("Movilidad empleados: 6")
        print("Evidencias: 3")

    finally:
        db.close()


if __name__ == "__main__":
    run_seed()