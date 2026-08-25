import { Icon } from './ui/Icon.jsx'
import { Reveal } from './ui/Reveal.jsx'
import './ProcessSummary.css'

const STAGES = [
  {
    title: 'Grabación de voz',
    description: 'La muestra de voz funciona como entrada del proceso.',
    icon: 'mic',
    track: 'Entrada',
  },
  {
    title: 'Preprocesamiento de la señal',
    description: 'La señal se acondiciona para facilitar su análisis posterior.',
    icon: 'sliders',
    track: 'Procesamiento',
  },
  {
    title: 'Transcripción automática',
    description: 'El contenido hablado se convierte automáticamente en texto.',
    icon: 'transcript',
    track: 'Procesamiento',
  },
  {
    title: 'Características acústicas y temporales',
    description: 'Se examinan aspectos de la señal como ritmo, pausas y entonación.',
    icon: 'pulse',
    track: 'Análisis',
  },
  {
    title: 'Análisis del contenido lingüístico',
    description: 'Se estudian elementos relacionados con fluidez y organización del discurso.',
    icon: 'language',
    track: 'Análisis',
  },
  {
    title: 'Integración de características',
    description: 'Las dos vías se reúnen en una representación conjunta de la muestra.',
    icon: 'layers',
    track: 'Análisis',
  },
  {
    title: 'Modelo de aprendizaje profundo',
    description: 'Las características obtenidas alimentan un modelo de aprendizaje profundo.',
    icon: 'network',
    track: 'Modelo',
  },
  {
    title: 'Clasificación',
    description:
      'El modelo produce una clasificación de apoyo sobre el estado cognitivo evaluado.',
    icon: 'tag',
    track: 'Modelo',
  },
  {
    title: 'Reporte interpretable',
    description: 'Los resultados se organizan en una salida interpretable de apoyo.',
    icon: 'report',
    track: 'Salida',
  },
]

/**
 * Franja de resumen inmediatamente debajo del hero: presenta el recorrido
 * completo como una cuadrícula de etapas. Cada etapa es expandible (click)
 * y contiene ahí mismo su explicación — esto reemplaza a la antigua
 * sección separada "Cómo funciona", que quedó eliminada.
 *
 * El orden del flujo (1→2→3, baja a 4, 4→5→6, baja a 7, 7→8→9) se marca
 * con flechitas "›"/"⌄" en los huecos entre tarjetas — puro CSS via
 * nth-child en ProcessSummary.css, sin JS ni medicion de posiciones. Se
 * probaron dos versiones con una linea SVG continua calculada en runtime
 * (primero conectando centros de icono, luego bordes de tarjeta) y las
 * dos dieron problemas de alineacion/z-index en produccion — las flechas
 * son deliberadamente mas simples: cada una vive en un solo `::after`
 * posicionado por `nth-child`, sin depender de medir nada.
 */
export function ProcessSummary() {
  return (
    <section id="resumen" className="summary" aria-labelledby="summary-title">
      <div className="shell shell--wide">
        <Reveal>
          <div className="summary__head">
            <h2 id="summary-title" className="summary__title">
              De una grabación de voz a un reporte de apoyo
            </h2>
            <p className="summary__caption">
              Nueve etapas conectan una muestra de voz con un insumo interpretable. Toca cada una
              para ver el detalle.
            </p>
          </div>
        </Reveal>

        <ol className="summary__grid">
          {STAGES.map((stage, index) => (
            <Reveal as="li" key={stage.title} className="summary__cell" delay={index * 45}>
              <details className="summary__details">
                <summary className="summary__summary">
                  <span className="summary__icon">
                    <Icon name={stage.icon} size={19} />
                  </span>
                  <span className="summary__summary-text">
                    <span className="summary__role">{stage.track}</span>
                    <span className="summary__label">{stage.title}</span>
                  </span>
                  <span className="summary__chevron" aria-hidden="true">
                    <Icon name="chevronDown" size={16} />
                  </span>
                </summary>
                <p className="summary__desc">{stage.description}</p>
              </details>
            </Reveal>
          ))}
        </ol>

        <p className="summary__foot">
          <Icon name="shield" size={17} />
          <span>
            El recorrido termina en un insumo de apoyo. La interpretación y la decisión final
            corresponden siempre a un profesional de la salud.
          </span>
        </p>
      </div>
    </section>
  )
}
