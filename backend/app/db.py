"""
Capa de persistencia (SQLite via SQLAlchemy).

Modelo de datos, segun lo definido por el usuario:
  Profesional  1 --- N  Paciente
  Paciente     1 --- N  Analisis   (historial en el tiempo)
  Analisis     1 --- 1  Reporte    (el texto redactado por el LLM)

Para el MVP se implementa: guardar cada analisis con su reporte asociado a
un paciente, y consultar historial. Exportar a PDF, comparar en el tiempo y
eliminar quedan fuera de este alcance (siguientes iteraciones), pero el
modelo de datos ya las deja soportadas sin cambios de esquema.
"""
from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlalchemy import ForeignKey, JSON, create_engine
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker,
)

from app.config import DB_PATH


class Base(DeclarativeBase):
    pass


class Profesional(Base):
    __tablename__ = "profesionales"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    created_at: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    pacientes: Mapped[list["Paciente"]] = relationship(back_populates="profesional")


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(primary_key=True)
    profesional_id: Mapped[int] = mapped_column(ForeignKey("profesionales.id"))
    nombre: Mapped[str]
    fecha_nacimiento: Mapped[Optional[dt.date]] = mapped_column(default=None)
    sexo: Mapped[Optional[str]] = mapped_column(default=None)
    created_at: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    profesional: Mapped["Profesional"] = relationship(back_populates="pacientes")
    analisis: Mapped[list["Analisis"]] = relationship(
        back_populates="paciente", order_by="Analisis.fecha"
    )


class Analisis(Base):
    __tablename__ = "analisis"

    id: Mapped[int] = mapped_column(primary_key=True)
    paciente_id: Mapped[int] = mapped_column(ForeignKey("pacientes.id"))
    fecha: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    audio_filename: Mapped[str]
    transcripcion: Mapped[str]

    # Clasificador unico: fusion multimodal (embeddings de audio con
    # Wav2Vec2 + embeddings de texto con BETO). Ver
    # app/pipeline/multimodal_classifier.py.
    clasificacion: Mapped[str]
    confianza: Mapped[float]
    probabilidades: Mapped[dict] = mapped_column(JSON)

    # Features descriptivas (NO usadas para clasificar, solo contexto
    # legible para el reporte del LLM — ver report_llm.py)
    features_audio: Mapped[dict] = mapped_column(JSON)
    features_texto: Mapped[dict] = mapped_column(JSON)

    paciente: Mapped["Paciente"] = relationship(back_populates="analisis")
    reporte: Mapped[Optional["Reporte"]] = relationship(
        back_populates="analisis", uselist=False, cascade="all, delete-orphan"
    )


class Reporte(Base):
    __tablename__ = "reportes"

    id: Mapped[int] = mapped_column(primary_key=True)
    analisis_id: Mapped[int] = mapped_column(ForeignKey("analisis.id"), unique=True)
    contenido: Mapped[str]
    modelo_llm: Mapped[str]
    created_at: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    analisis: Mapped["Analisis"] = relationship(back_populates="reporte")


engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(engine)


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
