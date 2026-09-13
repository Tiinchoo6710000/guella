import os
from dotenv import load_dotenv # Importa load_dotenv

# Carga las variables de entorno del archivo .env.
# Es importante que este archivo se encuentre en la raíz de tu proyecto o en una ubicación accesible.
# Para el backend, generalmente se coloca en la raíz de la carpeta 'backend'.
load_dotenv()

# Esta es la URL de conexión a tu base de datos PostgreSQL.
# En desarrollo local, podrías tenerla en un archivo .env.
# En producción (Render), la configuraremos como una variable de entorno.
# Si no se encuentra la variable de entorno, usa un valor por defecto (¡solo para desarrollo local!).
# Asegúrate de que el valor por defecto sea una base de datos local o de prueba, NUNCA la de producción.
URL_BASE_DE_DATOS = os.getenv("DATABASE_URL")