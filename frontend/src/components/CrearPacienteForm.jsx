import { useState } from "react";
import { crearPaciente } from "../api/client.js";
import FormField from "./FormField.jsx";
import { IconAlertCircle, IconCalendar, IconPlus, IconUsers } from "./icons.jsx";

export default function CrearPacienteForm({ profesionalId, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  async function manejarCrear(e) {
    e.preventDefault();
    if (!profesionalId) {
      // Mensaje generico a proposito: la palabra "profesional" no debe
      // aparecer en la interfaz. La condicion que lo dispara es la misma
      // de siempre — solo cambia el texto mostrado.
      setError("No se pudo completar la configuración inicial. Contacta al administrador.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const nuevo = await crearPaciente({ profesionalId, nombre, fechaNacimiento, sexo });
      onCreado(nuevo);
      setNombre("");
      setFechaNacimiento("");
      setSexo("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarCrear} className="stack" noValidate>
      <div className="form-grid form-grid--two">
        <FormField
          label="Nombre del paciente"
          placeholder="Ej. María González"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <FormField
          label="Fecha de nacimiento"
          type="date"
          icon={<IconCalendar width={16} height={16} />}
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />
      </div>

      <FormField
        as="select"
        label="Sexo (opcional)"
        icon={<IconUsers width={16} height={16} />}
        value={sexo}
        onChange={(e) => setSexo(e.target.value)}
      >
        <option value="">Prefiero no especificar</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="Otro">Otro</option>
      </FormField>

      <div>
        <button type="submit" className="btn btn--secondary" disabled={enviando || !profesionalId}>
          {enviando ? (
            <>
              <span className="spinner spinner--dark" /> Creando paciente...
            </>
          ) : (
            <>
              <IconPlus width={16} height={16} /> Crear paciente
            </>
          )}
        </button>
        {error && (
          <p className="form-field__error" role="alert" style={{ marginTop: 8 }}>
            <IconAlertCircle width={14} height={14} />
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
