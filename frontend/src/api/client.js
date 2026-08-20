// Cliente HTTP minimo hacia el backend. El frontend no habla con el LLM
// ni con ningun modelo directamente — todo pasa por esta API.

export async function analizarAudio(pacienteId, archivoAudio) {
  const form = new FormData();
  form.append("paciente_id", pacienteId);
  form.append("audio", archivoAudio);

  const res = await fetch("/api/analisis", { method: "POST", body: form });
  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Error al analizar el audio (${res.status}): ${detalle}`);
  }
  return res.json();
}

export async function listarPacientes() {
  const res = await fetch("/api/pacientes");
  if (!res.ok) throw new Error("No se pudo cargar la lista de pacientes");
  return res.json();
}

export async function crearPaciente({ profesionalId, nombre, fechaNacimiento, sexo }) {
  const res = await fetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profesional_id: Number(profesionalId),
      nombre,
      fecha_nacimiento: fechaNacimiento || null,
      sexo: sexo || null,
    }),
  });
  if (!res.ok) throw new Error(`No se pudo crear el paciente (${res.status})`);
  return res.json();
}

export async function listarProfesionales() {
  const res = await fetch("/api/profesionales");
  if (!res.ok) throw new Error("No se pudo cargar la lista de profesionales");
  return res.json();
}

export async function crearProfesional({ nombre, email }) {
  const res = await fetch("/api/profesionales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email }),
  });
  if (!res.ok) throw new Error(`No se pudo crear el profesional (${res.status})`);
  return res.json();
}

export async function historialPaciente(pacienteId) {
  const res = await fetch(`/api/pacientes/${pacienteId}/historial`);
  if (!res.ok) throw new Error("No se pudo cargar el historial");
  return res.json();
}
