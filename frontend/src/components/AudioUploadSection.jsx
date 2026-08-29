import SectionCard from "./SectionCard.jsx";
import AudioInput from "./AudioInput.jsx";
import AudioFileSummary from "./AudioFileSummary.jsx";
import SampleAudioClips from "./SampleAudioClips.jsx";
import { IconMic } from "./icons.jsx";

// Reactivado: audios de ejemplo con nombres neutros (ejemplo-1/2/3.wav)
// en frontend/public/muestras/, ya no copias del dataset real (ver
// SampleAudioClips.jsx). Para volver a apagarlo sin borrar nada, cambiar
// esta constante a false.
const MUESTRAS_HABILITADAS = true;

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
