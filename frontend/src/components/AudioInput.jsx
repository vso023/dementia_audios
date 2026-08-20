import { useRef, useState } from "react";
import { IconMic, IconStopCircle, IconUpload } from "./icons.jsx";

export default function AudioInput({ onAudioListo, deshabilitado }) {
  const [grabando, setGrabando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const inputRef = useRef(null);

  // Unico punto de entrada para "se eligio un archivo", sin importar si
  // vino del <input type=file>, de arrastrar-y-soltar, o de una grabacion —
  // asi el comportamiento (llamar a onAudioListo) es identico en los tres casos.
  function manejarArchivo(archivo) {
    if (archivo) onAudioListo(archivo);
  }

  function manejarArchivoSubido(e) {
    manejarArchivo(e.target.files?.[0]);
  }

  function manejarDrop(e) {
    e.preventDefault();
    setArrastrando(false);
    if (deshabilitado || grabando) return;
    manejarArchivo(e.dataTransfer.files?.[0]);
  }

  async function iniciarGrabacion() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      manejarArchivo(new File([blob], "grabacion.webm", { type: "audio/webm" }));
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setGrabando(true);
  }

  function detenerGrabacion() {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  }

  return (
    <div
      className="dropzone"
      data-dragging={arrastrando}
      data-disabled={deshabilitado}
      onDragOver={(e) => {
        e.preventDefault();
        if (!deshabilitado && !grabando) setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={manejarDrop}
    >
      <IconUpload className="dropzone__icon" width={30} height={30} />
      <p className="dropzone__title">Arrastra un archivo de audio aquí</p>
      <p className="dropzone__hint">o elige una opción abajo — formatos de audio comunes (WAV, MP3, WebM...)</p>

      <div className="dropzone__waves" aria-hidden="true">
        {[6, 12, 18, 10, 16, 8, 14].map((h, i) => (
          <span key={i} style={{ height: h }} />
        ))}
      </div>

      <div className="dropzone__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => inputRef.current?.click()}
          disabled={deshabilitado || grabando}
        >
          <IconUpload width={16} height={16} />
          Seleccionar archivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={manejarArchivoSubido}
          disabled={deshabilitado || grabando}
          className="visually-hidden"
          aria-label="Subir archivo de audio"
        />

        {!grabando ? (
          <button type="button" className="btn btn--primary" onClick={iniciarGrabacion} disabled={deshabilitado}>
            <IconMic width={16} height={16} />
            Grabar audio
          </button>
        ) : (
          <button type="button" className="btn btn--destructive" onClick={detenerGrabacion}>
            <IconStopCircle width={16} height={16} />
            Detener grabación
          </button>
        )}
      </div>

      {grabando && (
        <p className="recording-indicator" style={{ marginTop: 12, justifyContent: "center", display: "flex" }}>
          <span className="recording-dot" aria-hidden="true" />
          Grabando…
        </p>
      )}
    </div>
  );
}
