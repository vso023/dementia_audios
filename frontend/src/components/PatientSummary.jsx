import { IconCheckCircle } from "./icons.jsx";

function iniciales(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Calculo puramente visual (no altera ningun estado ni request) para
// mostrar edad aproximada solo cuando fecha_nacimiento ya viene del backend.
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad;
}

export default function PatientSummary({ paciente }) {
  if (!paciente) return null;
  const edad = calcularEdad(paciente.fecha_nacimiento);

  return (
    <div className="patient-summary">
      <div className="patient-summary__avatar" aria-hidden="true">
        {iniciales(paciente.nombre) || "?"}
      </div>
      <div>
        <div className="patient-summary__name">{paciente.nombre}</div>
        <div className="patient-summary__meta">
          <span>
            <IconCheckCircle width={12} height={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Paciente seleccionado
          </span>
          {paciente.fecha_nacimiento && (
            <span>Nacimiento: {paciente.fecha_nacimiento}</span>
          )}
          {edad !== null && <span>{edad} años</span>}
          {paciente.sexo && <span>Sexo: {paciente.sexo}</span>}
        </div>
      </div>
    </div>
  );
}
