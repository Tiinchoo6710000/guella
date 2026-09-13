from app.db.base_de_datos import motor as engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
cols = [c['name'] for c in inspector.get_columns('usuarios')]
print('Columnas actuales:', cols)

with engine.connect() as conn:
    if 'debe_cambiar_password' not in cols:
        conn.execute(text('ALTER TABLE usuarios ADD COLUMN debe_cambiar_password BOOLEAN NOT NULL DEFAULT FALSE'))
        print('Agregada: debe_cambiar_password')
    else:
        print('Ya existe: debe_cambiar_password')
    if 'creado_en' not in cols:
        conn.execute(text('ALTER TABLE usuarios ADD COLUMN creado_en TIMESTAMP NOT NULL DEFAULT NOW()'))
        print('Agregada: creado_en')
    else:
        print('Ya existe: creado_en')
    conn.commit()

print('Migracion completada OK')
