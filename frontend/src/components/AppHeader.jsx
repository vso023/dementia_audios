import { Link } from "react-router-dom";
import { IconArrowLeft, IconBrainWave, IconWaveform } from "./icons.jsx";

export default function AppHeader() {
  return (
    <div className="app-header-wrap">
      <Link to="/" className="btn btn--ghost app-header__back">
        <IconArrowLeft width={16} height={16} />
        Volver al inicio
      </Link>

      <header className="app-header">
        <div className="app-header__icon">
          <IconBrainWave width={28} height={28} />
        </div>
        <div className="app-header__text">
          <h1>Herramienta de apoyo a detección de deterioro cognitivo</h1>
          <p>
            Selecciona o crea un paciente y carga una muestra de audio de
            lectura para apoyar el proceso de evaluación clínica.
          </p>
        </div>
        <IconWaveform className="app-header__wave" width={72} height={28} aria-hidden="true" />
      </header>
    </div>
  );
}
