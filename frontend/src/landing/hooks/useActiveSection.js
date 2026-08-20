import { useEffect, useState } from 'react'

/**
 * Devuelve el id de la sección visible más cercana a la parte superior del
 * viewport. Un único IntersectionObserver cubre todas las secciones para
 * evitar cálculos de posición en cada evento de scroll.
 */
export function useActiveSection(ids, topOffset = 96) {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visible.delete(entry.target.id)
          }
        }

        if (visible.size === 0) return

        // La sección "activa" es la visible cuyo borde superior está más
        // cerca del inicio del viewport.
        let best = ''
        let bestDistance = Number.POSITIVE_INFINITY
        for (const [id, top] of visible) {
          const distance = Math.abs(top - topOffset)
          if (distance < bestDistance) {
            bestDistance = distance
            best = id
          }
        }

        if (best) setActiveId(best)
      },
      { rootMargin: `-${topOffset}px 0px -55% 0px`, threshold: [0, 0.15, 0.5] },
    )

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node) => node !== null)

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [ids, topOffset])

  return activeId
}
