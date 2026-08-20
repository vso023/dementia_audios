import { scrollToSection } from '../lib/navigation.js'
import { Icon } from './ui/Icon.jsx'
import { Logo } from './ui/Logo.jsx'
import './Footer.css'

const CREDITS = [{ label: 'Autora', value: 'Valerie Sofia Olave Pineda' }]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__bg" aria-hidden="true">
        <svg className="footer__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0 66 C 220 20, 360 104, 600 62 S 960 12, 1180 70 S 1380 108, 1440 84"
            fill="none"
            stroke="url(#footWave)"
            strokeWidth="1.2"
          />
          <defs>
            <linearGradient id="footWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5273E0" stopOpacity="0" />
              <stop offset="45%" stopColor="#5273E0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7258D6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="shell shell--wide footer__inner">
        <div className="footer__brand">
          <Logo animated={false} />
          <p className="footer__tagline">
            Análisis de voz basado en aprendizaje profundo como apoyo al tamizaje cognitivo.
          </p>

          {CREDITS.length > 0 ? (
            <dl className="footer__credits">
              {CREDITS.map((credit) => (
                <div key={credit.label}>
                  <dt>{credit.label}</dt>
                  <dd>{credit.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="footer__notices">
          <h2 className="footer__heading">Avisos</h2>

          <p className="footer__notice">
            <Icon name="info" size={16} />
            <span>
              <strong>Uso académico.</strong> Esta página presenta un proyecto de carácter académico
              y no ofrece un servicio clínico.
            </span>
          </p>

          <p className="footer__notice">
            <Icon name="shield" size={16} />
            <span>
              <strong>No diagnóstico.</strong> Los resultados descritos son un insumo de apoyo,
              requieren interpretación profesional y no sustituyen una evaluación médica.
            </span>
          </p>
        </div>
      </div>

      <div className="shell shell--wide footer__bottom">
        <p>© {year} Vox Cognita — Proyecto académico.</p>
        <button type="button" className="footer__top" onClick={() => scrollToSection('inicio')}>
          Volver arriba
          <Icon name="arrowUp" size={15} />
        </button>
      </div>
    </footer>
  )
}
