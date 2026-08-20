import { Icon } from './ui/Icon.jsx'
import { Reveal } from './ui/Reveal.jsx'
import { SectionHeading } from './ui/SectionHeading.jsx'
import './MultimodalAnalysis.css'

const ACOUSTIC_ITEMS = [
  'Ritmo del habla',
  'Pausas y silencios',
  'Entonación',
  'Variaciones temporales',
  'Dinámica de la voz',
]

const LINGUISTIC_ITEMS = [
  'Fluidez',
  'Organización del discurso',
  'Estructura del contenido hablado',
  'Patrones lingüísticos relevantes',
  'Relaciones entre fragmentos',
]

/* Alturas fijas del espectro decorativo. */
const SPECTRUM = [34, 62, 48, 80, 56, 92, 44, 70, 86, 52, 76, 40, 64, 96, 50, 72, 58, 88, 42, 66]

/** Visualización decorativa de la vía acústica: onda, segmentos y pausas. */
function AcousticVisual() {
  return (
    <div className="ma__viz ma__viz--acoustic" aria-hidden="true">
      <svg className="ma__wave-svg" viewBox="0 0 320 96" preserveAspectRatio="none">
        {/* Segmentos de pausa marcados sobre la línea temporal */}
        <g fill="rgba(85, 190, 196, 0.14)">
          <rect className="ma__pause" x="92" y="6" width="26" height="84" rx="6" />
          <rect
            className="ma__pause"
            x="214"
            y="6"
            width="18"
            height="84"
            rx="6"
            style={{ animationDelay: '1.4s' }}
          />
        </g>

        <path
          className="ma__trace"
          d="M4 66 C 26 18, 48 84, 70 44 S 110 12, 138 62 S 176 88, 204 34 S 244 20, 272 64 S 300 74, 316 48"
          fill="none"
          stroke="url(#maTeal)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="maTeal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#55BEC4" />
            <stop offset="60%" stopColor="#3157D5" />
            <stop offset="100%" stopColor="#5273E0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="ma__spectrum">
        {SPECTRUM.map((height, index) => (
          <span key={index} style={{ '--h': `${height}%`, '--d': `${(index % 6) * 0.14}s` }} />
        ))}
      </div>

      <div className="ma__timeline">
        <span className="ma__timeline-line" />
        {[0, 1, 2, 3, 4].map((tick) => (
          <span key={tick} className="ma__tick" />
        ))}
      </div>
    </div>
  )
}

/** Visualización decorativa de la vía lingüística: bloques y nodos. */
function LinguisticVisual() {
  return (
    <div className="ma__viz ma__viz--linguistic" aria-hidden="true">
      <div className="ma__blocks">
        {['32%', '20%', '26%', '18%', '24%', '30%', '16%', '22%'].map((width, index) => (
          <span key={index} style={{ '--w': width, '--d': `${index * 0.12}s` }} />
        ))}
      </div>

      <svg className="ma__graph" viewBox="0 0 320 118">
        <g stroke="#7258D6" strokeOpacity="0.32" strokeWidth="1.2">
          <line x1="42" y1="30" x2="122" y2="66" />
          <line x1="122" y1="66" x2="206" y2="26" />
          <line x1="122" y1="66" x2="190" y2="98" />
          <line x1="190" y1="98" x2="278" y2="62" />
          <line x1="206" y1="26" x2="278" y2="62" />
          <line x1="42" y1="30" x2="66" y2="94" />
          <line x1="66" y1="94" x2="122" y2="66" />
        </g>

        {[
          [42, 30, 6.5],
          [122, 66, 9],
          [206, 26, 6],
          [190, 98, 6],
          [278, 62, 7.5],
          [66, 94, 5.5],
        ].map(([cx, cy, r], index) => (
          <circle
            key={index}
            className="ma__node"
            cx={cx}
            cy={cy}
            r={r}
            fill={index % 2 === 0 ? '#7258D6' : '#5273E0'}
            style={{ animationDelay: `${index * 0.26}s` }}
          />
        ))}
      </svg>

      <div className="ma__fragments">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export function MultimodalAnalysis() {
  return (
    <section id="analisis" className="ma section" aria-labelledby="ma-title">
      <div className="section__bg" aria-hidden="true">
        <span className="orb ma__orb ma__orb--left" />
        <span className="orb ma__orb ma__orb--right" />
      </div>

      <div className="shell shell--wide">
        <SectionHeading
          eyebrow="Qué analiza"
          titleId="ma-title"
          title="Dos fuentes de información, un solo análisis integrado"
          description="El audio y su transcripción no se evalúan por separado: son dos entradas que un mismo modelo combina internamente para producir una única clasificación."
        />

        <div className="ma__paths">
          {/* ---------- Vía acústica ---------- */}
          <Reveal from="left" className="ma__path-wrap">
            <article className="ma__path ma__path--acoustic">
              <header className="ma__path-head">
                <span className="ma__path-icon">
                  <Icon name="pulse" size={21} />
                </span>
                <div>
                  <p className="ma__path-kicker">Fuente 1 · Audio</p>
                  <h3 className="ma__path-title">Características acústicas y temporales</h3>
                </div>
              </header>

              <p className="ma__path-text">
                Se extraen directamente de la señal de audio: cómo se produce el habla, más allá de
                las palabras que se dicen. El modelo las recibe como una de sus dos entradas.
              </p>

              <AcousticVisual />
              <p className="ma__illustrative">Representación ilustrativa</p>

              <ul className="ma__list">
                {ACOUSTIC_ITEMS.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          {/* ---------- Vía lingüística ---------- */}
          <Reveal from="right" delay={120} className="ma__path-wrap">
            <article className="ma__path ma__path--linguistic">
              <header className="ma__path-head">
                <span className="ma__path-icon">
                  <Icon name="language" size={21} />
                </span>
                <div>
                  <p className="ma__path-kicker">Fuente 2 · Texto</p>
                  <h3 className="ma__path-title">Características lingüísticas del texto</h3>
                </div>
              </header>

              <p className="ma__path-text">
                Se extraen del texto transcrito: cómo se organiza el contenido hablado y qué
                patrones aparecen en el discurso. Es la segunda entrada del mismo modelo.
              </p>

              <LinguisticVisual />
              <p className="ma__illustrative">Representación ilustrativa</p>

              <ul className="ma__list">
                {LINGUISTIC_ITEMS.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>

        {/* ---------- Convergencia ---------- */}
        <div className="ma__converge">
          <svg
            className="ma__converge-svg"
            viewBox="0 0 900 90"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="none" strokeWidth="2" strokeDasharray="6 9" strokeLinecap="round">
              <path
                className="ma__converge-path"
                d="M170 0 C 170 56, 450 30, 450 88"
                stroke="#55BEC4"
                strokeOpacity="0.75"
              />
              <path
                className="ma__converge-path"
                d="M730 0 C 730 56, 450 30, 450 88"
                stroke="#7258D6"
                strokeOpacity="0.75"
                style={{ animationDelay: '0.9s' }}
              />
            </g>
          </svg>

          <Reveal from="scale">
            <div className="ma__merge">
              <span className="ma__merge-icon">
                <Icon name="layers" size={22} />
              </span>
              <div>
                <h3 className="ma__merge-title">Integración de características</h3>
                <p className="ma__merge-text">
                  Los descriptores acústicos y lingüísticos se combinan dentro de un mismo modelo,
                  que produce una única clasificación integrada — no dos resultados separados.
                </p>
              </div>
            </div>
          </Reveal>

          <span className="ma__down" aria-hidden="true">
            <Icon name="chevronDown" size={18} />
          </span>

          <Reveal delay={100}>
            <div className="ma__model">
              <span className="ma__model-icon">
                <Icon name="network" size={20} />
              </span>
              <span>
                <strong>Modelo de aprendizaje profundo</strong>
                <span>Produce un único resultado a partir de las dos fuentes combinadas.</span>
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
