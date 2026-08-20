import { useEffect, useState } from "react";
import { IconAlertCircle } from "./icons.jsx";

// En un servidor sin GPU y con poca RAM, un analisis real puede tardar
// varios minutos (transcripcion + 2 embeddings + clasificacion + LLM,
// todo en CPU) — un spinner solo, sin mas contexto, se percibe como
// colgado mucho antes de que realmente termine. El contador de tiempo
// transcurrido no mide progreso real (no hay como saberlo desde el
// frontend), pero confirma visualmente que algo sigue pasando.
function useCronometro(activo) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!activo) {
      setSegundos(0);
      return;
    }
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [activo]);

  return segundos;
}

function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return min > 0 ? `${min} min ${seg}s` : `${seg}s`;
}

export default function ProcessingStatus({ estado }) {
  const segundos = useCronometro(estado === "procesando");

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
      <div className="status-panel status-panel--processing" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>
          Procesando audio — transcribiendo y clasificando con el modelo
          multimodal. En este servidor puede tardar varios minutos; no
          hace falta que hagas nada, pero no cierres esta pestaña si
          quieres ver el reporte apenas esté listo.
          <br />
          <strong>Tiempo transcurrido: {formatearTiempo(segundos)}</strong>
        </span>
      </div>
    );
  }

  return null;
}
