from app.db.base_de_datos import motor as engine
from sqlalchemy import text, inspect

def migrar_activo():
    inspector = inspect(engine)
    cols = [c['name'] for c in inspector.get_columns('usuarios')]
    print('Columnas actuales en usuarios:', cols)

    with engine.begin() as conn:
        if 'activo' not in cols:
            conn.execute(text('ALTER TABLE usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;'))
            print('Columna agregada: activo (BOOLEAN NOT NULL DEFAULT TRUE)')
        else:
            print('La columna activo ya existe.')

if __name__ == '__main__':
    migrar_activo()
