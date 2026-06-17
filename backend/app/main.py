from fastapi import FastAPI
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
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
