// Iconos SVG hechos a mano — el proyecto no tiene Lucide React ni ninguna
// otra libreria de iconos instalada, y se evita agregar una dependencia
// nueva solo para esto (ver FRONTEND_REDESIGN.md). Trazo consistente,
// estilo lineal, 24x24, decorativos por defecto (aria-hidden) porque
// siempre acompañan a un texto visible, nunca lo reemplazan.

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function IconBrainWave(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5a3 3 0 0 0-3 3v.2A3 3 0 0 0 4.5 10a3 3 0 0 0 0 4 3 3 0 0 0 1.7 4.9 3 3 0 0 0 5.3 1.3" />
      <path d="M15 4.5a3 3 0 0 1 3 3v.2A3 3 0 0 1 19.5 10a3 3 0 0 1 0 4 3 3 0 0 1-1.7 4.9 3 3 0 0 1-5.3 1.3" />
      <path d="M9 7.5v11" />
      <path d="M15 7.5v11" />
      <path d="M9 11h2.2l1-2 1.6 4 1-2H15" />
    </svg>
  );
}

export function IconWaveform(props) {
  return (
    <svg {...base} {...props}>
      <line x1="3" y1="12" x2="3" y2="12" />
      <line x1="6" y1="9" x2="6" y2="15" />
      <line x1="9" y1="6" x2="9" y2="18" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="15" y1="7" x2="15" y2="17" />
      <line x1="18" y1="10" x2="18" y2="14" />
      <line x1="21" y1="11" x2="21" y2="13" />
    </svg>
  );
}

export function IconShield(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUser(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" />
      <path d="M15.5 5.5a3 3 0 0 1 0 5.8" />
      <path d="M17 14.3c2 .5 3.2 1.9 4 4.7" />
    </svg>
  );
}

export function IconMic(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function IconUpload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4.5 15v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </svg>
  );
}

export function IconFileAudio(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5z" />
      <path d="M14 3.5V8h4.2" />
      <path d="M9.3 15.5v-3.2l3-1v4.6" />
      <circle cx="9" cy="15.7" r="1" />
      <circle cx="12" cy="15.9" r="1" />
    </svg>
  );
}

export function IconCheckCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.3 2.3 4.7-5" />
    </svg>
  );
}

export function IconAlertCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconArrowLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconStopCircle(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlay(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDownload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5v11" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4.5 17v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7h14" />
      <path d="M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
      <path d="M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
      <path d="M10.2 10.5v6" />
      <path d="M13.8 10.5v6" />
    </svg>
  );
}
