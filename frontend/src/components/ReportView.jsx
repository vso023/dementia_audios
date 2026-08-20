import DisclaimerBanner from "./DisclaimerBanner.jsx";
import { IconCheckCircle } from "./icons.jsx";

export default function ReportView({ analisis }) {
  if (!analisis) return null;

  return (
    <div className="report">
      <div className="status-panel status-panel--processing" style={{ background: "var(--success-soft)", color: "var(--success)", border: "1px solid #cdeadf" }}>
        <IconCheckCircle width={20} height={20} />
        <span>Análisis completado.</span>
      </div>

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

      <details className="report__transcript">
        <summary>Ver transcripción completa</summary>
        <p>{analisis.transcripcion}</p>
      </details>
    </div>
  );
}

function ClasificacionCard({ clasificacion, confianza, probabilidades }) {
  return (
    <div className="classification-card">
      <h4 className="classification-card__title">Clasificación</h4>
      <p className="classification-card__value">
        Resultado: <strong>{clasificacion}</strong>
      </p>
      <p className="classification-card__confidence">
        Confianza del modelo: {(confianza * 100).toFixed(0)}%
      </p>
      {probabilidades && (
        <ul className="classification-card__probs">
          {Object.entries(probabilidades).map(([clase, p]) => (
            <li key={clase}>
              {clase}: {(p * 100).toFixed(0)}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
