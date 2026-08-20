import { scrollToSection } from '../lib/navigation.js'
import { Icon } from './ui/Icon.jsx'
import { VoiceCognitionVisual } from './VoiceCognitionVisual.jsx'
import './HeroSection.css'

export function HeroSection() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <span className="orb hero__orb hero__orb--one" />
        <span className="orb hero__orb hero__orb--two" />
        <span className="grid-veil" />
        <svg className="hero__waveline" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <path
            d="M0 150 C 180 90, 300 190, 480 140 S 780 60, 960 130 S 1260 190, 1440 110"
            fill="none"
            stroke="url(#heroLine)"
            strokeWidth="1.4"
          />
          <path
            d="M0 186 C 200 130, 320 216, 520 170 S 820 104, 1000 168 S 1280 214, 1440 152"
            fill="none"
            stroke="url(#heroLine)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          <defs>
            <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5273E0" stopOpacity="0" />
              <stop offset="35%" stopColor="#5273E0" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#7258D6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#55BEC4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="shell shell--wide hero__inner">
        <div className="hero__content">
          <h1 id="hero-title" className="hero__title">
            De la voz a un <span className="text-gradient">reporte de apoyo</span> cognitivo
          </h1>

          <p className="lead hero__lead">
            Una propuesta basada en aprendizaje profundo que integra características acústicas y
            lingüísticas de una grabación de voz para generar un resultado interpretable de apoyo al
            tamizaje cognitivo.
          </p>

          <div className="hero__actions">
            <button
              type="button"
              className="vc-btn vc-btn--primary"
              onClick={() => scrollToSection('resumen')}
            >
              Descubrir cómo funciona
              <Icon name="arrowRight" size={17} />
            </button>
          </div>

          <p className="disclaimer-note hero__note">
            <Icon name="info" size={17} />
            <span>Los resultados no constituyen un diagnóstico médico.</span>
          </p>
        </div>

        <div className="hero__visual">
          <VoiceCognitionVisual />
        </div>
      </div>

      <a
        className="hero__scroll-hint"
        href="#resumen"
        onClick={(event) => {
          event.preventDefault()
          scrollToSection('resumen')
        }}
      >
        <span>Recorrer el flujo</span>
        <Icon name="chevronDown" size={16} />
      </a>
    </section>
  )
}
