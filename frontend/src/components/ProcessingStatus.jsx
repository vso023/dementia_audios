import { IconAlertCircle } from "./icons.jsx";

export default function ProcessingStatus({ estado }) {
  if (estado === "idle") return null;

  if (estado === "error") {
    return (
      <div className="status-panel status-panel--error" role="alert">
        <IconAlertCircle width={20} height={20} />
        <span>Ocurrió un error al procesar el audio. Intenta de nuevo.</span>
      </div>
    );
  }

  if (estado === "procesando") {
    return (
      <div className="status-panel status-panel--processing" role="status">
        <span className="spinner" aria-hidden="true" />
        <span>
          Procesando audio — transcribiendo y clasificando con el modelo
          multimodal (audio + texto)… esto puede tardar hasta un minuto.
        </span>
      </div>
    );
  }

  return null;
}
