/**
 * Set de iconos de trazo dibujado a mano, inline y sin dependencias.
 * Todos comparten grid de 24 px, trazo de 1.7 y terminaciones redondeadas.
 */
const PATHS = {
  mic: (
    <>
      <rect x="9" y="2.75" width="6" height="11.5" rx="3" />
      <path d="M5.25 11.2a6.75 6.75 0 0 0 13.5 0" />
      <path d="M12 18v3.25M8.75 21.25h6.5" />
    </>
  ),
  waveform: (
    <>
      <path d="M3 12h1.6M20 12h1" />
      <path d="M7.4 8.2v7.6M11 5v14M14.6 7.2v9.6M18.2 9.6v4.8" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.1" />
      <circle cx="9" cy="17" r="2.1" />
    </>
  ),
  transcript: (
    <>
      <rect x="3.75" y="4" width="16.5" height="16" rx="3.2" />
      <path d="M7.5 9h9M7.5 12.5h9M7.5 16h5" />
    </>
  ),
  pulse: (
    <>
      <path d="M2.75 12.5h3.6l2-5.4 3 10.8 2.3-7 1.6 3.3h5" />
    </>
  ),
  language: (
    <>
      <path d="M3.4 6.6h8.4M7.6 4.5v2.1" />
      <path d="M10 6.6c0 3.6-2.6 6.6-6.6 8.1" />
      <path d="M5.6 10.9c1.1 1.9 3 3.3 5.2 3.9" />
      <path d="M12.6 20.5l4-10 4 10M14.2 17.2h4.8" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.2 3.4 7.6 12 12l8.6-4.4L12 3.2Z" />
      <path d="m3.4 12.4 8.6 4.4 8.6-4.4" />
      <path d="m3.4 16.9 8.6 4.4 8.6-4.4" />
    </>
  ),
  network: (
    <>
      <circle cx="5" cy="6.4" r="2.2" />
      <circle cx="5" cy="17.6" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="6.4" r="2.2" />
      <circle cx="19" cy="17.6" r="2.2" />
      <path d="m7 7.4 3 3.4M7 16.6l3-3.4M14 10.8l3-3.4M14 13.2l3 3.4" />
    </>
  ),
  tag: (
    <>
      <path d="M3.75 10.4V5.6a1.9 1.9 0 0 1 1.9-1.9h4.8a1.9 1.9 0 0 1 1.34.56l7.3 7.3a1.9 1.9 0 0 1 0 2.68l-4.85 4.85a1.9 1.9 0 0 1-2.68 0l-7.3-7.3a1.9 1.9 0 0 1-.51-1.39Z" />
      <circle cx="8.3" cy="8.3" r="1.2" />
    </>
  ),
  report: (
    <>
      <path d="M14 3.2H7.4A2.4 2.4 0 0 0 5 5.6v12.8a2.4 2.4 0 0 0 2.4 2.4h9.2a2.4 2.4 0 0 0 2.4-2.4V8.4L14 3.2Z" />
      <path d="M13.7 3.4v4.2a1.2 1.2 0 0 0 1.2 1.2h4.1" />
      <path d="M8.6 13h6.8M8.6 16.6h4.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.9v5.3c0 4.2 2.8 8.1 7 9.5 4.2-1.4 7-5.3 7-9.5V5.9L12 3Z" />
      <path d="m9.3 11.9 1.9 1.9 3.6-3.7" />
    </>
  ),
  check: <path d="m4.8 12.6 4.6 4.6 9.8-10.4" />,
  arrowRight: (
    <>
      <path d="M4.5 12h14.6" />
      <path d="m13.4 6.4 5.7 5.6-5.7 5.6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19.4V4.8" />
      <path d="m6.4 10.4 5.6-5.6 5.6 5.6" />
    </>
  ),
  chevronDown: <path d="m6.5 9.5 5.5 5.4 5.5-5.4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  spark: (
    <>
      <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6 10.1 12.8 4.3 10.9 10.1 9 12 3.2Z" />
      <path d="M18.6 16.4l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="5.8" r="2.4" />
      <circle cx="18" cy="18.2" r="2.4" />
      <path d="M8.4 5.8h5.4a3.4 3.4 0 0 1 0 6.8h-3.6a3.4 3.4 0 0 0 0 6.8h5.4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m15.3 8.7-1.8 4.8-4.8 1.8 1.8-4.8 4.8-1.8Z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 11.2v5M12 7.9v.1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.9 20.2a7.6 7.6 0 0 1 14.2 0" />
    </>
  ),
}

export function Icon({ name, size = 20, title, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  )
}
