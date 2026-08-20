"""Modelos Pydantic de request/response de la API."""
from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfesionalCreate(BaseModel):
    nombre: str
    email: str


class ProfesionalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    email: str


class PacienteCreate(BaseModel):
    profesional_id: int
    nombre: str
    fecha_nacimiento: Optional[dt.date] = None
    sexo: Optional[str] = None


class PacienteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    fecha_nacimiento: Optional[dt.date]
    sexo: Optional[str]
    created_at: dt.datetime


class ReporteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    contenido: str
    modelo_llm: str
    created_at: dt.datetime


class AnalisisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    paciente_id: int
    fecha: dt.datetime
    transcripcion: str
    clasificacion: str
    confianza: float
    probabilidades: dict[str, float]
    reporte: Optional[ReporteOut]


class AnalisisResumenOut(BaseModel):
    """Version liviana para listar el historial sin traer transcripcion/reporte completos."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    fecha: dt.datetime
    clasificacion: str
    confianza: float
