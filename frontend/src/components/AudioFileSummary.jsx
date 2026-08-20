import { useEffect, useState } from "react";
import { IconFileAudio } from "./icons.jsx";

function formatearTamano(bytes) {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Muestra datos reales del File ya elegido (nombre/tipo/tamaño) y un
// reproductor nativo de previsualizacion. No participa del envio al
// backend — analizarAudio() sigue recibiendo el mismo objeto File
// exactamente como antes.
export default function AudioFileSummary({ archivo }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!archivo) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  if (!archivo) return null;

  const tamano = formatearTamano(archivo.size);

  return (
    <div className="file-summary" style={{ marginTop: 16, flexWrap: "wrap" }}>
      <div className="file-summary__icon">
        <IconFileAudio width={20} height={20} />
      </div>
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div className="file-summary__name">{archivo.name}</div>
        <div className="file-summary__meta">
          {archivo.type || "audio"}
          {tamano && ` · ${tamano}`}
        </div>
        {previewUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio className="audio-preview" controls src={previewUrl} />
        )}
      </div>
    </div>
  );
}
