# -*- coding: utf-8 -*-
"""
Entrena el clasificador MULTIMODAL (audio + texto) que la herramienta usa
en produccion. Reproduce la metodologia validada en clean.ipynb, Seccion
7.3 (fusion de embeddings congelados + data augmentation sobre el train),
con dos mejoras de estabilizacion pedidas explicitamente para esta
corrida de produccion (ver mas abajo por que).

IMPORTANTE sobre reproducibilidad: la extraccion de embeddings usa las
MISMAS funciones (extraer_embedding_audio / extraer_embedding_texto) y
la MISMA clase de red (MultimodalMLP) que app/pipeline/multimodal_classifier.py
usa en produccion — se importan de ahi, no se duplican.

Por que N_RUNS corridas en vez de una: el entrenamiento del MLP no fija
semilla (ni la fijaba antes en clean.ipynb) y una sola corrida de
validacion (sesion anterior) dio F1 macro 0.500 / F1 MCI 0.222, mientras
que la primera corrida "de produccion" con semilla fija dio F1 macro
0.425 / F1 MCI 0.08 — una caida real, no ruido de reporte. Se entrena
N_RUNS veces con semillas distintas para: (a) medir esa variabilidad de
forma honesta (media +- desviacion estandar sobre TEST, para reportar en
la tesis) y (b) elegir el artefacto de produccion por el mejor F1 macro
de VALIDACION entre las N corridas — nunca por el mejor resultado de
test, eso seria hacer trampa.

Mejoras de estabilizacion aplicadas (pedidas explicitamente, documentadas
para que sea auditable):
  1. Seleccion del "mejor epoch" y early stopping por F1 macro de
     VALIDACION en vez de por val_loss — antes se optimizaba una metrica
     (loss) para reportar otra (F1 macro), lo cual no es lo mismo.
  2. Peso extra sobre la clase MCI en la funcion de perdida: al peso
     estandar por frecuencia inversa (total/conteo) se le aplica un
     multiplicador adicional MCI_PESO_EXTRA fijado ANTES de correr los
     experimentos (no ajustado despues de ver resultados) para no caer
     en un ajuste que favorezca el numero final de forma artificial.

Uso: python train_multimodal_classifier.py [--data-root RUTA] [--n-runs N]
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import random
import sys
from collections import Counter
from pathlib import Path

import joblib
import librosa
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
from app.config import MODELS_DIR, MULTIMODAL_MODEL_PATH, MULTIMODAL_SCALER_PATH  # noqa: E402
from app.pipeline.multimodal_classifier import (  # noqa: E402
    CAP_S, CLASES, SR, MultimodalMLP, _dispositivo,
    extraer_embedding_audio, extraer_embedding_texto,
)

N_AUG_AUDIO = 2       # copias aumentadas de audio por ejemplo de train
DATA_SEED = 42        # semilla de la particion y de la augmentation (fija, una sola vez)
MCI_PESO_EXTRA = 1.5  # multiplicador extra sobre el peso de clase de MCI, fijado a priori


def construir_particion(data_root: Path):
    """Misma logica y mismo random_state que clean.ipynb Seccion 3.4 —
    particion por participante, nunca cambiar sin invalidar la
    comparabilidad con todo lo documentado en el notebook."""
    base_clean = data_root / "audio_clean"
    rutas, etiquetas = [], []
    for clase in CLASES:
        carpeta = base_clean / clase
        for fname in sorted(os.listdir(carpeta)):
            if fname.endswith(".wav"):
                rutas.append(str(carpeta / fname))
                etiquetas.append(clase)

    le = LabelEncoder()
    etiquetas_num = le.fit_transform(etiquetas)

    X_train, X_test, y_train, y_test = train_test_split(
        rutas, etiquetas_num, test_size=0.2, random_state=DATA_SEED, stratify=etiquetas_num)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15, random_state=DATA_SEED, stratify=y_train)

    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    assert (len(X_train), len(X_val), len(X_test)) == (238, 42, 71), (
        "La particion no coincide con la usada para validar el modelo (238/42/71)."
    )
    return X_train, X_val, X_test, [CLASES[i] for i in y_train], [CLASES[i] for i in y_val], [CLASES[i] for i in y_test]


def cargar_transcripciones(data_root: Path) -> dict:
    with open(data_root / "transcripciones_whisper.json", encoding="utf-8") as f:
        whisper = json.load(f)
    return {r["archivo"]: r["texto"] for r in whisper.values()}


def _archivo_de(ruta: str) -> str:
    return Path(ruta).stem


def augmentar_audio(audio: np.ndarray, sr: int, tipo: str) -> np.ndarray:
    if tipo == "ruido":
        return audio + np.random.normal(0, 0.005, len(audio))
    if tipo == "pitch":
        return librosa.effects.pitch_shift(audio, sr=sr, n_steps=np.random.uniform(-2, 2))
    if tipo == "stretch":
        return librosa.effects.time_stretch(audio, rate=np.random.uniform(0.9, 1.1))
    if tipo == "shift":
        return np.roll(audio, int(sr * np.random.uniform(-0.5, 0.5)))
    return audio


def embedding_audio_desde_array(audio: np.ndarray, extractor, modelo) -> np.ndarray:
    if len(audio) > CAP_S * SR:
        audio = audio[: CAP_S * SR]
    inputs = extractor(audio, sampling_rate=SR, return_tensors="pt")
    with torch.no_grad():
        salida = modelo(inputs.input_values.to(_dispositivo()))
    return salida.last_hidden_state.mean(dim=1).squeeze(0).cpu().numpy()


def back_translate(texto: str, tok_es_en, mod_es_en, tok_en_es, mod_en_es) -> str:
    device = _dispositivo()
    inputs = tok_es_en(texto, return_tensors="pt", truncation=True, max_length=512).to(device)
    with torch.no_grad():
        en = tok_es_en.decode(mod_es_en.generate(**inputs, max_length=512, num_beams=2)[0], skip_special_tokens=True)
    inputs2 = tok_en_es(en, return_tensors="pt", truncation=True, max_length=512).to(device)
    with torch.no_grad():
        return tok_en_es.decode(mod_en_es.generate(**inputs2, max_length=512, num_beams=2)[0], skip_special_tokens=True)


def preparar_datos(data_root: Path):
    """Construye la particion y los embeddings (originales + aumentados)
    UNA sola vez — se comparten entre las N corridas de entrenamiento.
    La variabilidad que se mide entre corridas es la del entrenamiento
    del MLP (inicializacion de pesos + orden de batches), no la de la
    augmentation, por costo de computo (ver docstring del modulo)."""
    print("== Particion ==")
    X_train, X_val, X_test, y_train, y_val, y_test = construir_particion(data_root)
    transcripciones = cargar_transcripciones(data_root)

    print("\n== Cargando Wav2Vec2 y BETO (mismas funciones que produccion) ==")
    from app.pipeline.multimodal_classifier import _cargar_wav2vec2, _cargar_beto
    extractor_w2v2, modelo_w2v2 = _cargar_wav2vec2()
    tokenizer_beto, modelo_beto = _cargar_beto()

    def texto_de(ruta_wav: str) -> str:
        return transcripciones[Path(ruta_wav).name]

    print("\n== Embeddings originales (train + val + test) ==")
    emb_audio, emb_texto = {}, {}
    for ruta in X_train + X_val + X_test:
        archivo = _archivo_de(ruta)
        emb_audio[archivo] = extraer_embedding_audio(ruta)
        emb_texto[archivo] = extraer_embedding_texto(texto_de(ruta))
    print(f"  {len(emb_audio)} embeddings de audio, {len(emb_texto)} de texto")

    random.seed(DATA_SEED)
    np.random.seed(DATA_SEED)

    print("\n== Data augmentation sobre TRAIN (nunca val/test) ==")
    emb_audio_aug: dict[str, np.ndarray] = {}
    tipos = ["ruido", "pitch", "stretch", "shift"]
    for ruta in X_train:
        archivo = _archivo_de(ruta)
        audio, _ = librosa.load(ruta, sr=SR, mono=True)
        for j in range(N_AUG_AUDIO):
            tipo = random.choice(tipos)
            audio_aug = augmentar_audio(audio, SR, tipo)
            emb_audio_aug[f"{archivo}.aug{j}"] = embedding_audio_desde_array(audio_aug, extractor_w2v2, modelo_w2v2)
    print(f"  {len(emb_audio_aug)} embeddings de audio aumentado")

    print("  Back-translation es->en->es (puede tardar varios minutos)...")
    from transformers import MarianMTModel, MarianTokenizer
    device = _dispositivo()
    tok_es_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-es-en")
    mod_es_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-es-en").to(device).eval()
    tok_en_es = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-es")
    mod_en_es = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-es").to(device).eval()

    emb_texto_aug: dict[str, np.ndarray] = {}
    for ruta in X_train:
        archivo = _archivo_de(ruta)
        try:
            texto_parafraseado = back_translate(texto_de(ruta), tok_es_en, mod_es_en, tok_en_es, mod_en_es)
            emb_texto_aug[archivo] = extraer_embedding_texto(texto_parafraseado)
        except Exception as e:
            print(f"  aviso: back-translation fallo para {archivo}, se omite ({e})")
    print(f"  {len(emb_texto_aug)} embeddings de texto aumentado")
    del mod_es_en, mod_en_es
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    print("\n== Construyendo train aumentado ==")
    Xa_list, Xt_list, y_list = [], [], []
    for ruta, clase in zip(X_train, y_train):
        archivo = _archivo_de(ruta)
        xa_orig, xt_orig = emb_audio[archivo], emb_texto[archivo]
        Xa_list.append(xa_orig); Xt_list.append(xt_orig); y_list.append(clase)
        for j in range(N_AUG_AUDIO):
            key = f"{archivo}.aug{j}"
            if key in emb_audio_aug:
                Xa_list.append(emb_audio_aug[key]); Xt_list.append(xt_orig); y_list.append(clase)
        if archivo in emb_texto_aug:
            Xa_list.append(xa_orig); Xt_list.append(emb_texto_aug[archivo]); y_list.append(clase)

    X_train_fused = np.concatenate([np.stack(Xa_list), np.stack(Xt_list)], axis=1)
    y_train_aug = np.array(y_list)
    print(f"  Train aumentado: {len(y_train_aug)} ejemplos (de {len(X_train)} originales)")
    print(pd.Series(y_train_aug).value_counts())

    X_val_fused = np.concatenate([
        np.stack([emb_audio[_archivo_de(r)] for r in X_val]),
        np.stack([emb_texto[_archivo_de(r)] for r in X_val]),
    ], axis=1)
    X_test_fused = np.concatenate([
        np.stack([emb_audio[_archivo_de(r)] for r in X_test]),
        np.stack([emb_texto[_archivo_de(r)] for r in X_test]),
    ], axis=1)

    return X_train_fused, y_train_aug, X_val_fused, np.array(y_val), X_test_fused, np.array(y_test)


def _f1_macro_de(modelo, X, y_idx, device) -> float:
    modelo.eval()
    with torch.no_grad():
        pred = modelo(torch.tensor(X, dtype=torch.float32).to(device)).argmax(1).cpu().numpy()
    return f1_score(y_idx, pred, average="macro", labels=list(range(len(CLASES))))


def entrenar_una_corrida(seed: int, X_train, y_train_idx, X_val, y_val_idx, pesos_clase,
                          max_epochs=150, patience=20, lr=1e-3, weight_decay=1e-3, batch_size=32):
    """Entrena UNA corrida del MLP con la semilla dada. Selecciona el
    'mejor' epoch y decide el early stopping por F1 MACRO DE VALIDACION
    (no por loss ni por accuracy) — mejora pedida explicitamente."""
    torch.manual_seed(seed)
    device = _dispositivo()

    train_ds = torch.utils.data.TensorDataset(
        torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train_idx, dtype=torch.long))
    train_loader = torch.utils.data.DataLoader(train_ds, batch_size=batch_size, shuffle=True)

    modelo = MultimodalMLP().to(device)
    optimizer = torch.optim.Adam(modelo.parameters(), lr=lr, weight_decay=weight_decay)
    criterio = nn.CrossEntropyLoss(weight=pesos_clase)

    mejor_val_f1, mejor_estado, sin_mejora = -1.0, None, 0
    for epoch in range(max_epochs):
        modelo.train()
        for xb, yb in train_loader:
            xb, yb = xb.to(device), yb.to(device)
            optimizer.zero_grad()
            loss = criterio(modelo(xb), yb)
            loss.backward()
            optimizer.step()

        val_f1 = _f1_macro_de(modelo, X_val, y_val_idx, device)
        if val_f1 > mejor_val_f1 + 1e-4:
            mejor_val_f1 = val_f1
            mejor_estado = copy.deepcopy(modelo.state_dict())
            sin_mejora = 0
        else:
            sin_mejora += 1
        if sin_mejora >= patience:
            break

    modelo.load_state_dict(mejor_estado)
    return modelo, mejor_val_f1


def main(data_root: Path, n_runs: int):
    X_train, y_train_aug, X_val, y_val, X_test, y_test = preparar_datos(data_root)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_val_s = scaler.transform(X_val)
    X_test_s = scaler.transform(X_test)

    idx_clase = {c: i for i, c in enumerate(CLASES)}
    y_train_idx = np.array([idx_clase[c] for c in y_train_aug])
    y_val_idx = np.array([idx_clase[c] for c in y_val])
    y_test_idx = np.array([idx_clase[c] for c in y_test])

    conteo = Counter(y_train_idx.tolist())
    total = len(y_train_idx)
    pesos_lista = [total / conteo[i] for i in range(len(CLASES))]
    pesos_lista[idx_clase["MCI"]] *= MCI_PESO_EXTRA
    pesos_clase = torch.tensor(pesos_lista, dtype=torch.float32).to(_dispositivo())
    print(f"\npesos_clase (MCI con x{MCI_PESO_EXTRA} extra): {pesos_clase.tolist()}")

    print(f"\n== Entrenando {n_runs} corridas independientes (semillas 0..{n_runs - 1}) ==")
    resultados = []
    modelos = []
    for seed in range(n_runs):
        modelo, val_f1 = entrenar_una_corrida(seed, X_train_s, y_train_idx, X_val_s, y_val_idx, pesos_clase)

        modelo.eval()
        with torch.no_grad():
            y_pred_idx = modelo(torch.tensor(X_test_s, dtype=torch.float32).to(_dispositivo())).argmax(1).cpu().numpy()
        y_pred = [CLASES[i] for i in y_pred_idx]
        f1s = f1_score(y_test, y_pred, average=None, labels=list(CLASES))
        fila = {
            "seed": seed,
            "val_f1_macro": val_f1,
            "test_accuracy": accuracy_score(y_test, y_pred),
            "test_f1_macro": f1_score(y_test, y_pred, average="macro", labels=list(CLASES)),
            "test_f1_ad": f1s[0], "test_f1_hc": f1s[1], "test_f1_mci": f1s[2],
        }
        resultados.append(fila)
        modelos.append(modelo)
        print(f"  seed={seed} | val_f1_macro={val_f1:.3f} | test_f1_macro={fila['test_f1_macro']:.3f} "
              f"| test_f1_mci={fila['test_f1_mci']:.3f}")

    df = pd.DataFrame(resultados)
    print("\n== Resumen de las", n_runs, "corridas ==")
    print(df.to_string(index=False))

    print(f"\nF1 macro (test) — media: {df['test_f1_macro'].mean():.3f} ± {df['test_f1_macro'].std():.3f}")
    print(f"F1 MCI  (test) — media: {df['test_f1_mci'].mean():.3f} ± {df['test_f1_mci'].std():.3f}")
    print(f"Corridas con F1 MCI == 0 (colapso total en MCI): {(df['test_f1_mci'] == 0).sum()} de {n_runs}")

    idx_mejor = df["val_f1_macro"].idxmax()
    print(f"\nMejor corrida por VALIDACION: seed={df.loc[idx_mejor, 'seed']} "
          f"(val_f1_macro={df.loc[idx_mejor, 'val_f1_macro']:.3f}) -> "
          f"test_f1_macro={df.loc[idx_mejor, 'test_f1_macro']:.3f}, "
          f"test_f1_mci={df.loc[idx_mejor, 'test_f1_mci']:.3f}")
    print(classification_report(
        y_test,
        [CLASES[i] for i in modelos[idx_mejor](torch.tensor(X_test_s, dtype=torch.float32).to(_dispositivo())).argmax(1).cpu().numpy()],
        labels=list(CLASES), zero_division=0,
    ))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(modelos[idx_mejor].state_dict(), MULTIMODAL_MODEL_PATH)
    joblib.dump(scaler, MULTIMODAL_SCALER_PATH)
    df.to_csv(MODELS_DIR / "multimodal_corridas.csv", index=False)
    print(f"\nModelo (mejor por validacion) guardado en {MULTIMODAL_MODEL_PATH}")
    print(f"Scaler guardado en {MULTIMODAL_SCALER_PATH}")
    print(f"Detalle de las {n_runs} corridas guardado en {MODELS_DIR / 'multimodal_corridas.csv'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data-root", default=str(BACKEND_DIR.parent.parent),
        help="Carpeta que contiene audio_clean/ y transcripciones_whisper.json "
             "(por defecto, la raiz del proyecto)",
    )
    parser.add_argument("--n-runs", type=int, default=10)
    args = parser.parse_args()
    main(Path(args.data_root), args.n_runs)
