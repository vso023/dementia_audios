import { IconShield } from "./icons.jsx";

// Texto fijo, NO generado por el LLM. Se muestra siempre, independientemente
// de lo que diga el reporte, como defensa adicional al disclaimer que el
// LLM ya recibe instrucciones de incluir.
export default function DisclaimerBanner() {
  return (
    <div className="disclaimer" role="note">
      <IconShield className="disclaimer__icon" width={20} height={20} />
      <p>
        <strong>Aviso: </strong>
        esta herramienta es un insumo de apoyo generado por modelos
        automáticos. No constituye un diagnóstico médico. Los resultados
        deben ser interpretados por un profesional de la salud calificado.
      </p>
    </div>
  );
}
