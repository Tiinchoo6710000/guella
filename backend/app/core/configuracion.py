import os

# Esta es la URL de conexión a tu base de datos PostgreSQL.
# En desarrollo local, podrías tenerla en un archivo .env.
# En producción (Render), la configuraremos como una variable de entorno.
# Si no se encuentra la variable de entorno, usa un valor por defecto (¡solo para desarrollo local!).
# Asegúrate de que el valor por defecto sea una base de datos local o de prueba, NUNCA la de producción.
URL_BASE_DE_DATOS = os.environ.get(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/dbname" # <-- ¡CAMBIA ESTO POR TU DB LOCAL SI LA USAS!
)