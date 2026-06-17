import logging

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.configuracion import URL_BASE_DE_DATOS

logger = logging.getLogger(__name__)

# Motor de conexión
motor = create_engine(URL_BASE_DE_DATOS,pool_pre_ping=True,future=True,echo=False)

# Sesión para interactuar con la base
SesionLocal = sessionmaker(
    bind=motor,
    autoflush=False,
    autocommit=False,
    future=True
)

# Clase base para modelos
Base = declarative_base()

def obtener_db():
    db = SesionLocal()
    try:
        yield db
    except OperationalError as error:
        logger.exception('Error de conexión a la base de datos')
        raise HTTPException(
            status_code=503,
            detail=f"No se puede conectar a la base de datos: {error.orig if hasattr(error, 'orig') else error}. Verifique que PostgreSQL esté en ejecución y que DATABASE_URL sea correcta."
        )
    finally:
        db.close()