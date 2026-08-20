"""
API principal. Arquitectura: este backend es independiente del frontend
(React/Vite) — se comunican solo via HTTP/JSON, como se definio en la
Fase 3 del diseño.
"""
from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import require_llm_config
from app.db import (
    Analisis, Paciente, Profesional, Reporte, SessionLocal, get_session, init_db,
)
from app.orchestrator import analizar_audio
from app.pipeline.multimodal_classifier import ModalidadFaltanteError
from app.schemas import (
    AnalisisOut, AnalisisResumenOut, PacienteCreate, PacienteOut,
    ProfesionalCreate, ProfesionalOut,
)

app = FastAPI(title="Herramienta de apoyo a deteccion de deterioro cognitivo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajustar en despliegue real
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    # Falla rapido y con un mensaje claro si falta la key del LLM, en vez
    # de descubrirlo recien cuando un usuario suba el primer audio.
    require_llm_config()
    _asegurar_profesional_por_defecto()


def _asegurar_profesional_por_defecto() -> None:
    """La seccion "Profesional" no se muestra en la interfaz (ver
    PatientSection.jsx), pero cada paciente sigue requiriendo un
    profesional_id valido. El frontend auto-selecciona el primero de la
    lista al cargar; si la tabla esta vacia (base de datos nueva o recien
    limpiada), no hay nada que auto-seleccionar y el boton "Crear
    paciente" queda deshabilitado de forma permanente. Se crea uno por
    defecto solo si no existe ninguno — no reemplaza ni duplica los que
    ya haya."""
    db = SessionLocal()
    try:
        if not db.query(Profesional).first():
            db.add(Profesional(nombre="Profesional responsable", email="responsable@local"))
            db.commit()
    finally:
        db.close()


# ── Profesionales / Pacientes ────────────────────────────────────────────
@app.post("/api/profesionales", response_model=ProfesionalOut)
def crear_profesional(data: ProfesionalCreate, db: Session = Depends(get_session)):
    if db.query(Profesional).filter_by(email=data.email).first():
        raise HTTPException(409, "Ya existe un profesional con ese email")
    profesional = Profesional(nombre=data.nombre, email=data.email)
    db.add(profesional)
    db.commit()
    db.refresh(profesional)
    return profesional


@app.get("/api/profesionales", response_model=list[ProfesionalOut])
def listar_profesionales(db: Session = Depends(get_session)):
    return db.query(Profesional).order_by(Profesional.nombre).all()


@app.post("/api/pacientes", response_model=PacienteOut)
def crear_paciente(data: PacienteCreate, db: Session = Depends(get_session)):
    if not db.get(Profesional, data.profesional_id):
        raise HTTPException(404, "Profesional no encontrado")
    paciente = Paciente(**data.model_dump())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@app.get("/api/pacientes", response_model=list[PacienteOut])
def listar_pacientes(db: Session = Depends(get_session)):
    return db.query(Paciente).order_by(Paciente.nombre).all()


# ── Historial ─────────────────────────────────────────────────────────
@app.get("/api/pacientes/{paciente_id}/historial", response_model=list[AnalisisResumenOut])
def historial_paciente(paciente_id: int, db: Session = Depends(get_session)):
    paciente = db.get(Paciente, paciente_id)
    if not paciente:
        raise HTTPException(404, "Paciente no encontrado")
    return (
        db.query(Analisis)
        .filter(Analisis.paciente_id == paciente_id)
        .order_by(Analisis.fecha.desc())
        .all()
    )


@app.get("/api/analisis/{analisis_id}", response_model=AnalisisOut)
def detalle_analisis(analisis_id: int, db: Session = Depends(get_session)):
    analisis = db.get(Analisis, analisis_id)
    if not analisis:
        raise HTTPException(404, "Analisis no encontrado")
    return analisis


# ── Analisis (endpoint principal: sube audio → procesa → guarda → reporte) ──
@app.post("/api/analisis", response_model=AnalisisOut)
async def crear_analisis(
    paciente_id: int = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_session),
):
    paciente = db.get(Paciente, paciente_id)
    if not paciente:
        raise HTTPException(404, "Paciente no encontrado")

    with tempfile.NamedTemporaryFile(suffix=Path(audio.filename).suffix, delete=False) as tmp:
        shutil.copyfileobj(audio.file, tmp)
        ruta_temporal = tmp.name

    try:
        resultado = await analizar_audio(ruta_temporal)
    except ModalidadFaltanteError as e:
        raise HTTPException(422, f"No se pudo completar el análisis: {e}") from e
    finally:
        Path(ruta_temporal).unlink(missing_ok=True)

    nuevo_analisis = Analisis(
        paciente_id=paciente_id,
        audio_filename=audio.filename,
        transcripcion=resultado.transcripcion,
        clasificacion=resultado.clasificacion.clasificacion,
        confianza=resultado.clasificacion.confianza,
        probabilidades=resultado.clasificacion.probabilidades,
        features_audio=resultado.features_audio,
        features_texto=resultado.features_texto,
    )
    nuevo_analisis.reporte = Reporte(
        contenido=resultado.reporte.contenido,
        modelo_llm=resultado.reporte.modelo_llm,
    )
    db.add(nuevo_analisis)
    db.commit()
    db.refresh(nuevo_analisis)
    return nuevo_analisis
