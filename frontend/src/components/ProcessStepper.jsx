import { IconCheckCircle } from "./icons.jsx";

// Puramente presentacional: el paso activo lo decide ToolPage (estado
// `paso`, unica fuente de verdad del flujo guiado) y se recibe tal cual
// via `pasoActual`. Este componente solo traduce ese numero a los tres
// estados visuales de cada paso.
export default function ProcessStepper({ pasoActual }) {
  return (
    <nav className="stepper" aria-label="Progreso del análisis">
      <Paso numero={1} etiqueta="Paciente" estado={estadoDe(1, pasoActual)} />
      <div className="stepper__connector" data-complete={pasoActual > 1} />
      <Paso numero={2} etiqueta="Audio" estado={estadoDe(2, pasoActual)} />
      <div className="stepper__connector" data-complete={pasoActual > 2} />
      <Paso numero={3} etiqueta="Reporte" estado={estadoDe(3, pasoActual)} />
    </nav>
  );
}

function estadoDe(numero, pasoActual) {
  if (numero < pasoActual) return "complete";
  if (numero === pasoActual) return "active";
  return "pending";
}

function Paso({ numero, etiqueta, estado }) {
  return (
    <div className="stepper__step" data-state={estado}>
      <span className="stepper__badge">
        {estado === "complete" ? <IconCheckCircle width={16} height={16} /> : numero}
      </span>
      <span className="stepper__label">{etiqueta}</span>
    </div>
  );
}
