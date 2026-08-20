import { useState } from "react";
import { crearProfesional } from "../api/client.js";

// Selector de profesional existente + formulario inline para crear uno
// nuevo. Si no hay ninguno todavia, el formulario se muestra directo.
export default function ProfesionalSetup({ profesionales, profesionalId, onSeleccionar, onCreado }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(profesionales.length === 0);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarCrear(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const nuevo = await crearProfesional({ nombre, email });
      onCreado(nuevo);
      setNombre("");
      setEmail("");
      setMostrarFormulario(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {profesionales.length > 0 && !mostrarFormulario && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label>
            Profesional:{" "}
            <select value={profesionalId} onChange={(e) => onSeleccionar(e.target.value)}>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setMostrarFormulario(true)}>
            + Nuevo profesional
          </button>
        </div>
      )}

      {mostrarFormulario && (
        <form onSubmit={manejarCrear} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Nombre del profesional"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={enviando}>
            {enviando ? "Creando..." : "Crear profesional"}
          </button>
          {profesionales.length > 0 && (
            <button type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          )}
        </form>
      )}

      {error && <p style={{ color: "#b00020" }}>{error}</p>}
    </div>
  );
}
