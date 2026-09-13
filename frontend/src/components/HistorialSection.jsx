import { useEffect, useState } from "react";
import SectionCard from "./SectionCard.jsx";
import { IconCalendar, IconTrash } from "./icons.jsx";
import { eliminarAnalisis, historialPaciente } from "../api/client.js";

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
  // id del analisis que se esta eliminando en este momento (null si ninguno)
  // — deshabilita solo el boton de esa fila mientras el DELETE esta en vuelo.
  const [eliminandoId, setEliminandoId] = useState(null);

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

  async function handleEliminar(item) {
    const confirmado = window.confirm(
      `¿Eliminar el análisis del ${formatearFecha(item.fecha)} (${item.clasificacion})? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setEliminandoId(item.id);
    try {
      await eliminarAnalisis(item.id);
      setHistorial((prev) => prev.filter((a) => a.id !== item.id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar el análisis. Intenta de nuevo.");
    } finally {
      setEliminandoId(null);
    }
  }

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
              <button
                type="button"
                className="historial-list__eliminar"
                onClick={() => handleEliminar(item)}
                disabled={eliminandoId === item.id}
                aria-label={`Eliminar análisis del ${formatearFecha(item.fecha)}`}
                title="Eliminar análisis"
              >
                <IconTrash width={16} height={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
