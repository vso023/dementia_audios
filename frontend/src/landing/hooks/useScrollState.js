import { useEffect, useState } from 'react'

/**
 * `true` en cuanto la página se ha desplazado más de `offset` píxeles.
 * Usa un listener pasivo y se sincroniza con rAF para no forzar layout.
 */
export function useScrollState(offset = 16) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      setScrolled(window.scrollY > offset)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [offset])

  return scrolled
}
