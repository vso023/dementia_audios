import { useEffect, useRef, useState } from 'react'

/**
 * Observa un elemento una sola vez y avisa cuando entra en el viewport.
 * Si `IntersectionObserver` no existe, marca el elemento como visible de
 * inmediato para que el contenido nunca quede oculto.
 */
export function useReveal({ threshold = 0.16, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Entrada única: se libera el observador en cuanto se dispara.
            observer.disconnect()
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, isVisible }
}
