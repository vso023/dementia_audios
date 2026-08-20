import SectionCard from "./SectionCard.jsx";
import FormField from "./FormField.jsx";
import PatientSummary from "./PatientSummary.jsx";
import CrearPacienteForm from "./CrearPacienteForm.jsx";
import { IconUser } from "./icons.jsx";

// Compone el selector de paciente existente + el formulario de creacion
// existente (CrearPacienteForm, logica intacta) dentro de una tarjeta.
// profesionalId se recibe y se reenvia sin cambios: sigue siendo necesario
// para el payload de creacion de paciente aunque la seccion de profesional
// ya no se muestre en la interfaz.
//
// onContinuar es opcional: ToolPage solo lo pasa cuando ya hay un paciente
// seleccionado y el usuario volvio a este paso (p.ej. desde "Cambiar
// paciente"), para poder seguir con el mismo paciente sin tener que
// volver a elegirlo en el <select> (que no dispara onChange si el valor
// no cambia).
export default function PatientSection({
  pacientes,
  pacienteId,
  onSeleccionar,
  profesionalId,
  onPacienteCreado,
  onContinuar,
}) {
  const pacienteSeleccionado = pacientes.find((p) => String(p.id) === String(pacienteId));

  return (
    <SectionCard
      icon={<IconUser width={20} height={20} />}
      title="Información del paciente"
      subtitle="Selecciona un paciente existente o crea uno nuevo para continuar."
    >
      <div className="stack">
        {pacientes.length > 0 && (
          <FormField
            as="select"
            label="Paciente existente"
            value={pacienteId}
            onChange={(e) => onSeleccionar(e.target.value)}
          >
            <option value="">-- selecciona un paciente --</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormField>
        )}

        <CrearPacienteForm profesionalId={profesionalId} onCreado={onPacienteCreado} />

        <PatientSummary paciente={pacienteSeleccionado} />

        {onContinuar && pacienteSeleccionado && (
          <button type="button" className="btn btn--primary btn--block" onClick={onContinuar}>
            Continuar con {pacienteSeleccionado.nombre}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
