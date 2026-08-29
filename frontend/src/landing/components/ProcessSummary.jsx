import { Icon } from './ui/Icon.jsx'
import { Reveal } from './ui/Reveal.jsx'
import './ProcessSummary.css'

// Orden LOGICO del proceso (1 a 9), documentado aparte del orden de
// renderizado — ver STAGES_EN_ORDEN_DE_GRILLA mas abajo, que es el que
// realmente se dibuja.
const ETAPA_1_GRABACION = {
  title: 'Grabación de voz',
  description: 'La muestra de voz funciona como entrada del proceso.',
  icon: 'mic',
  track: 'Entrada',
}
const ETAPA_2_PREPROCESAMIENTO = {
  title: 'Preprocesamiento de la señal',
  description: 'La señal se acondiciona para facilitar su análisis posterior.',
  icon: 'sliders',
  track: 'Procesamiento',
}
const ETAPA_3_TRANSCRIPCION = {
  title: 'Transcripción automática',
  description: 'El contenido hablado se convierte automáticamente en texto.',
  icon: 'transcript',
  track: 'Procesamiento',
}
const ETAPA_4_CARACTERISTICAS_ACUSTICAS = {
  title: 'Características acústicas y temporales',
  description: 'Se examinan aspectos de la señal como ritmo, pausas y entonación.',
  icon: 'pulse',
  track: 'Análisis',
}
const ETAPA_5_ANALISIS_LINGUISTICO = {
  title: 'Análisis del contenido lingüístico',
  description: 'Se estudian elementos relacionados con fluidez y organización del discurso.',
  icon: 'language',
  track: 'Análisis',
}
const ETAPA_6_INTEGRACION = {
  title: 'Integración de características',
  description: 'Las dos vías se reúnen en una representación conjunta de la muestra.',
  icon: 'layers',
  track: 'Análisis',
}
const ETAPA_7_MODELO = {
  title: 'Modelo de aprendizaje profundo',
  description: 'Las características obtenidas alimentan un modelo de aprendizaje profundo.',
  icon: 'network',
  track: 'Modelo',
}
const ETAPA_8_CLASIFICACION = {
  title: 'Clasificación',
  description: 'El modelo produce una clasificación de apoyo sobre el estado cognitivo evaluado.',
  icon: 'tag',
  track: 'Modelo',
}
const ETAPA_9_REPORTE = {
  title: 'Reporte interpretable',
  description: 'Los resultados se organizan en una salida interpretable de apoyo.',
  icon: 'report',
  track: 'Salida',
}

// Orden de RENDERIZADO (boustrophedon / serpiente real): la cuadricula
// CSS coloca los items en orden de fila, izquierda a derecha, siempre —
// no hay forma de que una fila del medio "vaya al reves" visualmente sin
// que su CONTENIDO este invertido en el propio orden del array. Por eso
// la fila del medio (posiciones 4, 5 y 6 de esta lista) contiene las
// etapas 6, 5 y 4 EN ESE ORDEN: al dibujarse de izquierda a derecha como
// cualquier fila del grid, la etapa 4 (logica) termina visualmente a la
// derecha (justo debajo de la etapa 3, de donde baja el flujo) y la
// etapa 6 (logica) termina a la izquierda (desde donde el flujo sigue
// bajando a la etapa 7). Fila 1 y fila 3 SI van en orden logico normal
// porque ahi el flujo visual coincide con el orden de lectura.
const STAGES = [
  ETAPA_1_GRABACION,
  ETAPA_2_PREPROCESAMIENTO,
  ETAPA_3_TRANSCRIPCION,
  ETAPA_6_INTEGRACION, // fila del medio, columna IZQUIERDA (visual) — logicamente la etapa 6
  ETAPA_5_ANALISIS_LINGUISTICO, // fila del medio, columna CENTRO — logicamente la etapa 5
  ETAPA_4_CARACTERISTICAS_ACUSTICAS, // fila del medio, columna DERECHA (visual) — logicamente la etapa 4
  ETAPA_7_MODELO,
  ETAPA_8_CLASIFICACION,
  ETAPA_9_REPORTE,
]

/**
 * Franja de resumen inmediatamente debajo del hero: presenta el recorrido
 * completo como una cuadrícula de etapas. Cada etapa es expandible (click)
 * y contiene ahí mismo su explicación — esto reemplaza a la antigua
 * sección separada "Cómo funciona", que quedó eliminada.
 *
 * El flujo se dibuja como un serpiente real (boustrophedon): fila
 * superior de izquierda a derecha (1→2→3), baja por la DERECHA a la
 * fila del medio, fila del medio de DERECHA a IZQUIERDA (4→5→6, con el
 * contenido reordenado en el array — ver comentario sobre STAGES),
 * baja por la IZQUIERDA a la fila inferior, fila inferior de izquierda
 * a derecha otra vez (7→8→9). Las flechitas "›"/"‹"/"⌄" que marcan cada
 * tramo son puro CSS via `nth-child` en ProcessSummary.css, posiciones
 * fijas (no una formula generica), precisamente porque el patron ya no
 * es simetrico entre filas. Sin JS ni medicion de posiciones — se
 * probo antes una linea SVG continua calculada en runtime y dio
 * problemas repetidos de alineacion/z-index en produccion.
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
