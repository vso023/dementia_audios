# -*- coding: utf-8 -*-
"""
Prueba el pipeline multimodal (audio + texto -> clasificacion) DIRECTAMENTE,
sin pasar por la API ni por el LLM. Util para validar que el modelo
entrenado funciona sobre un audio real antes de tener una
ANTHROPIC_API_KEY valida (el backend completo no arranca sin ella).

Uso: python probar_pipeline_sin_llm.py [ruta_audio.wav]
Si no se pasa ruta, usa el primer audio de audio_clean/HC/ como ejemplo.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.pipeline.multimodal_classifier import (
    clasificar_multimodal, extraer_embedding_audio, extraer_embedding_texto,
)
from app.pipeline.transcription import transcribir


def elegir_audio_de_ejemplo() -> str:
    carpeta = BACKEND_DIR.parent.parent / "audio_clean" / "HC"
    archivos = sorted(carpeta.glob("*.wav"))
    if not archivos:
        raise FileNotFoundError(f"No hay audios de ejemplo en {carpeta}")
    return str(archivos[0])


def main():
    ruta_audio = sys.argv[1] if len(sys.argv) > 1 else elegir_audio_de_ejemplo()
    print(f"Audio de prueba: {ruta_audio}\n")

    print("== Transcripcion (Whisper) ==")
    transcripcion = transcribir(ruta_audio)
    print(f"  Texto: {transcripcion.texto[:200]}...\n")

    print("== Embeddings ==")
    embedding_audio = extraer_embedding_audio(ruta_audio)
    embedding_texto = extraer_embedding_texto(transcripcion.texto)
    print(f"  Audio (Wav2Vec2): {embedding_audio.shape}")
    print(f"  Texto (BETO): {embedding_texto.shape}\n")

    print("== Clasificacion multimodal ==")
    resultado = clasificar_multimodal(embedding_audio, embedding_texto)
    print(f"  Clasificacion: {resultado.clasificacion}")
    print(f"  Confianza: {resultado.confianza:.2f}")
    print(f"  Probabilidades: {resultado.probabilidades}\n")

    print("OK — el pipeline multimodal funciona. El paso que falta (redaccion")
    print("via LLM) requiere ANTHROPIC_API_KEY valida; no se ejecuta en este script.")


if __name__ == "__main__":
    main()
