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

// Un WAV real empieza con la firma RIFF....WAVE en sus primeros 12
// bytes. Se verifica explicitamente porque `vite preview` es un
// servidor de SPA: una peticion a una ruta que NO corresponde a un
// archivo real puede responder con el index.html de la app en vez de
// un 404 — con HTTP 200 igual, asi que `res.ok` no lo detecta. Ese
// HTML terminaba subiendose al backend como si fuera el audio, y
// ffmpeg fallaba con "Invalid data found when processing input" sin
// ningun aviso claro en el frontend. Revisar la firma real del archivo
// (no solo el status HTTP ni el Content-Type que declare el servidor)
// es la unica forma de detectar esto con certeza antes de enviarlo.
async function leerFirmaRiffWave(blob) {
  if (blob.size < 44) return null; // header WAV minimo son 44 bytes
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const texto = String.fromCharCode(...bytes);
  return { esRiffWave: texto.startsWith("RIFF") && texto.slice(8, 12) === "WAVE" };
}

export default function SampleAudioClips({ onAudioListo, deshabilitado }) {
  const [cargando, setCargando] = useState(null);

  async function usarMuestra(muestra) {
    if (deshabilitado || cargando) return;
    setCargando(muestra.id);
    try {
      // cache: "no-store" evita que el navegador reutilice una respuesta
      // vieja (por ejemplo, de una version del deploy anterior a que el
      // archivo real existiera en el servidor).
      const res = await fetch(muestra.archivo, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`No se pudo descargar el audio de ejemplo (HTTP ${res.status}).`);
      }

      const blob = await res.blob();
      const firma = await leerFirmaRiffWave(blob);
      if (!firma?.esRiffWave) {
        throw new Error(
          `El archivo recibido para "${muestra.etiqueta}" no es un WAV válido. ` +
            `Verifica que exista en frontend/public/muestras/${muestra.archivo.split("/").pop()} ` +
            "y que el frontend se haya reconstruido después de agregarlo."
        );
      }

      // Mismo mecanismo que un archivo elegido a mano: un File real que
      // entra al mismo onAudioListo -> mismo FormData -> mismo POST
      // /api/analisis que ya usa AudioInput.jsx. El tipo se fija a
      // "audio/wav" de forma explicita (no se depende de lo que el
      // servidor haya declarado en Content-Type).
      const nombreArchivo = muestra.archivo.split("/").pop();
      onAudioListo(new File([blob], nombreArchivo, { type: "audio/wav" }));
    } catch (e) {
      console.error(e);
      alert(e.message || "No se pudo cargar el audio de ejemplo. Intenta de nuevo.");
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
