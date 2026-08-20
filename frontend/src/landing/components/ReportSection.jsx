import { Icon } from './ui/Icon.jsx'
import { Reveal } from './ui/Reveal.jsx'
import './ReportSection.css'

const CONTENTS = [
  {
    icon: 'tag',
    title: 'Clasificación obtenida',
    text: 'El resultado que produjo el modelo para la muestra analizada.',
  },
  {
    icon: 'pulse',
    title: 'Características relevantes',
    text: 'Los descriptores acústicos y lingüísticos que más pesaron en esa salida.',
  },
  {
    icon: 'transcript',
    title: 'Resumen del análisis',
    text: 'Una síntesis del recorrido que siguió la muestra dentro del flujo.',
  },
  {
    icon: 'compass',
    title: 'Información de apoyo',
    text: 'Elementos que pueden orientar la sospecha clínica del profesional.',
  },
  {
    icon: 'shield',
    title: 'Advertencia de interpretación',
    text: 'La indicación explícita de que el resultado requiere lectura profesional.',
  },
]

/** Barra neutra: sugiere un bloque de contenido, nunca un valor concreto. */
function Skeleton({ width, delay = 0 }) {
  return <span className="report__skeleton" style={{ '--w': width, '--d': `${delay}s` }} />
}

export function ReportSection() {
  return (
    <section id="reporte" className="vc-report section" aria-labelledby="report-title">
      <div className="section__bg" aria-hidden="true">
        <span className="orb report__orb" />
      </div>

      <div className="shell shell--wide report__inner">
        {/* ---------- Texto ---------- */}
        <div className="report__text">
          <Reveal>
            <p className="eyebrow">El reporte</p>
          </Reveal>

          <Reveal delay={70}>
            <h2 id="report-title" className="report__title">
              Un resultado diseñado para ser interpretado
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="lead">
              El proceso termina en un reporte que reúne la clasificación obtenida y las
              características más relevantes que la sustentan. No es un diagnóstico: es un insumo
              de apoyo dirigido a orientar la sospecha clínica.
            </p>
          </Reveal>

          <ul className="report__contents">
            {CONTENTS.map((item, index) => (
              <Reveal as="li" key={item.title} delay={180 + index * 70} className="report__content">
                <span className="report__content-icon">
                  <Icon name={item.icon} size={17} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={560}>
            <p className="report__closing">
              <Icon name="user" size={17} />
              <span>La decisión final permanece siempre en manos del profesional de la salud.</span>
            </p>
          </Reveal>
        </div>

        {/* ---------- Maqueta ilustrativa ---------- */}
        <div className="report__mock-wrap">
          <Reveal from="scale">
            <figure className="report__mock">
              <figcaption className="report__illustrative">
                <Icon name="info" size={14} />
                Ejemplo visual ilustrativo
              </figcaption>

              <div className="report__doc" aria-hidden="true">
                {/* Cabecera del documento */}
                <header className="report__doc-head">
                  <span className="report__doc-mark">
                    <Icon name="report" size={17} />
                  </span>
                  <span className="report__doc-heading">
                    <span className="report__doc-title">Reporte de apoyo</span>
                    <span className="report__doc-sub">Análisis de una muestra de voz</span>
                  </span>
                  <span className="report__doc-stamp">No diagnóstico</span>
                </header>

                {/* Bloque 1 — Resumen */}
                <section className="report__block report__block--enter" style={{ '--i': 0 }}>
                  <p className="report__block-title">Resumen del análisis</p>
                  <div className="report__lines">
                    <Skeleton width="100%" />
                    <Skeleton width="88%" delay={0.15} />
                    <Skeleton width="64%" delay={0.3} />
                  </div>
                </section>

                {/* Bloque 2 — Clasificación */}
                <section
                  className="report__block report__block--accent report__block--enter"
                  style={{ '--i': 1 }}
                >
                  <p className="report__block-title">Clasificación de apoyo</p>
                  <div className="report__states">
                    {['Estado evaluado', 'Categoría asignada', 'Nivel de revisión'].map(
                      (label, index) => (
                        <div key={label} className="report__state">
                          <span className="report__state-label">{label}</span>
                          <span className="report__state-chip" style={{ '--d': `${index * 0.18}s` }} />
                        </div>
                      ),
                    )}
                  </div>
                  <p className="report__block-note">
                    Los campos se muestran en estado neutro: no representan un resultado real.
                  </p>
                </section>

                {/* Bloque 3 y 4 — Características */}
                <div className="report__grid">
                  <section className="report__block report__block--enter" style={{ '--i': 2 }}>
                    <p className="report__block-title">
                      <span className="report__key report__key--teal" />
                      Características acústicas relevantes
                    </p>
                    <div className="report__slots">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="report__slot report__slot--teal"
                          style={{ '--d': `${index * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="report__chips">
                      <span>ritmo</span>
                      <span>pausas</span>
                      <span>entonación</span>
                    </span>
                  </section>

                  <section className="report__block report__block--enter" style={{ '--i': 3 }}>
                    <p className="report__block-title">
                      <span className="report__key report__key--purple" />
                      Características lingüísticas relevantes
                    </p>
                    <div className="report__slots">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="report__slot report__slot--purple"
                          style={{ '--d': `${index * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="report__chips">
                      <span>fluidez</span>
                      <span>organización</span>
                    </span>
                  </section>
                </div>

                {/* Bloque 5 — Advertencia */}
                <section
                  className="report__block report__block--warn report__block--enter"
                  style={{ '--i': 4 }}
                >
                  <span className="report__warn-icon">
                    <Icon name="shield" size={17} />
                  </span>
                  <span>
                    <span className="report__block-title">Interpretación profesional requerida</span>
                    <span className="report__warn-text">
                      Este reporte es un insumo de apoyo y no sustituye una evaluación médica.
                    </span>
                  </span>
                </section>
              </div>
            </figure>
          </Reveal>

          <Reveal delay={160}>
            <p className="report__mock-note">
              Maqueta conceptual del formato del reporte. Las barras y campos son marcadores
              gráficos sin valores asociados: no contienen datos de personas ni resultados.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
