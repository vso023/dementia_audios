"""
Features linguisticas (7 columnas) desde texto plano de Whisper.

USO ACTUAL: solo DESCRIPTIVO. El clasificador de la herramienta es el
modelo multimodal (ver app/pipeline/multimodal_classifier.py), que
clasifica sobre embeddings de BETO — estas 7 features NO participan de
esa clasificacion. Se siguen calculando unicamente para darle al LLM
contexto legible ("cobertura del texto de referencia", "repeticiones
detectadas", etc.) al redactar el reporte (ver report_llm.py).

Historicamente estas mismas 7 features se usaron para entrenar el Naive
Bayes de texto que la herramienta usaba antes (accuracy 0.528 sobre
transcripciones CHAT gold, o ~0.40-0.52 segun el experimento posterior
que comparo CHAT vs Whisper con la particion por participante — ver
clean.ipynb seccion 5.2). Ese Naive Bayes y toda la comparacion de
modelos quedan preservados en el notebook para la tesis, pero ya no se
usan aqui.

Cinco de las 7 features (n_tokens, n_unicos, ttr, cobertura_quijote,
sustituciones) se derivan directamente del texto. Las otras dos son
aproximaciones desde texto plano + timestamps de Whisper en vez de
anotaciones CHAT manuales:
  - repeticiones: heuristica de tokens identicos consecutivos.
  - velocidad_lectura: n_tokens / (fin de la ultima palabra - inicio de
    la primera palabra), usando timestamps de Whisper.
"""
from __future__ import annotations

from nltk.tokenize import word_tokenize

QUIJOTE_REF = """en un lugar de la mancha de cuyo nombre no quiero acordarme no ha mucho
tiempo que vivía un hidalgo de los de lanza en astillero adarga antigua rocín flaco y galgo
corredor una olla de algo más vaca que carnero salpicón las más noches duelos y quebrantos
los sábados lentejas los viernes algún palomino de añadidura los domingos consumían las tres
partes de su hacienda el resto della concluían sayo de velarte calzas de velludo para las
fiestas con sus pantuflos de lo mesmo y los días de entresemana se honraba con su vellorí
de lo más fino tenía en su casa una ama que pasaba de los cuarenta y una sobrina que no
llegaba a los veinte y un mozo de campo y plaza que así ensillaba el rocín como tomaba la
podadera"""

_TOKENS_REF = word_tokenize(QUIJOTE_REF.lower(), language="spanish")
SET_REF = set(_TOKENS_REF)  # publico: usado para calcular cobertura/sustituciones

FEATURE_COLUMNS = (
    "n_tokens", "n_unicos", "ttr", "repeticiones",
    "cobertura_quijote", "sustituciones", "velocidad_lectura",
)


def extraer_features_texto(texto: str, word_spans: list[tuple[float, float]]) -> dict:
    tokens = word_tokenize(texto.lower(), language="spanish")
    tokens_limpios = [t for t in tokens if t.isalpha()]
    set_pac = set(tokens_limpios)

    palabras_correctas = set_pac.intersection(SET_REF)
    cobertura = len(palabras_correctas) / len(SET_REF)
    sustituciones = len(set_pac - SET_REF)

    # Aproximacion de 'repeticiones': tokens identicos consecutivos.
    repeticiones = sum(1 for i in range(1, len(tokens)) if tokens[i] == tokens[i - 1])

    n_tokens = len(tokens_limpios)
    n_unicos = len(set_pac)
    ttr = n_unicos / max(n_tokens, 1)

    if word_spans:
        duracion = word_spans[-1][1] - word_spans[0][0]
        velocidad = n_tokens / max(duracion, 1)
    else:
        velocidad = 0.0

    return {
        "n_tokens": round(float(n_tokens), 4),
        "n_unicos": round(float(n_unicos), 4),
        "ttr": round(float(ttr), 4),
        "repeticiones": round(float(repeticiones), 4),
        "cobertura_quijote": round(float(cobertura), 4),
        "sustituciones": round(float(sustituciones), 4),
        "velocidad_lectura": round(float(velocidad), 4),
    }
