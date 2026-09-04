import { useState } from "react";
import DisclaimerBanner from "./DisclaimerBanner.jsx";
import { IconAlertCircle, IconCheckCircle, IconDownload } from "./icons.jsx";
import { construirNombreArchivo, construirReportePdf } from "../lib/generarReportePdf.js";

// Umbrales de categoría de confianza. Se calculan sobre la probabilidad
// de la clase ganadora que el modelo YA produce — no se toca el modelo
// ni la clasificación, solo cómo se presenta.
//
// Referencia para justificar los cortes: son 3 clases (AD/HC/MCI), asi
// que el azar puro es ~0.33 y la probabilidad ganadora nunca puede ser
// menor a eso. "Baja" (<0.50) captura justo la zona en la que el modelo
// esta apenas por encima del azar — no es un corte arbitrario a la
// mitad de [0,1], es la mitad relevante de [0.33, 1.0].
const UMBRAL_ALTA = 0.8;
const UMBRAL_MEDIA = 0.5;

function categorizarConfianza(confianza) {
  if (confianza > UMBRAL_ALTA) {
    return { etiqueta: "Alta", variante: "success" };
  }
  if (confianza >= UMBRAL_MEDIA) {
    return { etiqueta: "Media", variante: "warning" };
  }
  return { etiqueta: "Baja", variante: "error" };
}

export default function ReportView({ analisis, paciente }) {
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState(null);

  if (!analisis) return null;

  async function handleDescargarPdf() {
    setExportando(true);
    setErrorExportar(null);
    try {
      // Se escribe el contenido directamente con jsPDF (doc.text /
      // splitTextToSize), sin capturar ningún elemento del DOM. Se probó
      // antes con html2pdf.js y luego con html2canvas-pro, pero capturar el
      // DOM como imagen resultó poco confiable en el entorno real de
      // despliegue (páginas en blanco). Escribir el texto a mano no
      // depende de renderizar ni fotografiar nada.
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      construirReportePdf(doc, analisis, paciente);
      doc.save(construirNombreArchivo(paciente, analisis));
    } catch (e) {
      console.error(e);
      setErrorExportar("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="report">
      <div className="status-panel status-panel--processing" style={{ background: "var(--success-soft)", color: "var(--success)", border: "1px solid #cdeadf" }}>
        <IconCheckCircle width={20} height={20} />
        <span>Análisis completado.</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleDescargarPdf}
          disabled={exportando}
        >
          <IconDownload width={16} height={16} />
          {exportando ? "Generando PDF…" : "Descargar PDF"}
        </button>
      </div>
      {errorExportar && (
        <p className="classification-card__confidence" style={{ color: "var(--error)" }}>
          {errorExportar}
        </p>
      )}

      <DisclaimerBanner />

      <ClasificacionCard
        clasificacion={analisis.clasificacion}
        confianza={analisis.confianza}
        probabilidades={analisis.probabilidades}
      />

      <section>
        <h3 className="section-card__title" style={{ marginBottom: 12 }}>Reporte</h3>
        <div className="report__body">{analisis.reporte?.contenido}</div>
      </section>

      <section>
        <h3 className="section-card__title" style={{ marginBottom: 12 }}>
          Transcripción del audio analizado
        </h3>
        <p className="report__transcript-note">
          Texto obtenido automáticamente del audio (Whisper) y usado como una de las dos entradas
          del clasificador — se muestra para dar transparencia sobre qué se transcribió y analizó.
        </p>
        <div className="report__body">{analisis.transcripcion}</div>
      </section>
    </div>
  );
}

function ClasificacionCard({ clasificacion, confianza, probabilidades }) {
  const { etiqueta, variante } = categorizarConfianza(confianza);

  return (
    <div className="classification-card">
      <h4 className="classification-card__title">Clasificación</h4>
      <p className="classification-card__value">
        Resultado: <strong>{clasificacion}</strong>
      </p>

      <div className="classification-card__confidence">
        <span>Confianza del modelo:</span>
        <span className={`badge badge--${variante}`}>{etiqueta}</span>
      </div>

      <p className="classification-card__confidence-note">
        <IconAlertCircle width={14} height={14} />
        La categoría de confianza es orientativa. El resultado es un insumo de apoyo, no un
        diagnóstico — la decisión clínica corresponde siempre a un profesional de la salud.
      </p>

      {probabilidades && (
        <details className="classification-card__detail">
          <summary>Ver distribución de probabilidades por clase (detalle técnico)</summary>
          <ul className="classification-card__probs">
            {Object.entries(probabilidades).map(([clase, p]) => (
              <li key={clase}>
                {clase}: {(p * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
