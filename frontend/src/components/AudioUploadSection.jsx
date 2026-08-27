import SectionCard from "./SectionCard.jsx";
import AudioInput from "./AudioInput.jsx";
import AudioFileSummary from "./AudioFileSummary.jsx";
import SampleAudioClips from "./SampleAudioClips.jsx";
import { IconMic } from "./icons.jsx";

// Apagado temporal: se retiraron los audios de ejemplo de
// frontend/public/muestras/ (los que había eran copias de grabaciones
// reales del dataset, un problema de privacidad/licencia — ver
// SampleAudioClips.jsx). El componente y su lógica quedan intactos.
// Para reactivar cuando haya audios de reemplazo apropiados: poner los
// 3 archivos en frontend/public/muestras/ con esos nombres exactos
// (ejemplo-1.wav, ejemplo-2.wav, ejemplo-3.wav — ver MUESTRAS en
// SampleAudioClips.jsx) y cambiar esta constante a true.
const MUESTRAS_HABILITADAS = false;

export default function AudioUploadSection({ onAudioListo, deshabilitado, archivoSeleccionado }) {
  return (
    <SectionCard
      icon={<IconMic width={20} height={20} />}
      iconVariant="purple"
      title="Muestra de audio"
      subtitle="Carga o graba una muestra de audio del paciente para continuar con el análisis."
    >
      <AudioInput onAudioListo={onAudioListo} deshabilitado={deshabilitado} />
      {MUESTRAS_HABILITADAS && (
        <SampleAudioClips onAudioListo={onAudioListo} deshabilitado={deshabilitado} />
      )}
      <AudioFileSummary archivo={archivoSeleccionado} />
    </SectionCard>
  );
}
