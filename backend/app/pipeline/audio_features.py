"""
Extraccion de features acusticas clasicas (MFCC, energia, ZCR, pitch,
centroide) desde un archivo de audio.

USO ACTUAL: solo DESCRIPTIVO. El clasificador de la herramienta es el
modelo multimodal (ver app/pipeline/multimodal_classifier.py), que
clasifica sobre embeddings de Wav2Vec2 — estas 34 features NO participan
de esa clasificacion. Se siguen calculando unicamente para darle al LLM
contexto legible ("duracion", "proporcion de silencio", etc.) al redactar
el reporte (ver report_llm.py).

Historicamente estas mismas 34 columnas se usaron para entrenar el SVM
de audio que la herramienta usaba antes (ver clean.ipynb seccion 3.3 —
ese experimento y el resto de la comparacion de modelos clasicos/DL
quedan preservados ahi para la tesis, pero el SVM ya no se usa aqui).
"""
from __future__ import annotations

import numpy as np
import librosa

SR = 16000

# Orden fijo de columnas — debe coincidir exactamente con el usado al
# entrenar el scaler/SVM, o las predicciones quedan desalineadas.
FEATURE_COLUMNS = (
    ["duracion", "energia_mean", "energia_std", "zcr_mean", "proporcion_silencio",
     "pitch_mean", "pitch_std", "centroid_mean"]
    + [f"mfcc{i}_mean" for i in range(1, 14)]
    + [f"mfcc{i}_std" for i in range(1, 14)]
)


def extraer_features_audio(ruta: str) -> dict:
    audio, sr = librosa.load(ruta, sr=SR)

    duracion = librosa.get_duration(y=audio, sr=sr)
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    rms = librosa.feature.rms(y=audio)[0]
    zcr = librosa.feature.zero_crossing_rate(audio)[0]
    centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
    f0, voiced_flag, _ = librosa.pyin(audio, fmin=50, fmax=400, sr=sr)

    features = {
        "duracion": duracion,
        "energia_mean": float(np.mean(rms)),
        "energia_std": float(np.std(rms)),
        "zcr_mean": float(np.mean(zcr)),
        "proporcion_silencio": float(np.mean(rms < 0.01)),
        "pitch_mean": float(np.nanmean(f0)) if np.any(voiced_flag) else 0.0,
        "pitch_std": float(np.nanstd(f0)) if np.any(voiced_flag) else 0.0,
        "centroid_mean": float(np.mean(centroid)),
    }
    for j in range(13):
        features[f"mfcc{j + 1}_mean"] = float(np.mean(mfcc[j]))
        features[f"mfcc{j + 1}_std"] = float(np.std(mfcc[j]))

    return features


def features_a_vector(features: dict) -> np.ndarray:
    """Convierte el dict de features al vector ordenado que espera el scaler/SVM."""
    return np.array([[features[col] for col in FEATURE_COLUMNS]])
