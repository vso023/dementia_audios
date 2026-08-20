# Imagen del backend (FastAPI + pipeline de modelos). Pensada para un
# servidor SIN GPU y con RAM limitada: instala PyTorch en su build
# CPU-only (el wheel por defecto de PyPI trae CUDA embebido, pesa varios
# GB de mas y no aporta nada aqui), y no copia nada que no haga falta
# para SERVIR la app (sin training/, sin tests/, sin scripts sueltos de
# depuracion).
FROM python:3.10-slim

# ffmpeg: Whisper lo necesita para decodificar el audio subido.
# libsndfile1: libreria que usa librosa/soundfile para leer WAV.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ffmpeg \
      libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Se instala primero el PyTorch CPU-only desde el indice oficial; cuando
# requirements.txt pida "torch>=2.0" mas abajo, pip ve que ya esta
# satisfecho y no lo vuelve a instalar desde el indice por defecto
# (que traeria la build con CUDA).
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Solo lo necesario para correr el servidor: el codigo de la app y los
# pesos del clasificador multimodal ya entrenado (~1MB, va en el repo).
# NO se copian training/, tests/, ni los scripts sueltos de depuracion.
COPY app ./app
COPY models ./models

# Los modelos de Whisper/Wav2Vec2/BETO NO se descargan durante el build
# (inflarian la imagen varios GB y no son necesarios para construirla).
# Se descargan solos, en runtime, la primera vez que se procesa un audio,
# hacia las rutas que marquen HF_HOME / WHISPER_DOWNLOAD_ROOT — variables
# que docker-compose apunta a volumenes persistentes para no re-descargar
# en cada reinicio del contenedor.

EXPOSE 8000

# Un solo proceso, un solo worker: cada worker adicional cargaria su
# propia copia de Whisper + Wav2Vec2 + BETO en memoria — inviable con
# la RAM disponible en este servidor. Sin --reload (eso es solo para
# desarrollo local). --proxy-headers: toda la herramienta corre detras
# del proxy del administrador (dominio + SSL); esto hace que uvicorn
# confie en X-Forwarded-*/Host en vez de ver siempre al contenedor del
# frontend como "el cliente" (afecta logs y cualquier URL absoluta que
# se genere, no hay nada mas que configurar de este lado).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
