from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware

# rutas
from app.rutas import eventos
from app.rutas import inputs
from app.rutas import factores
from app.rutas import calculos
from app.rutas import webhooks
from app.rutas import movilidad_empleados
from app.rutas import evidencias
from app.rutas import public
from app.rutas import ticket_factor_mappings

app = FastAPI(title="Guella MRV API" , version = "1.0.0")

# Configuración de CORS
# Obtener los orígenes permitidos de una variable de entorno
# Esto permite que el frontend de Vercel se conecte al backend de Render
# Si FRONTEND_URL no está definida, se usa solo localhost para desarrollo local
FRONTEND_URLS = os.environ.get("FRONTEND_URL", "http://localhost:5173,http://127.0.0.1:5173").split(',')
# Limpiar espacios en blanco de cada URL
FRONTEND_URLS = [url.strip() for url in FRONTEND_URLS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS, # Usamos la lista dinámica de URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(eventos.router)
app.include_router(inputs.router)
app.include_router(factores.router)
app.include_router(calculos.router)
app.include_router(webhooks.router)
#app.include_router(dashboard.router)
app.include_router(movilidad_empleados.router)
app.include_router(evidencias.router)
app.include_router(public.router)
app.include_router(ticket_factor_mappings.router)



@app.get("/")
def health_check():
    return {
        "ok": True,
        "app": "Guella MRV API",
        "version": "1.0.0"
    }
