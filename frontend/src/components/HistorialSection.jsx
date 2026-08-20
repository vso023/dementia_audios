import { useEffect, useState } from "react";
import SectionCard from "./SectionCard.jsx";
import { IconCalendar } from "./icons.jsx";
import { historialPaciente } from "../api/client.js";

const VARIANTE_POR_CLASE = { HC: "success", AD: "warning", MCI: "info" };

function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Lista simple de analisis previos de un paciente (fecha, clasificacion,
// confianza), consumiendo GET /api/pacientes/{id}/historial. Se recarga
// cuando cambia el paciente seleccionado o cuando `refreshKey` cambia
// (ToolPage lo incrementa tras cada analisis nuevo).
export default function HistorialSection({ pacienteId, refreshKey }) {
  const [historial, setHistorial] = useState([]);
  const [estado, setEstado] = useState("idle"); // idle | cargando | listo | error

  useEffect(() => {
    if (!pacienteId) {
      setHistorial([]);
      setEstado("idle");
      return;
    }
    let cancelado = false;
    setEstado("cargando");
    historialPaciente(pacienteId)
      .then((lista) => {
        if (cancelado) return;
        setHistorial(lista);
        setEstado("listo");
      })
      .catch(() => {
        if (cancelado) return;
        setEstado("error");
      });
    return () => {
      cancelado = true;
    };
  }, [pacienteId, refreshKey]);

  if (!pacienteId) return null;

  return (
    <SectionCard
      icon={<IconCalendar width={20} height={20} />}
      title="Historial de análisis"
      subtitle="Análisis previos guardados para este paciente."
    >
      {estado === "cargando" && <p className="section-card__subtitle">Cargando historial…</p>}
      {estado === "error" && (
        <p className="classification-card__confidence">No se pudo cargar el historial.</p>
      )}
      {estado === "listo" && historial.length === 0 && (
        <p className="section-card__subtitle">Este paciente todavía no tiene análisis registrados.</p>
      )}
      {estado === "listo" && historial.length > 0 && (
        <ul className="historial-list">
          {historial.map((item) => (
            <li key={item.id} className="historial-list__item">
              <span className="historial-list__fecha">{formatearFecha(item.fecha)}</span>
              <span className={`badge badge--${VARIANTE_POR_CLASE[item.clasificacion] || "neutral"}`}>
                {item.clasificacion}
              </span>
              <span className="historial-list__confianza">
                Confianza: {(item.confianza * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
