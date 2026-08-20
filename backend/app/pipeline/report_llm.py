"""
=============================================================================
 ÚNICO PUNTO DE CONEXIÓN CON EL LLM EN TODO EL SISTEMA.
 El LLM aquí SOLO redacta un reporte interpretable a partir de la
 clasificación YA PRODUCIDA por el modelo multimodal (fusión de embeddings
 de audio con Wav2Vec2 y de texto con BETO). NUNCA se le pide que
 clasifique — esa decisión ya se tomó antes de llegar a este modulo. Ver
 Fase 2 del proyecto: el LLM como clasificador zero-shot midió 32% de
 accuracy (por debajo del azar), por eso se descartó como clasificador.

 La API key y el modelo se leen exclusivamente de variables de entorno
 (ANTHROPIC_API_KEY, ANTHROPIC_MODEL) via app.config — nunca hardcodeadas.
=============================================================================
"""
from __future__ import annotations

from dataclasses import dataclass

import anthropic

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL, require_llm_config
from app.pipeline.multimodal_classifier import ClasificacionMultimodal

DISCLAIMER_FIJO = (
    "\n\n---\n"
    "**Aviso importante:** este reporte es un insumo de apoyo generado por "
    "modelos automáticos y no constituye un diagnóstico médico. Los "
    "resultados deben ser interpretados por un profesional de la salud "
    "calificado, en conjunto con una evaluación clínica completa."
)

_SYSTEM_PROMPT = """Eres un asistente que redacta reportes clínicos de apoyo a partir de \
una clasificación YA CALCULADA por un modelo de deep learning entrenado (fusión de \
embeddings de audio y de texto). No diagnosticas ni reclasificas: tu única tarea es \
interpretar y explicar en lenguaje claro el resultado que se te entrega.

Reglas estrictas:
- Hay UNA sola clasificación: la produce el modelo multimodal a partir del audio y la \
transcripción juntos, no dos señales separadas.
- Las "características descriptivas" que se te dan (duración, energía, cobertura del \
texto de referencia, etc.) son observaciones del habla y el texto para dar contexto \
legible al lector — NO son la razón por la que el modelo clasificó como lo hizo (el \
modelo usa representaciones internas del audio y el texto, no esas características). \
Preséntalas como contexto descriptivo, nunca como "el modelo decidió esto porque esa \
característica es alta/baja".
- No inventes ni redondees la confianza más allá del número que se te da.
- Debes incluir explícitamente, en algún punto del reporte, que esto es un insumo de \
apoyo y NO un diagnóstico médico.
- Sé conciso, claro, y evita jerga técnica innecesaria; el lector puede ser un \
profesional de salud sin formación en machine learning.
"""


@dataclass
class ReporteGenerado:
    contenido: str
    modelo_llm: str


def _construir_prompt_usuario(
    texto_transcrito: str,
    clasificacion: ClasificacionMultimodal,
    features_audio: dict,
    features_texto: dict,
) -> str:
    otras_probs = ", ".join(
        f"{clase}: {p:.2f}" for clase, p in clasificacion.probabilidades.items()
    )
    return f"""Redacta un reporte interpretable a partir de este resultado:

## Transcripción del audio (Whisper)
{texto_transcrito[:1500]}

## Clasificación (modelo multimodal: audio + texto)
- Clasificación: {clasificacion.clasificacion}
- Confianza del modelo: {clasificacion.confianza:.2f}
- Probabilidades por clase: {otras_probs}

## Características descriptivas observadas (contexto, no la causa de la clasificación)
- Audio: duración={features_audio.get('duracion', 'n/d')}, \
energía media={features_audio.get('energia_mean', 'n/d')}, \
proporción de silencio={features_audio.get('proporcion_silencio', 'n/d')}
- Texto: cantidad de palabras={features_texto.get('n_tokens', 'n/d')}, \
cobertura del texto de referencia={features_texto.get('cobertura_quijote', 'n/d')}, \
repeticiones detectadas={features_texto.get('repeticiones', 'n/d')}

Redacta el reporte en español, en 3-5 párrafos cortos, dirigido a un profesional de salud."""


def generar_reporte(
    texto_transcrito: str,
    clasificacion: ClasificacionMultimodal,
    features_audio: dict,
    features_texto: dict,
) -> ReporteGenerado:
    require_llm_config()

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=1200,
        system=_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": _construir_prompt_usuario(texto_transcrito, clasificacion, features_audio, features_texto),
        }],
    )

    texto_reporte = "".join(
        block.text for block in response.content if block.type == "text"
    )

    # El disclaimer se agrega SIEMPRE aqui, fuera del control del LLM —
    # defensa en profundidad ademas de la instruccion en el system prompt.
    contenido_final = texto_reporte + DISCLAIMER_FIJO

    return ReporteGenerado(contenido=contenido_final, modelo_llm=ANTHROPIC_MODEL)
