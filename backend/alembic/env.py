from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.db.base_de_datos import Base
from app.core.configuracion import URL_BASE_DE_DATOS

# IMPORTAR MODELOS
from app.modelos.usuario import Usuario
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.input_evento import InputEvento
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.calculo import Calculo
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.movilidad_ticket import MovilidadTicket
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.evidencia import Evidencia
from app.modelos.ticket_factor_mapping import TicketFactorMapping


config = context.config

config.set_main_option(
    "sqlalchemy.url",
    URL_BASE_DE_DATOS
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():

    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {}
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()