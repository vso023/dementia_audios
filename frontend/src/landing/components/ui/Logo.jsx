import './Logo.css'

/**
 * Marca abstracta del proyecto: un núcleo de nodos conectados del que salen
 * barras de voz de altura creciente. Une las dos ideas del proyecto —sonido
 * y cognición— sin recurrir a iconografía literal.
 */
export function Logo({ tone = 'default', animated = true }) {
  return (
    <span className={`logo logo--${tone}`}>
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="38" height="38">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3157D5" />
              <stop offset="55%" stopColor="#5273E0" />
              <stop offset="100%" stopColor="#7258D6" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="40" height="40" rx="12" fill="url(#logoGrad)" />

          {/* Nodo de origen: la voz que entra */}
          <circle cx="9.5" cy="20" r="2.6" fill="#55BEC4" />

          {/* Barras de voz que crecen hacia el análisis */}
          <g className={animated ? 'logo__bars logo__bars--live' : 'logo__bars'} fill="#FFFFFF">
            <rect x="14.7" y="14.5" width="2.6" height="11" rx="1.3" />
            <rect x="21.2" y="10.5" width="2.6" height="19" rx="1.3" />
            <rect x="27.7" y="16" width="2.6" height="8" rx="1.3" />
          </g>
        </svg>
      </span>

      <span className="logo__text">
        <span className="logo__name">Vox Cognita</span>
        <span className="logo__tagline">Voz &amp; apoyo cognitivo</span>
      </span>
    </span>
  )
}
