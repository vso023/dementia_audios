import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useFlowPath } from '../hooks/useFlowPath.js'
import { useReveal } from '../hooks/useReveal.js'
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
 */
export function ProcessSummary() {
  const { wrapRef, gridRef, itemRefs, cardRefs, points, size, pathD } = useFlowPath(STAGES.length)
  // El mismo nodo sirve para medir posiciones (wrapRef) y para detectar
  // cuando la cuadrícula entra en viewport (revealRef, dispara el trazado
  // una sola vez) — se combinan en un callback ref sobre el wrapper.
  const { ref: revealRef, isVisible } = useReveal({ threshold: 0.2 })
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  useLayoutEffect(() => {
    if (pathRef.current && pathD) setPathLength(pathRef.current.getTotalLength())
  }, [pathD])

  const setWrapNode = useCallback(
    (node) => {
      wrapRef.current = node
      revealRef.current = node
    },
    [wrapRef, revealRef],
  )

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

        <div className="summary__grid-wrap" ref={setWrapNode}>
          <svg className="summary__connector-svg" width={size.width} height={size.height} aria-hidden="true">
            <defs>
              <linearGradient id="summaryFlowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3157D5" />
                <stop offset="45%" stopColor="#5273E0" />
                <stop offset="100%" stopColor="#7258D6" />
              </linearGradient>
            </defs>

            {pathD && (
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="url(#summaryFlowGrad)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="summary__connector-path"
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: isVisible ? 0 : pathLength,
                }}
              />
            )}

            {points.map((p, index) => (
              <circle
                key={index}
                cx={p.x}
                cy={p.y}
                r={4}
                className="summary__connector-node"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDelay: `${0.15 + index * (1.3 / STAGES.length)}s`,
                }}
              />
            ))}
          </svg>

          <ol className="summary__grid" ref={gridRef}>
            {STAGES.map((stage, index) => (
              <Reveal as="li" key={stage.title} className="summary__cell" delay={index * 45}>
                <details
                  className="summary__details"
                  ref={(el) => {
                    cardRefs.current[index] = el
                  }}
                >
                  <summary className="summary__summary">
                    <span
                      className="summary__icon"
                      ref={(el) => {
                        itemRefs.current[index] = el
                      }}
                    >
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
        </div>

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
