import { IconBrainWave, IconWaveform } from "./icons.jsx";

export default function AppHeader() {
  return (
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
  );
}
