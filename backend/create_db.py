import os
from sqlalchemy import create_engine
from app.db.base_de_datos import Base # Importa tu Base de SQLAlchemy

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

# Obtén la URL de la base de datos de la variable de entorno.
# Para esta ejecución local, la leeremos directamente de la variable de entorno o la pondremos aquí temporalmente.
DATABASE_URL = "postgresql://postgres.luwvduauawuwixblaans:Marazul2020_@aws-1-us-east-2.pooler.supabase.com:6543/postgres"


engine = create_engine(DATABASE_URL)

def create_tables():
    print("Conectando a la base de datos y creando tablas...")
    Base.metadata.create_all(engine)
    print("Tablas creadas exitosamente en Supabase.")

if __name__ == "__main__":
    create_tables()