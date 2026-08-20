/** Secciones con ancla, en el orden en que aparecen en la página. */
export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'analisis', label: 'Qué analiza' },
  { id: 'reporte', label: 'Reporte' },
  { id: 'uso-responsable', label: 'Uso responsable' },
]

export const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

/**
 * Desplaza hasta una sección respetando la altura del navbar sticky y la
 * preferencia de movimiento reducido. Devuelve el foco al destino para que
 * la navegación por teclado continúe en el lugar correcto.
 */
export function scrollToSection(id) {
  const target = document.getElementById(id)
  if (!target) return

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const navHeight = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
    10,
  )
  const offset = (Number.isFinite(navHeight) ? navHeight : 72) + 16

  const top = target.getBoundingClientRect().top + window.scrollY - offset

  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })

  // Mueve el foco sin provocar un segundo salto de scroll.
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
