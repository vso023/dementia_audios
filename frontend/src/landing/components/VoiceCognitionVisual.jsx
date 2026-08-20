import { Icon } from './ui/Icon.jsx'
import './VoiceCognitionVisual.css'

/* Alturas fijas de la onda: patrón determinista, no datos reales. */
const WAVE = [
  18, 34, 52, 30, 66, 84, 58, 40, 72, 96, 64, 44, 26, 38, 60, 88, 100, 74, 50, 32, 20, 30, 48, 70,
  92, 68, 46, 28, 36, 56, 80, 62, 42, 24, 34, 54, 76, 58, 38, 26,
]

/* Nodos de la red: columnas de entrada, dos capas intermedias y salida. */
const LAYERS = [
  { x: 26, nodes: [22, 50, 78, 106] },
  { x: 104, nodes: [16, 46, 76, 106] },
  { x: 182, nodes: [32, 62, 92] },
]

/**
 * Ilustración original del hero. Cuenta, de arriba abajo, el recorrido
 * completo: una grabación de voz entra, se procesa, se analiza por dos vías
 * complementarias, atraviesa un modelo y termina en un reporte de apoyo.
 * Es una representación conceptual: no muestra datos ni valores reales.
 */
export function VoiceCognitionVisual() {
  return (
    <div className="hv" aria-hidden="true">
      {/* Ambiente: orbes y anillos concéntricos */}
      <span className="hv__orb hv__orb--a" />
      <span className="hv__orb hv__orb--b" />
      <span className="hv__orb hv__orb--c" />

      <svg className="hv__rings" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="url(#hvRing)" strokeWidth="1">
          <circle cx="200" cy="200" r="88" strokeDasharray="3 7" />
          <circle cx="200" cy="200" r="136" strokeDasharray="3 9" />
          <circle cx="200" cy="200" r="186" strokeDasharray="2 11" />
        </g>
        <defs>
          <linearGradient id="hvRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5273E0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7258D6" stopOpacity="0.12" />
          </linearGradient>
        </defs>
      </svg>

      {/* Capas de profundidad detrás del panel principal */}
      <span className="hv__shadow-card hv__shadow-card--far" />
      <span className="hv__shadow-card hv__shadow-card--near" />

      <div className="hv__panel">
        {/* --- 1. Entrada: grabación de voz --- */}
        <div className="hv__row hv__head">
          <span className="hv__mic">
            <span className="hv__mic-ring" />
            <span className="hv__mic-ring hv__mic-ring--delay" />
            <Icon name="mic" size={19} />
          </span>
          <span className="hv__head-text">
            <span className="hv__label">Grabación de voz</span>
            <span className="hv__sub">Entrada del proceso</span>
          </span>
          <span className="hv__chip hv__chip--live">
            <span className="hv__chip-dot" />
            señal
          </span>
        </div>

        {/* --- 2. Señal acondicionada --- */}
        <div className="hv__wave">
          {WAVE.map((height, index) => (
            <span
              key={index}
              className="hv__bar"
              style={{
                '--h': `${height}%`,
                '--d': `${(index % 11) * 0.13}s`,
              }}
            />
          ))}
          <span className="hv__wave-axis" />
        </div>

        <div className="hv__stage-row">
          <span className="hv__stage">Preprocesamiento</span>
          <span className="hv__stage-line" />
          <span className="hv__stage">Transcripción</span>
        </div>

        {/* --- 3. Dos vías de análisis --- */}
        <div className="hv__split">
          <div className="hv__mini">
            <span className="hv__mini-title">
              <Icon name="pulse" size={14} />
              Acústico
            </span>
            <svg className="hv__mini-viz" viewBox="0 0 120 40" preserveAspectRatio="none">
              <path
                className="hv__trace"
                d="M0 28 C 10 10, 18 34, 28 22 S 44 6, 54 26 S 70 34, 80 16 S 96 30, 108 20 L120 24"
                fill="none"
                stroke="url(#hvTeal)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <g fill="#55BEC4">
                <circle className="hv__marker" cx="28" cy="22" r="2.6" />
                <circle className="hv__marker" cx="80" cy="16" r="2.6" style={{ animationDelay: '1.1s' }} />
              </g>
              <defs>
                <linearGradient id="hvTeal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#55BEC4" />
                  <stop offset="100%" stopColor="#5273E0" />
                </linearGradient>
              </defs>
            </svg>
            <span className="hv__mini-tags">ritmo · pausas · entonación</span>
          </div>

          <div className="hv__mini">
            <span className="hv__mini-title">
              <Icon name="language" size={14} />
              Lingüístico
            </span>
            <span className="hv__lines">
              <span className="hv__line" style={{ '--w': '92%' }} />
              <span className="hv__line" style={{ '--w': '66%', '--d': '0.5s' }} />
              <span className="hv__line" style={{ '--w': '80%', '--d': '1s' }} />
            </span>
            <span className="hv__mini-tags">fluidez · organización</span>
          </div>
        </div>

        {/* --- 4. Integración de características --- */}
        <svg className="hv__converge" viewBox="0 0 300 34" preserveAspectRatio="none">
          <g fill="none" stroke="url(#hvFlow)" strokeWidth="1.6" strokeLinecap="round">
            <path className="hv__flow-path" d="M74 0 C 74 20, 150 12, 150 32" strokeDasharray="5 7" />
            <path
              className="hv__flow-path"
              d="M226 0 C 226 20, 150 12, 150 32"
              strokeDasharray="5 7"
              style={{ animationDelay: '0.9s' }}
            />
          </g>
          <defs>
            <linearGradient id="hvFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5273E0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7258D6" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </svg>

        {/* --- 5. Modelo de aprendizaje profundo --- */}
        <div className="hv__model">
          <span className="hv__model-title">
            <Icon name="network" size={14} />
            Modelo de aprendizaje profundo
          </span>

          <svg className="hv__net" viewBox="0 0 240 128" preserveAspectRatio="xMidYMid meet">
            <g stroke="#5273E0" strokeOpacity="0.28" strokeWidth="0.9">
              {LAYERS.slice(0, -1).flatMap((layer, li) =>
                layer.nodes.flatMap((y) =>
                  LAYERS[li + 1].nodes.map((y2) => (
                    <line
                      key={`${li}-${y}-${y2}`}
                      x1={layer.x}
                      y1={y + 8}
                      x2={LAYERS[li + 1].x}
                      y2={y2 + 8}
                    />
                  )),
                ),
              )}
              {LAYERS[2].nodes.map((y) => (
                <line key={`out-${y}`} x1={182} y1={y + 8} x2={216} y2={72} />
              ))}
            </g>

            {LAYERS.map((layer, li) =>
              layer.nodes.map((y, ni) => (
                <circle
                  key={`n-${li}-${ni}`}
                  className="hv__node"
                  cx={layer.x}
                  cy={y + 8}
                  r="4.6"
                  fill={li === 0 ? '#55BEC4' : '#5273E0'}
                  style={{ animationDelay: `${(li * 4 + ni) * 0.22}s` }}
                />
              )),
            )}

            <circle className="hv__node hv__node--out" cx="216" cy="72" r="7" fill="#7258D6" />
          </svg>

          <span className="hv__model-out">
            <Icon name="tag" size={13} />
            Clasificación de apoyo
          </span>
        </div>

        {/* --- 6. Salida: reporte interpretable --- */}
        <div className="hv__report">
          <span className="hv__report-icon">
            <Icon name="report" size={17} />
          </span>
          <span className="hv__report-body">
            <span className="hv__label">Reporte interpretable</span>
            <span className="hv__report-lines">
              <span style={{ '--w': '100%' }} />
              <span style={{ '--w': '72%' }} />
              <span style={{ '--w': '86%' }} />
            </span>
          </span>
          <span className="hv__report-seal">
            <Icon name="shield" size={13} />
            apoyo
          </span>
        </div>
      </div>

      {/* Elementos flotantes */}
      <span className="hv__float hv__float--a">
        <Icon name="waveform" size={14} />
        señal acondicionada
      </span>
      <span className="hv__float hv__float--b">
        <Icon name="transcript" size={14} />
        texto transcrito
      </span>
      <span className="hv__float hv__float--c">
        <Icon name="layers" size={14} />
        características integradas
      </span>
    </div>
  )
}
