"""
Rama de TEXTO, paso 1: transcripcion con Whisper.

El modelo se carga una sola vez (singleton perezoso) porque cargarlo por
request seria demasiado costoso. word_timestamps=True es necesario para
poder aproximar 'velocidad_lectura' en text_features.py sin las anotaciones
manuales CHAT que se usaron para entrenar el Naive Bayes original.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import whisper

from app.config import (
    WHISPER_DEVICE, WHISPER_DOWNLOAD_ROOT, WHISPER_LANGUAGE, WHISPER_MODEL_SIZE,
)

# Numero de intentos totales (1 original + reintentos) ante el
# RuntimeError intermitente de whisper en CPU ("cannot reshape tensor of
# 0 elements..."), confirmado por prueba real: la misma grabacion fallo
# una vez y funciono al reintentar de inmediato con el mismo modelo ya
# cargado, sin cambiar nada mas — indica una falla transitoria de la
# decodificacion, no un problema del archivo de audio.
MAX_INTENTOS_TRANSCRIPCION = 3


@dataclass
class TranscripcionResultado:
    texto: str
    word_spans: list[tuple[float, float]]  # (inicio, fin) en segundos, por palabra


@lru_cache(maxsize=1)
def _modelo():
    # device=None deja que whisper autodetecte (cuda si hay, si no cpu).
    # WHISPER_DEVICE="cpu" fuerza CPU — util cuando la VRAM esta ocupada
    # por otras apps (ver README, seccion de troubleshooting).
    device = None if WHISPER_DEVICE == "auto" else WHISPER_DEVICE
    return whisper.load_model(WHISPER_MODEL_SIZE, device=device, download_root=WHISPER_DOWNLOAD_ROOT)


def transcribir(ruta_audio: str) -> TranscripcionResultado:
    error_final: Exception | None = None
    resultado = None
    for intento in range(1, MAX_INTENTOS_TRANSCRIPCION + 1):
        try:
            resultado = _modelo().transcribe(
                ruta_audio, language=WHISPER_LANGUAGE, fp16=False, word_timestamps=True
            )
            break
        except RuntimeError as e:
            error_final = e
            if intento < MAX_INTENTOS_TRANSCRIPCION:
                continue
    if resultado is None:
        raise error_final

    texto = resultado["text"].strip()
    spans: list[tuple[float, float]] = []
    for segmento in resultado.get("segments", []):
        for palabra in segmento.get("words", []):
            spans.append((palabra["start"], palabra["end"]))
    return TranscripcionResultado(texto=texto, word_spans=spans)
