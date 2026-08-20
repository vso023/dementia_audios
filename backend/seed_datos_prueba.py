# -*- coding: utf-8 -*-
"""
Crea un profesional y un paciente de prueba directo en la base de datos,
para poder probar el flujo completo desde el frontend (que hoy solo lista
pacientes, no los crea).

Uso: python seed_datos_prueba.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db import Paciente, Profesional, SessionLocal, init_db

init_db()
db = SessionLocal()

profesional = db.query(Profesional).filter_by(email="prueba@ejemplo.com").first()
if not profesional:
    profesional = Profesional(nombre="Profesional de Prueba", email="prueba@ejemplo.com")
    db.add(profesional)
    db.commit()
    db.refresh(profesional)
print(f"Profesional: id={profesional.id} nombre={profesional.nombre}")

paciente = db.query(Paciente).filter_by(nombre="Paciente de Prueba").first()
if not paciente:
    paciente = Paciente(profesional_id=profesional.id, nombre="Paciente de Prueba")
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
print(f"Paciente: id={paciente.id} nombre={paciente.nombre}")

db.close()
print("\nListo. Selecciona este paciente en el frontend para probar.")
