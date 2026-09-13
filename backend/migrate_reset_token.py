from app.db.base_de_datos import motor as engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
cols = [c['name'] for c in inspector.get_columns('usuarios')]
print('Columnas actuales:', cols)

with engine.connect() as conn:
    if 'reset_token' not in cols:
        conn.execute(text('ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR'))
        print('Agregada: reset_token')
    else:
        print('Ya existe: reset_token')
    if 'reset_token_expiry' not in cols:
        conn.execute(text('ALTER TABLE usuarios ADD COLUMN reset_token_expiry TIMESTAMP'))
        print('Agregada: reset_token_expiry')
    else:
        print('Ya existe: reset_token_expiry')
    conn.commit()

print('Migracion completada OK')
