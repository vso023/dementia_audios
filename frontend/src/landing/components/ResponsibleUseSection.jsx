import { Icon } from './ui/Icon.jsx'
import { Reveal } from './ui/Reveal.jsx'
import './ResponsibleUseSection.css'

const POINTS = [
  {
    title: 'Orienta una posible sospecha',
    text: 'La clasificación busca señalar aspectos que merecen atención, no cerrar una conclusión.',
  },
  {
    title: 'No sustituye una valoración clínica',
    text: 'La evaluación del estado cognitivo corresponde a una valoración profesional completa.',
  },
  {
    title: 'No debe interpretarse de forma aislada',
    text: 'El resultado cobra sentido junto con el resto de la información disponible.',
  },
  {
    title: 'El contexto de la persona sigue siendo fundamental',
    text: 'Historia, condiciones particulares y circunstancias del habla influyen en cualquier lectura.',
  },
  {
    title: 'La decisión final es del profesional de la salud',
    text: 'La herramienta aporta un insumo; la responsabilidad de la conclusión no se traslada.',
  },
  {
    title: 'Requiere un uso responsable',
    text: 'Debe emplearse dentro de los límites para los que fue concebida, como apoyo al tamizaje.',
  },
]

export function ResponsibleUseSection() {
  return (
    <section id="uso-responsable" className="ru on-dark" aria-labelledby="ru-title">
      <div className="ru__bg" aria-hidden="true">
        <span className="ru__orb ru__orb--a" />
        <span className="ru__orb ru__orb--b" />

        {/* Ondas discretas */}
        <svg className="ru__waves" viewBox="0 0 1440 260" preserveAspectRatio="none">
          <g fill="none" stroke="url(#ruWave)" strokeWidth="1.2">
            <path d="M0 90 C 200 30, 340 140, 560 92 S 900 26, 1120 96 S 1340 150, 1440 100" />
            <path d="M0 140 C 220 84, 360 190, 600 142 S 940 76, 1160 146 S 1360 196, 1440 150" />
            <path d="M0 196 C 240 140, 380 240, 640 196 S 980 130, 1200 200 S 1380 244, 1440 204" />
          </g>
          <defs>
            <linearGradient id="ruWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#55BEC4" stopOpacity="0" />
              <stop offset="30%" stopColor="#55BEC4" stopOpacity="0.34" />
              <stop offset="70%" stopColor="#9B85F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9B85F0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="shell ru__inner">
        <Reveal>
          <span className="ru__shield">
            <Icon name="shield" size={30} />
            <span className="ru__shield-ring" />
          </span>
        </Reveal>

        <Reveal delay={70}>
          <p className="eyebrow ru__eyebrow">Uso responsable</p>
        </Reveal>

        <Reveal delay={120}>
          <h2 id="ru-title" className="ru__title">
            Diseñada como apoyo, no como diagnóstico
          </h2>
        </Reveal>

        <Reveal delay={180}>
          <blockquote className="ru__statement">
            <p>
              Los resultados generados constituyen un insumo de apoyo. No representan un diagnóstico
              médico y deben ser interpretados por un profesional de la salud calificado.
            </p>
          </blockquote>
        </Reveal>

        <div className="ru__accordion">
          {POINTS.map((point, index) => (
            <Reveal as="div" key={point.title} delay={220 + index * 60} className="ru__item">
              <details className="ru__details">
                <summary className="ru__summary">
                  <span className="ru__point-mark" aria-hidden="true">
                    <Icon name="check" size={13} />
                  </span>
                  <span className="ru__summary-title">{point.title}</span>
                  <span className="ru__summary-chevron" aria-hidden="true">
                    <Icon name="chevronDown" size={16} />
                  </span>
                </summary>
                <p className="ru__point-text">{point.text}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal delay={660}>
          <p className="ru__foot">
            <Icon name="info" size={16} />
            Proyecto académico. La herramienta se presenta como propuesta de investigación aplicada
            y no como un producto clínico validado para su uso asistencial.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
