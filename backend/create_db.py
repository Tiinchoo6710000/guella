import os
from sqlalchemy import create_engine
from app.db.base_de_datos import Base # Importa tu Base de SQLAlchemy
from dotenv import load_dotenv # Importa load_dotenv

# Importa todos tus modelos para que Base.metadata.create_all() los conozca.
# Asegúrate de que estas rutas sean correctas para tu proyecto.
from app.modelos.calculo import Calculo
from app.modelos.detalle_calculo import DetalleCalculo
from app.modelos.evento import Evento
from app.modelos.factor_emision import FactorEmision
from app.modelos.input_evento import InputEvento
from app.modelos.movilidad_empleado import MovilidadEmpleado
from app.modelos.ticket_asistente import TicketAsistente
from app.modelos.ticket_factor_mapping import TicketFactorMapping
from app.modelos.usuario import Usuario
from app.modelos.evidencia import Evidencia

# Carga las variables de entorno del archivo .env
# Asegúrate de que el archivo .env esté en la raíz de tu carpeta 'backend'
load_dotenv()


# Obtén la URL de la base de datos de la variable de entorno.
# Para el entorno local, usaremos la variable DATABASE_URL del .env.
# En producción (Render), Render inyectará su propia DATABASE_URL.
DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)

def create_tables():
    print("Conectando a la base de datos y creando tablas...")
    Base.metadata.create_all(engine)
    print("Tablas creadas exitosamente en la base de datos local.")

if __name__ == "__main__":
    create_tables()