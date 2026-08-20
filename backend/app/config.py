"""
Configuracion centralizada, leida desde variables de entorno.
Ninguna clave ni endpoint de LLM se hardcodea aqui ni en ningun otro archivo.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Carga backend/.env si existe. Variables ya exportadas en el entorno
# (ej. `set ANTHROPIC_API_KEY=...` o las de un contenedor/CI) tienen
# prioridad y no se sobreescriben (override=False, comportamiento default).
load_dotenv(BASE_DIR / ".env")
MODELS_DIR = BASE_DIR / "models"
# "or" en vez de solo el default de os.environ.get: si la variable queda
# DEFINIDA PERO VACIA en .env (ej. "DEMENTIA_DB_PATH="), get() devuelve ""
# en vez de caer al default, y sqlite3 interpreta "" como base de datos
# en memoria (se pierde todo al cerrar el proceso) — bug real encontrado
# al regenerar la base de datos, no solo hipotetico.
DB_PATH = os.environ.get("DEMENTIA_DB_PATH") or str(BASE_DIR / "dementia_tool.db")

WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "medium")
WHISPER_LANGUAGE = os.environ.get("WHISPER_LANGUAGE", "es")
# "auto" (default) deja que whisper elija cuda si hay GPU libre, si no cpu.
# "cpu" fuerza CPU — util si la VRAM esta ocupada por otras apps.
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "auto")
# Whisper "medium" pesa ~1.5GB y por defecto se descarga a ~/.cache/whisper
# (en Windows, la unidad C:). Si esa unidad tiene poco espacio, se puede
# redirigir la descarga a otra unidad/carpeta con esta variable — None
# (default) deja el comportamiento estandar de whisper sin cambios.
WHISPER_DOWNLOAD_ROOT = os.environ.get("WHISPER_DOWNLOAD_ROOT") or None

MULTIMODAL_MODEL_PATH = MODELS_DIR / "multimodal_mlp.pt"
MULTIMODAL_SCALER_PATH = MODELS_DIR / "multimodal_scaler.joblib"

# Dispositivo para Wav2Vec2 + BETO + el clasificador multimodal. Default
# "cpu" (a diferencia de WHISPER_DEVICE, que default a "auto"): en esta
# GPU de 8GB se repitieron CUDA OutOfMemoryError reales al compartir VRAM
# con otras apps, incluso con Whisper ya forzado a CPU. Se puede poner
# TORCH_DEVICE=cuda si se sabe que la GPU esta libre.
TORCH_DEVICE = os.environ.get("TORCH_DEVICE") or "cpu"

# ── Configuracion del LLM (solo redaccion del reporte, nunca clasificacion) ──
# La API key y el modelo se leen exclusivamente de variables de entorno.
# No hay ningun valor por defecto para la key: si falta, la app debe fallar
# de forma explicita en el arranque en vez de silenciarlo.
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-5")

MAX_UPLOAD_SECONDS = int(os.environ.get("DEMENTIA_MAX_AUDIO_SECONDS", "600"))


def require_llm_config() -> None:
    """Falla explícitamente si falta la configuración del LLM, en vez de
    dejar que report_llm.py descubra un None a mitad de una request."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY no esta definida. "
            "Configúrala como variable de entorno antes de iniciar el backend."
        )
