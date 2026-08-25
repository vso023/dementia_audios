import { useState } from "react";
import { IconPlay } from "./icons.jsx";

// Audios de ejemplo para que cualquiera pueda probar la herramienta sin
// tener que subir un audio propio. Viven como archivos estaticos en
// frontend/public/muestras/ — el mismo servidor que sirve el resto del
// sitio los sirve a ellos tal cual, sin tocar el backend para nada (el
// backend sigue viendo exactamente lo mismo que si el archivo viniera
// del input de "Seleccionar archivo": un File, vía el mismo
// onAudioListo). Para agregar o cambiar un ejemplo: poner el archivo en
// esa carpeta y agregar/editar una entrada aca con el mismo nombre.
const MUESTRAS = [
  { id: "ejemplo-1", etiqueta: "Ejemplo 1", archivo: "/muestras/ejemplo-1.wav" },
  { id: "ejemplo-2", etiqueta: "Ejemplo 2", archivo: "/muestras/ejemplo-2.wav" },
  { id: "ejemplo-3", etiqueta: "Ejemplo 3", archivo: "/muestras/ejemplo-3.wav" },
];

export default function SampleAudioClips({ onAudioListo, deshabilitado }) {
  const [cargando, setCargando] = useState(null);

  async function usarMuestra(muestra) {
    if (deshabilitado || cargando) return;
    setCargando(muestra.id);
    try {
      const res = await fetch(muestra.archivo);
      if (!res.ok) throw new Error("No se pudo cargar el audio de ejemplo");
      const blob = await res.blob();
      const nombreArchivo = muestra.archivo.split("/").pop();
      onAudioListo(new File([blob], nombreArchivo, { type: blob.type || "audio/wav" }));
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el audio de ejemplo. Intenta de nuevo.");
    } finally {
      setCargando(null);
    }
  }

  return (
    <div className="sample-audio">
      <p className="sample-audio__label">¿No tienes un audio a mano? Prueba con un ejemplo:</p>
      <div className="sample-audio__list">
        {MUESTRAS.map((muestra) => (
          <button
            key={muestra.id}
            type="button"
            className="btn btn--secondary"
            onClick={() => usarMuestra(muestra)}
            disabled={deshabilitado || Boolean(cargando)}
          >
            {cargando === muestra.id ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <IconPlay width={16} height={16} />
            )}
            {muestra.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
