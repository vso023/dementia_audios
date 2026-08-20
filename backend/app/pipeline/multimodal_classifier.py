"""
Clasificador UNICO de la herramienta: fusion multimodal (audio + texto).

Reemplaza a los dos clasificadores separados que existian antes (Naive
Bayes de texto y SVM de audio, ver historial en git y en clean.ipynb —
esos experimentos y los 5 modelos de deep learning de audio quedan
preservados intactos en el notebook para la tesis, pero ya no se usan
en esta herramienta).

Arquitectura validada en clean.ipynb, Seccion 7.3 (fusion de embeddings
congelados + data augmentation en el train): F1 macro 0.500 sobre la
particion de test (71 participantes, nunca vista en entrenamiento).
Ver train_multimodal_classifier.py para el proceso de entrenamiento
completo — este modulo SOLO carga los pesos ya entrenados y corre
inferencia.

Reproducibilidad (critico): el preprocesamiento aqui tiene que ser
BIT A BIT el mismo que se uso para entrenar, o el desempeño real no
coincide con el validado:
  - Mismo checkpoint de audio: jonatasgrosman/wav2vec2-large-xlsr-53-spanish
  - Mismo checkpoint de texto: dccuchile/bert-base-spanish-wwm-cased
  - Audio: 16kHz mono, tope de 60s (mismo tope usado en el entrenamiento
    por limite de VRAM — un audio mas largo se trunca igual aqui)
  - Texto: tokenizado con truncation=True, max_length=512
  - Ambos: mean pooling sobre la capa final (texto, consciente de
    attention_mask; audio, promedio simple)
  - El StandardScaler es el MISMO objeto ajustado en el entrenamiento,
    cargado desde disco — nunca se reajusta aqui.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

import joblib
import librosa
import numpy as np
import torch
import torch.nn as nn
from transformers import (
    AutoModel, AutoTokenizer, Wav2Vec2FeatureExtractor, Wav2Vec2Model,
)

from app.config import MULTIMODAL_MODEL_PATH, MULTIMODAL_SCALER_PATH, TORCH_DEVICE

W2V2_MODEL_NAME = "jonatasgrosman/wav2vec2-large-xlsr-53-spanish"
BETO_MODEL_NAME = "dccuchile/bert-base-spanish-wwm-cased"

SR = 16000
CAP_S = 60  # tope de duracion de audio, igual que en el entrenamiento
DIM_AUDIO = 1024
DIM_TEXTO = 768
CLASES = ("AD", "HC", "MCI")  # orden fijo, debe coincidir con el entrenamiento


class ModalidadFaltanteError(Exception):
    """Se lanza cuando el audio o el texto no se pudieron procesar. La
    herramienta NUNCA clasifica con una sola modalidad — es preferible
    avisar que el analisis no se pudo completar."""


@dataclass
class ClasificacionMultimodal:
    clasificacion: str
    confianza: float
    probabilidades: dict[str, float]


class MultimodalMLP(nn.Module):
    """Cabezal de clasificacion sobre la concatenacion [embedding_audio,
    embedding_texto]. Misma arquitectura usada en el entrenamiento
    (clean.ipynb Seccion 7.1/7.3) — no cambiar sin reentrenar."""

    def __init__(self, in_dim: int = DIM_AUDIO + DIM_TEXTO, n_clases: int = 3, dropout: float = 0.4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128), nn.ReLU(), nn.Dropout(dropout),
            nn.Linear(128, 64), nn.ReLU(), nn.Dropout(dropout),
            nn.Linear(64, n_clases),
        )

    def forward(self, x):
        return self.net(x)


@lru_cache(maxsize=1)
def _dispositivo() -> torch.device:
    if TORCH_DEVICE == "cuda" and not torch.cuda.is_available():
        return torch.device("cpu")
    return torch.device(TORCH_DEVICE)


@lru_cache(maxsize=1)
def _cargar_wav2vec2():
    extractor = Wav2Vec2FeatureExtractor.from_pretrained(W2V2_MODEL_NAME)
    modelo = Wav2Vec2Model.from_pretrained(W2V2_MODEL_NAME).to(_dispositivo()).eval()
    return extractor, modelo


@lru_cache(maxsize=1)
def _cargar_beto():
    tokenizer = AutoTokenizer.from_pretrained(BETO_MODEL_NAME)
    modelo = AutoModel.from_pretrained(BETO_MODEL_NAME).to(_dispositivo()).eval()
    return tokenizer, modelo


@lru_cache(maxsize=1)
def _cargar_clasificador():
    if not MULTIMODAL_MODEL_PATH.exists() or not MULTIMODAL_SCALER_PATH.exists():
        raise FileNotFoundError(
            f"No se encontraron los artefactos del clasificador multimodal en "
            f"{MULTIMODAL_MODEL_PATH.parent}. Corre "
            "webapp/backend/training/train_multimodal_classifier.py primero."
        )
    modelo = MultimodalMLP().to(_dispositivo())
    modelo.load_state_dict(torch.load(MULTIMODAL_MODEL_PATH, map_location=_dispositivo()))
    modelo.eval()
    scaler = joblib.load(MULTIMODAL_SCALER_PATH)
    return modelo, scaler


def _mean_pooling_texto(last_hidden_state: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
    mask = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    return (last_hidden_state * mask).sum(1) / mask.sum(1).clamp(min=1e-9)


def extraer_embedding_audio(ruta_audio: str) -> np.ndarray:
    """Embedding Wav2Vec2 (1024-dim) de un archivo de audio. Lanza
    ModalidadFaltanteError si el audio no se puede cargar/procesar."""
    try:
        audio, _ = librosa.load(ruta_audio, sr=SR, mono=True)
    except Exception as e:
        raise ModalidadFaltanteError(f"No se pudo leer el archivo de audio: {e}") from e

    if audio.size == 0:
        raise ModalidadFaltanteError("El archivo de audio no contiene señal de audio.")

    if len(audio) > CAP_S * SR:
        audio = audio[: CAP_S * SR]

    extractor, modelo = _cargar_wav2vec2()
    inputs = extractor(audio, sampling_rate=SR, return_tensors="pt")
    with torch.no_grad():
        salida = modelo(inputs.input_values.to(_dispositivo()))
    return salida.last_hidden_state.mean(dim=1).squeeze(0).cpu().numpy()


def extraer_embedding_texto(texto: str) -> np.ndarray:
    """Embedding BETO (768-dim) de un texto transcrito. Lanza
    ModalidadFaltanteError si el texto esta vacio."""
    if not texto or not texto.strip():
        raise ModalidadFaltanteError("La transcripción del audio quedó vacía.")

    tokenizer, modelo = _cargar_beto()
    inputs = tokenizer(texto, return_tensors="pt", truncation=True, max_length=512)
    inputs = {k: v.to(_dispositivo()) for k, v in inputs.items()}
    with torch.no_grad():
        salida = modelo(**inputs)
    return _mean_pooling_texto(salida.last_hidden_state, inputs["attention_mask"]).squeeze(0).cpu().numpy()


def clasificar_multimodal(embedding_audio: np.ndarray, embedding_texto: np.ndarray) -> ClasificacionMultimodal:
    """Recibe los DOS embeddings ya extraidos (audio + texto) y produce
    la clasificacion final. Ambas modalidades son obligatorias — no
    existe un modo de clasificar con una sola."""
    modelo, scaler = _cargar_clasificador()

    x = np.concatenate([embedding_audio, embedding_texto]).reshape(1, -1)
    x_scaled = scaler.transform(x)
    x_tensor = torch.tensor(x_scaled, dtype=torch.float32).to(_dispositivo())

    with torch.no_grad():
        logits = modelo(x_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

    idx_max = int(np.argmax(probs))
    return ClasificacionMultimodal(
        clasificacion=CLASES[idx_max],
        confianza=float(probs[idx_max]),
        probabilidades={clase: float(p) for clase, p in zip(CLASES, probs)},
    )
