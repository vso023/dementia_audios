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

# PyTorch CPU-only. Dos detalles necesarios, no cosmeticos:
#
# 1. "--extra-index-url" en vez de "--index-url": con --index-url a
#    secas, pip busca TODO en el indice de PyTorch (incluidas
#    dependencias auxiliares como flit_core, que ahi no existen) y la
#    build falla. Con --extra-index-url, PyPI normal sigue disponible
#    para esas dependencias; el indice de PyTorch se suma, no reemplaza.
#
# 2. Version fijada con sufijo "+cpu" ("==2.6.0+cpu", no solo
#    "--extra-index-url" con "torch" a secas): con dos indices
#    disponibles, si solo se pide "torch" sin mas, pip puede resolver
#    igual la build con CUDA de PyPI (mismo numero de version, pip no
#    prioriza un indice sobre otro de forma confiable — es un problema
#    conocido, no hipotetico). El sufijo "+cpu" solo existe en el indice
#    de PyTorch, asi que fija sin ambiguedad cual de las dos se instala,
#    sin importar el orden de busqueda entre indices. 2.6.0 es ademas la
#    version exacta con la que se desarrollo y probo este proyecto
#    (torch 2.6.0+cu124 en la maquina de desarrollo).
RUN pip install --no-cache-dir torch==2.6.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# NLTK: el unico uso en todo el backend es word_tokenize(..., language=
# "spanish") en app/pipeline/text_features.py (se llama incluso al
# importar el modulo, para tokenizar el texto de referencia del
# Quijote — por eso hace falta ya en el arranque, no solo en el primer
# request). word_tokenize usa el tokenizador de oraciones Punkt por
# dentro; no hace falta ningun otro recurso de NLTK (nada de stopwords,
# POS tagger, etc. — se reviso el archivo completo).
#
# Se descargan "punkt" Y "punkt_tab": requirements.txt fija nltk>=3.8
# sin techo, y NLTK 3.8.2+ renombro el recurso de "punkt" a "punkt_tab"
# — la version que efectivamente se instale en el build (sea la que sea)
# puede pedir cualquiera de los dos segun cuando se reconstruya la
# imagen. Bajar ambos es barato (unos KB de texto) y evita que este
# mismo error reaparezca con el otro nombre en un rebuild futuro.
# NLTK_DATA fija explicitamente donde buscar los datos en runtime, sin
# depender de HOME/usuario del proceso.
ENV NLTK_DATA=/usr/local/nltk_data
RUN python -m nltk.downloader -d /usr/local/nltk_data punkt punkt_tab

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
