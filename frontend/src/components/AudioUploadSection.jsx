import SectionCard from "./SectionCard.jsx";
import AudioInput from "./AudioInput.jsx";
import AudioFileSummary from "./AudioFileSummary.jsx";
import SampleAudioClips from "./SampleAudioClips.jsx";
import { IconMic } from "./icons.jsx";

export default function AudioUploadSection({ onAudioListo, deshabilitado, archivoSeleccionado }) {
  return (
    <SectionCard
      icon={<IconMic width={20} height={20} />}
      iconVariant="purple"
      title="Muestra de audio"
      subtitle="Carga o graba una muestra de audio del paciente para continuar con el análisis."
    >
      <AudioInput onAudioListo={onAudioListo} deshabilitado={deshabilitado} />
      <SampleAudioClips onAudioListo={onAudioListo} deshabilitado={deshabilitado} />
      <AudioFileSummary archivo={archivoSeleccionado} />
    </SectionCard>
  );
}
