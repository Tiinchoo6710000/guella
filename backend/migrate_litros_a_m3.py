"""
Script de migración: Transición de unidad de medida 'litros' a 'm3'
Afecta a:
- Factores de emisión:
  * energia -> diesel_generador, nafta_generador
  * agua -> red, transportada
  * catering -> bebidas
- Inputs de eventos correspondientes
- Detalles de cálculo histórico correspondientes
"""

from app.db.base_de_datos import motor as engine
from sqlalchemy import text

SUBTIPOS_LIQUIDOS = ('diesel_generador', 'nafta_generador', 'red', 'transportada', 'bebidas')

def ejecutar_migracion():
    print("Iniciando migración de 'litros' a 'm3'...")

    with engine.begin() as conn:
        # 1. Factores de emisión
        res_factores = conn.execute(text("""
            SELECT id, categoria, subtipo, valor, unidad 
            FROM factores_emision 
            WHERE subtipo IN :subtipos AND (unidad = 'litros' OR unidad = 'litro');
        """), {"subtipos": SUBTIPOS_LIQUIDOS}).fetchall()

        print(f"Factores a migrar: {len(res_factores)}")
        for f in res_factores:
            nuevo_valor = float(f.valor) * 1000.0
            conn.execute(text("""
                UPDATE factores_emision
                SET valor = :nuevo_valor, unidad = 'm3'
                WHERE id = :id;
            """), {"nuevo_valor": nuevo_valor, "id": f.id})
            print(f"  -> Factor ID {f.id} ({f.categoria}/{f.subtipo}): {f.valor} litros -> {nuevo_valor} m3")

        # 2. Inputs de eventos
        res_inputs = conn.execute(text("""
            SELECT id, evento_id, factor_id, valor, unidad 
            FROM inputs_evento 
            WHERE unidad = 'litros' OR unidad = 'litro';
        """)).fetchall()

        print(f"\nInputs de eventos a migrar: {len(res_inputs)}")
        for inp in res_inputs:
            nuevo_valor = float(inp.valor) / 1000.0
            conn.execute(text("""
                UPDATE inputs_evento
                SET valor = :nuevo_valor, unidad = 'm3'
                WHERE id = :id;
            """), {"nuevo_valor": nuevo_valor, "id": inp.id})
            print(f"  -> Input ID {inp.id} (Evento {inp.evento_id}): {inp.valor} litros -> {nuevo_valor} m3")

        # 3. Detalles de cálculo histórico
        res_detalles = conn.execute(text("""
            SELECT id, categoria, subtipo, input_valor, input_unidad, factor_valor, factor_unidad
            FROM detalle_calculo
            WHERE input_unidad IN ('litros', 'litro') OR factor_unidad IN ('litros', 'litro')
               OR (subtipo IN :subtipos AND (input_unidad != 'm3' OR factor_unidad != 'm3'));
        """), {"subtipos": SUBTIPOS_LIQUIDOS}).fetchall()

        print(f"\nDetalles de cálculo a migrar: {len(res_detalles)}")
        for d in res_detalles:
            nuevo_input_valor = float(d.input_valor) / 1000.0 if d.input_valor is not None and d.input_unidad in ('litros', 'litro') else d.input_valor
            nuevo_factor_valor = float(d.factor_valor) * 1000.0 if d.factor_valor is not None and d.factor_unidad in ('litros', 'litro') else d.factor_valor

            conn.execute(text("""
                UPDATE detalle_calculo
                SET input_valor = :input_valor,
                    input_unidad = 'm3',
                    factor_valor = :factor_valor,
                    factor_unidad = 'm3'
                WHERE id = :id;
            """), {
                "input_valor": nuevo_input_valor,
                "factor_valor": nuevo_factor_valor,
                "id": d.id
            })
            print(f"  -> Detalle ID {d.id} ({d.categoria}/{d.subtipo}): {d.input_valor} {d.input_unidad} -> {nuevo_input_valor} m3 | {d.factor_valor} {d.factor_unidad} -> {nuevo_factor_valor} m3")

    print("\n¡Migración completada con éxito! Todos los registros ahora usan 'm3'.")

if __name__ == '__main__':
    ejecutar_migracion()
