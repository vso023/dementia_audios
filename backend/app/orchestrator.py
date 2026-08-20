"""
Orquesta el analisis completo de un audio: transcribe con Whisper, extrae
los dos embeddings (audio con Wav2Vec2, texto con BETO) y corre el
clasificador multimodal + el LLM para redactar el reporte final.

Todo el trabajo con los modelos (Whisper, Wav2Vec2, BETO, el MLP) corre
SECUENCIAL y en UN SOLO worker thread por request — no repartido entre
threads distintos del pool. Se probaron (y descartaron) dos variantes mas
"paralelas" antes de llegar a esta:
  1. Las dos ramas concurrentes via asyncio.gather + threads distintos:
     tiraba CUDA OutOfMemoryError al cargar Wav2Vec2 y BETO al mismo
     tiempo desde threads distintos (fragmentacion de VRAM, confirmado
     con 6+ GB libres reportados por CUDA en el momento del fallo).
  2. Las dos ramas secuenciales pero cada una en su propio
     run_in_executor (o sea, en threads distintos igual, solo que uno
     despues del otro): tiraba Segmentation fault (exit code 139) al
     pasar de un modelo cargado en GPU (Wav2Vec2, en un thread) a
     Whisper en CPU (en otro thread) — mezclar CUDA y CPU entre threads
     distintos del mismo proceso resulto inestable en este entorno.
Confirmado por prueba directa del endpoint real en ambos casos, no es
una suposicion.

La version actual (todo en un solo thread, mismo orden que ya se probo
funcionando end-to-end en probar_pipeline_sin_llm.py: transcribir primero,
despues embeddings) es mas lenta que "paralelo real", pero es la que no
crashea. El LLM (I/O de red, no toca GPU/CPU de modelos) si corre en su
propio run_in_executor aparte, eso no tuvo problema.

Si cualquiera de las dos modalidades falla (audio no procesable,
transcripcion vacia), el analisis se aborta por completo — la
herramienta nunca clasifica con una sola modalidad. Ver
ModalidadFaltanteError en app.pipeline.multimodal_classifier.
"""
from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from app.pipeline.audio_features import extraer_features_audio
from app.pipeline.multimodal_classifier import (
    ClasificacionMultimodal, ModalidadFaltanteError, clasificar_multimodal,
    extraer_embedding_audio, extraer_embedding_texto,
)
from app.pipeline.report_llm import ReporteGenerado, generar_reporte
from app.pipeline.text_features import extraer_features_texto
from app.pipeline.transcription import transcribir

_executor = ThreadPoolExecutor(max_workers=4)


@dataclass
class ResultadoAnalisis:
    transcripcion: str
    clasificacion: ClasificacionMultimodal
    features_audio: dict
    features_texto: dict
    reporte: ReporteGenerado


def _procesar_y_clasificar(ruta_audio: str):
    """Todo el trabajo de modelos (Whisper, Wav2Vec2, BETO, MLP) en UN
    SOLO thread, mismo orden probado en probar_pipeline_sin_llm.py.
    Devuelve (texto_transcrito, clasificacion, features_audio, features_texto)."""
    transcripcion = transcribir(ruta_audio)
    embedding_texto = extraer_embedding_texto(transcripcion.texto)
    try:
        features_texto = extraer_features_texto(transcripcion.texto, transcripcion.word_spans)
    except Exception:
        features_texto = {}

    embedding_audio = extraer_embedding_audio(ruta_audio)
    try:
        features_audio = extraer_features_audio(ruta_audio)
    except Exception:
        features_audio = {}

    clasificacion = clasificar_multimodal(embedding_audio, embedding_texto)

    return transcripcion.texto, clasificacion, features_audio, features_texto


async def analizar_audio(ruta_audio: str) -> ResultadoAnalisis:
    loop = asyncio.get_running_loop()

    try:
        texto_transcrito, clasificacion, features_audio, features_texto = await loop.run_in_executor(
            _executor, _procesar_y_clasificar, ruta_audio
        )
    except ModalidadFaltanteError:
        # Se relanza tal cual — app.main la traduce a un 422 con mensaje
        # claro. No hay clasificacion parcial con una sola modalidad.
        raise

    reporte = await loop.run_in_executor(
        _executor, generar_reporte, texto_transcrito, clasificacion, features_audio, features_texto
    )

    return ResultadoAnalisis(
        transcripcion=texto_transcrito,
        clasificacion=clasificacion,
        features_audio=features_audio,
        features_texto=features_texto,
        reporte=reporte,
    )
