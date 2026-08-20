# Herramienta de apoyo a detección de deterioro cognitivo

Insumo de apoyo para profesionales de salud — **no es una herramienta de
diagnóstico**. Analiza una grabación de lectura en voz alta y produce un
reporte interpretable a partir de una única clasificación multimodal y un
LLM que solo redacta (nunca clasifica).

## Arquitectura

- `backend/` — API FastAPI (Python). Extrae embeddings de audio y de texto
  en paralelo, los fusiona en un único clasificador, y llama al LLM solo
  para redactar el reporte final.
- `frontend/` — SPA en React + Vite. Habla con el backend únicamente vía HTTP.

```
audio subido → Wav2Vec2 (embedding de audio)   ─┐
             → Whisper → BETO (embedding texto) ─┴→ fusión + MLP → LLM redacta reporte
```

Si Wav2Vec2 o la transcripción fallan (audio no procesable, transcripción
vacía), el análisis se aborta con un error claro — nunca se clasifica con
una sola modalidad. Ver `ModalidadFaltanteError` en
`app/pipeline/multimodal_classifier.py`.

## Modelos

| Componente | Modelo | Rol |
|---|---|---|
| Embedding de audio | `jonatasgrosman/wav2vec2-large-xlsr-53-spanish` | Vector de 1024-dim (mean pooling), congelado |
| Transcripción | Whisper `medium` (local) | Convierte audio a texto |
| Embedding de texto | `dccuchile/bert-base-spanish-wwm-cased` (BETO) | Vector de 768-dim (mean pooling), congelado |
| Clasificador | MLP (`PyTorch`) sobre la concatenación de ambos embeddings | **Único clasificador** — F1 macro 0.500 sobre el test (71 participantes) |
| LLM | Configurable vía `ANTHROPIC_MODEL` (default `claude-opus-5`) | Solo redacta el reporte final — nunca clasifica |

Este clasificador multimodal reemplazó, en esta herramienta, a los dos
clasificadores separados que existían antes (Naive Bayes de texto sobre
7 features lingüísticas, SVM de audio sobre 34 features acústicas). Esos
modelos, junto con 5 arquitecturas de deep learning sobre audio y toda la
comparación experimental (clásicos vs. embeddings vs. fusión multimodal,
con y sin fine-tuning, con y sin data augmentation) quedan preservados
intactos en `clean.ipynb` (raíz del proyecto) como registro de tesis —
**ya no se usan en esta herramienta**. Ver `webapp/backend/training/
train_multimodal_classifier.py` para reproducir el entrenamiento del
modelo en producción.

Las 34 features acústicas y las 7 lingüísticas siguen calculándose
(`app/pipeline/audio_features.py`, `text_features.py`), pero **solo como
contexto descriptivo para el reporte del LLM** — ya no participan de
ninguna clasificación.

### Limitación conocida: MCI

El clasificador multimodal es el mejor modelo del proyecto en F1 macro
global, pero **no es el mejor detectando específicamente MCI** (F1 MCI
0.222) — un modelo TNN experimental (solo audio, ver `clean.ipynb`)
detecta MCI mejor (F1 0.408) aunque con peor desempeño global. Ningún
modelo probado hasta ahora resuelve MCI de forma confiable.

## Setup (desarrollo)

Requiere **Python 3.10** (el proyecto se probó específicamente con esa
versión — `torch`/`transformers`/`openai-whisper` deben estar instalados
en el mismo intérprete que se use para correr `uvicorn`; si la máquina
tiene varias instalaciones de Python, verificar con
`python --version` / `where python` cuál se está usando) y **Node 18+**.

### Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt

copy .env.example .env
# completar ANTHROPIC_API_KEY en .env (nunca hardcodear la key, ver
# "Variables de entorno" abajo)

# El clasificador multimodal entrenado (models/multimodal_mlp.pt +
# multimodal_scaler.joblib) ya viene incluido en el repo — no hace falta
# reentrenar para levantar la herramienta. Solo reentrenar si cambian los
# datos de entrenamiento (requiere GPU para tiempos razonables):
#   python training/train_multimodal_classifier.py

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno (`backend/.env`)

Copiar `backend/.env.example` a `backend/.env` y completar. Ninguna se
hardcodea en el código — ver `app/config.py`.

| Variable | Requerida | Descripción |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Sí** | Clave del LLM que redacta el reporte (nunca clasifica). Sin esto el backend falla al arrancar. |
| `ANTHROPIC_MODEL` | No | Modelo a usar (default `claude-opus-5`). |
| `WHISPER_MODEL_SIZE` | No | Tamaño del modelo Whisper (default `medium`). |
| `WHISPER_LANGUAGE` | No | Idioma de transcripción (default `es`). |
| `WHISPER_DEVICE` | No | `auto` (default) o `cpu`. |
| `WHISPER_DOWNLOAD_ROOT` | No | Carpeta de descarga del modelo Whisper (~1.5GB). |
| `TORCH_DEVICE` | No | Dispositivo para Wav2Vec2/BETO/el clasificador. Default `cpu` (ver nota abajo). |
| `HF_HOME` | No | Carpeta de caché de Hugging Face (Wav2Vec2 ~1.2GB + BETO ~440MB, se descargan la primera vez que corre un análisis). |
| `DEMENTIA_DB_PATH` | No | Ruta del archivo SQLite (default: junto al backend). |
| `DEMENTIA_MAX_AUDIO_SECONDS` | No | Límite de duración de audio aceptado. |

`TORCH_DEVICE` quedó en `cpu` por defecto porque, durante el desarrollo,
compartir una GPU de 8GB entre Whisper + Wav2Vec2 + BETO produjo
`CUDA OutOfMemoryError` reales. En un servidor con GPU dedicada y
suficiente VRAM, se puede poner `TORCH_DEVICE=cuda` (y `WHISPER_DEVICE=cuda`)
para acelerar la inferencia.

## Despliegue en producción

Notas para levantar esto en un servidor (más allá de `--reload` / `npm run dev`,
que son solo para desarrollo local):

**Backend** — un único proceso uvicorn, sin `--reload`:

```bash
cd backend
pip install -r requirements.txt
# completar backend/.env como en desarrollo
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Correr con **un solo worker** (no `--workers N` > 1): cada worker cargaría
su propia copia de Whisper + Wav2Vec2 + BETO + el clasificador en memoria,
multiplicando el uso de RAM/VRAM innecesariamente para una herramienta de
uso interno de baja concurrencia. Si más adelante hace falta más
capacidad, conviene una cola de trabajos en vez de más workers (ver
"Próximos pasos" abajo).

La primera vez que se procese un audio, el backend descarga los
checkpoints de Wav2Vec2 (~1.2GB) y BETO (~440MB) a `HF_HOME`, y Whisper
(~1.5GB) a `WHISPER_DOWNLOAD_ROOT` — el servidor necesita salida a
internet y espacio en disco para eso la primera vez; después queda
cacheado localmente.

**Frontend** — build estático, sin servidor Node en producción:

```bash
cd frontend
npm install
npm run build   # genera frontend/dist/
```

Servir `frontend/dist/` con cualquier servidor de archivos estáticos
(nginx, Caddy, etc.), y proxear las rutas `/api/*` hacia el backend
(`http://127.0.0.1:8000`) — el mismo rol que cumple `vite.config.js` en
desarrollo. Configurar `CORSMiddleware` en `app/main.py` con el dominio
real en vez de `allow_origins=["*"]` antes de exponerlo públicamente.

## Modelo de datos (SQLite)

`Profesional 1—N Paciente 1—N Análisis 1—1 Reporte`. El MVP implementa
guardar cada análisis con su reporte y consultar historial. Exportar a PDF,
comparar análisis en el tiempo, y eliminar quedan como siguientes
iteraciones (el esquema ya las soporta sin cambios estructurales).

## Próximos pasos sugeridos (fuera del MVP)

- Exportar reporte a PDF.
- Vista de comparación de análisis del mismo paciente en el tiempo.
- Eliminar análisis/pacientes (soft delete recomendado, no hard delete).
- Autenticación de profesionales (hoy no hay login; `profesional_id` se
  pasa directo).
- Procesamiento asíncrono con cola de trabajos si se necesitan audios largos.
