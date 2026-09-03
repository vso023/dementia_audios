import { forwardRef, useRef, useState } from "react";
import DisclaimerBanner from "./DisclaimerBanner.jsx";
import { IconAlertCircle, IconCheckCircle, IconDownload } from "./icons.jsx";

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

function formatearFecha(iso) {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "reporte_juan_perez_2026-09-03.pdf" — sin tildes ni espacios, para que
// el nombre de archivo sea predecible en cualquier sistema operativo.
function normalizarParaArchivo(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function construirNombreArchivo(paciente, analisis) {
  const nombrePaciente = paciente?.nombre ? normalizarParaArchivo(paciente.nombre) : "paciente";
  const fechaBase = analisis?.fecha ? new Date(analisis.fecha) : new Date();
  const fechaIso = Number.isNaN(fechaBase.getTime())
    ? new Date().toISOString().slice(0, 10)
    : fechaBase.toISOString().slice(0, 10);
  return `reporte_${nombrePaciente}_${fechaIso}.pdf`;
}

export default function ReportView({ analisis, paciente }) {
  const printableRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState(null);

  if (!analisis) return null;

  async function handleDescargarPdf() {
    setExportando(true);
    setErrorExportar(null);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 10,
          filename: construirNombreArchivo(paciente, analisis),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(printableRef.current)
        .save();
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

      {/* Plantilla fuera de pantalla, nunca visible para el usuario: existe solo
          para que html2pdf/html2canvas la capture. Se mantiene siempre montada
          (no display:none, que html2canvas no puede fotografiar) para que el
          click en "Descargar PDF" no dependa de un segundo render. */}
      <ReportePrintable ref={printableRef} analisis={analisis} paciente={paciente} />
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

const estiloTituloSeccion = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#20233a",
  margin: "0 0 8px",
  borderBottom: "1px solid #dfe3ed",
  paddingBottom: "4px",
};

const estiloEtiquetaCelda = {
  color: "#687086",
  paddingRight: "10px",
  verticalAlign: "top",
  whiteSpace: "nowrap",
};

const estiloCajaTexto = {
  background: "#f1f3f8",
  borderRadius: "8px",
  padding: "12px 14px",
  whiteSpace: "pre-wrap",
  fontSize: "12px",
  lineHeight: 1.5,
  color: "#20233a",
};

// Plantilla independiente del CSS de la app (estilos inline, sin clases):
// se renderiza fuera de pantalla y html2canvas la fotografía tal cual, asi
// que no puede depender de que ".tool-shell" este presente en el arbol ni
// de estados interactivos como <details> (que si estuviera cerrado no
// aparecería en la captura). Todo lo que debe verse en el PDF se muestra
// siempre expandido.
const ReportePrintable = forwardRef(function ReportePrintable({ analisis, paciente }, ref) {
  const { etiqueta } = categorizarConfianza(analisis.confianza);
  const fecha = formatearFecha(analisis.fecha) || formatearFecha(new Date().toISOString());

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: "-10000px",
        width: "780px",
        padding: "32px",
        background: "#ffffff",
        color: "#20233a",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "18px", margin: "0 0 4px" }}>
        Reporte de análisis — Herramienta de apoyo a detección de deterioro cognitivo
      </h1>
      <p style={{ margin: "0 0 18px", color: "#687086", fontSize: "12px" }}>
        Fecha del análisis: {fecha}
      </p>

      <div
        style={{
          border: "1px solid #f0d999",
          background: "#fff8e8",
          color: "#7a5200",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "20px",
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        <strong>Aviso: </strong>
        esta herramienta es un insumo de apoyo generado por modelos automáticos. No constituye
        un diagnóstico médico. Los resultados deben ser interpretados por un profesional de la
        salud calificado. La categoría de confianza es orientativa.
      </div>

      {paciente && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={estiloTituloSeccion}>Datos del paciente</h2>
          <table style={{ fontSize: "12px", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={estiloEtiquetaCelda}>Nombre:</td>
                <td>{paciente.nombre}</td>
              </tr>
              {paciente.fecha_nacimiento && (
                <tr>
                  <td style={estiloEtiquetaCelda}>Fecha de nacimiento:</td>
                  <td>{paciente.fecha_nacimiento}</td>
                </tr>
              )}
              {paciente.sexo && (
                <tr>
                  <td style={estiloEtiquetaCelda}>Sexo:</td>
                  <td>{paciente.sexo}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h2 style={estiloTituloSeccion}>Clasificación</h2>
        <p style={{ margin: "6px 0", fontSize: "13px" }}>
          Resultado: <strong>{analisis.clasificacion}</strong>
        </p>
        <p style={{ margin: "6px 0", fontSize: "13px" }}>
          Categoría de confianza: <strong>{etiqueta}</strong>
        </p>
        {analisis.probabilidades && (
          <table style={{ fontSize: "12px", marginTop: "8px", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(analisis.probabilidades).map(([clase, p]) => (
                <tr key={clase}>
                  <td style={estiloEtiquetaCelda}>{clase}:</td>
                  <td>{(p * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2 style={estiloTituloSeccion}>Reporte</h2>
        <div style={estiloCajaTexto}>{analisis.reporte?.contenido || "—"}</div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <h2 style={estiloTituloSeccion}>Transcripción del audio analizado</h2>
        <p style={{ fontSize: "11px", color: "#687086", margin: "0 0 8px" }}>
          Texto obtenido automáticamente del audio (Whisper), usado como una de las dos entradas
          del clasificador.
        </p>
        <div style={estiloCajaTexto}>{analisis.transcripcion || "—"}</div>
      </div>

      <div
        style={{
          marginTop: "20px",
          borderTop: "1px solid #dfe3ed",
          paddingTop: "12px",
          fontSize: "10px",
          color: "#687086",
        }}
      >
        Este documento fue generado automáticamente por la Herramienta de apoyo a detección de
        deterioro cognitivo. No sustituye una evaluación clínica.
      </div>
    </div>
  );
});
