import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader.jsx";
import DisclaimerBanner from "../components/DisclaimerBanner.jsx";
import ProcessStepper from "../components/ProcessStepper.jsx";
import PatientSection from "../components/PatientSection.jsx";
import AudioUploadSection from "../components/AudioUploadSection.jsx";
import ProcessingStatus from "../components/ProcessingStatus.jsx";
import ReportView from "../components/ReportView.jsx";
import HistorialSection from "../components/HistorialSection.jsx";
import { IconArrowLeft } from "../components/icons.jsx";
// ProfesionalSetup ya no se renderiza (la seccion "Profesional" no debe
// verse en la interfaz), pero el componente y su logica siguen existiendo
// intactos en components/ProfesionalSetup.jsx — no se elimino nada.
import { analizarAudio, listarPacientes, listarProfesionales } from "../api/client.js";

export default function ToolPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalId, setProfesionalId] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | procesando | listo | error
  const [analisis, setAnalisis] = useState(null);
  // Solo para mostrar nombre/tipo/tamaño del archivo mientras se procesa —
  // no participa del request, que sigue enviando el mismo objeto File.
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  // Se incrementa tras cada analisis guardado para forzar a HistorialSection
  // a recargar la lista (no toca el resto del estado ni el flujo de analisis).
  const [historialVersion, setHistorialVersion] = useState(0);
  // Paso activo del flujo guiado: 1 = paciente, 2 = audio, 3 = reporte.
  // Unica fuente de verdad de que se muestra en pantalla; el avance es
  // automatico al completar cada paso, con botones para volver atras.
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    recargarProfesionales();
    recargarPacientes();
  }, []);

  function recargarProfesionales() {
    listarProfesionales().then((lista) => {
      setProfesionales(lista);
      if (lista.length > 0 && !profesionalId) setProfesionalId(String(lista[0].id));
    }).catch(() => setProfesionales([]));
  }

  function recargarPacientes() {
    listarPacientes().then(setPacientes).catch(() => setPacientes([]));
  }

  // Sigue existiendo por si en el futuro se vuelve a mostrar la seccion de
  // profesional; hoy no se invoca desde ningun elemento visible.
  function manejarProfesionalCreado(nuevo) {
    setProfesionales((prev) => [...prev, nuevo]);
    setProfesionalId(String(nuevo.id));
  }

  function manejarPacienteSeleccionado(id) {
    setPacienteId(id);
    if (id) setPaso(2);
  }

  function manejarPacienteCreado(nuevo) {
    setPacientes((prev) => [...prev, nuevo]);
    setPacienteId(String(nuevo.id));
    setPaso(2);
  }

  async function manejarAudioListo(archivo) {
    if (!pacienteId) {
      alert("Selecciona o crea un paciente antes de subir o grabar el audio.");
      return;
    }
    setArchivoSeleccionado(archivo);
    setEstado("procesando");
    setAnalisis(null);
    try {
      const resultado = await analizarAudio(pacienteId, archivo);
      setAnalisis(resultado);
      setEstado("listo");
      setHistorialVersion((v) => v + 1);
      setPaso(3);
    } catch (e) {
      console.error(e);
      setEstado("error");
    }
  }

  // Volver a un paso anterior descarta el resultado del audio en curso
  // (no el paciente): al llegar de nuevo al paso 3 debe ser por un
  // analisis nuevo, nunca por uno que quedo de una vuelta atras.
  function volverAPaso(destino) {
    setEstado("idle");
    setAnalisis(null);
    setArchivoSeleccionado(null);
    setPaso(destino);
  }

  return (
    <div className="app-shell tool-shell">
      <div className="app-container">
        <AppHeader />
        <DisclaimerBanner />

        <ProcessStepper pasoActual={paso} />

        {paso === 1 && (
          <PatientSection
            pacientes={pacientes}
            pacienteId={pacienteId}
            onSeleccionar={manejarPacienteSeleccionado}
            profesionalId={profesionalId}
            onPacienteCreado={manejarPacienteCreado}
            onContinuar={pacienteId ? () => setPaso(2) : undefined}
          />
        )}

        {paso === 2 && (
          <div className="stack">
            <button type="button" className="btn btn--ghost" onClick={() => volverAPaso(1)}>
              <IconArrowLeft width={16} height={16} />
              Cambiar paciente
            </button>

            <AudioUploadSection
              onAudioListo={manejarAudioListo}
              deshabilitado={estado === "procesando"}
              archivoSeleccionado={archivoSeleccionado}
            />

            <ProcessingStatus estado={estado} />
          </div>
        )}

        {paso === 3 && (
          <div className="stack">
            <button type="button" className="btn btn--ghost" onClick={() => volverAPaso(2)}>
              <IconArrowLeft width={16} height={16} />
              Analizar otro audio
            </button>

            <ReportView
              analisis={analisis}
              paciente={pacientes.find((p) => String(p.id) === String(pacienteId))}
            />
          </div>
        )}

        <HistorialSection pacienteId={pacienteId} refreshKey={historialVersion} />
      </div>
    </div>
  );
}
