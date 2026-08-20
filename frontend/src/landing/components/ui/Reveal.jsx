import { useReveal } from '../../hooks/useReveal.js'

/**
 * Envoltura de entrada al hacer scroll. El contenido siempre se renderiza en
 * el DOM: la animación solo cambia opacidad y transform, nunca la presencia.
 */
export function Reveal({ children, from = 'up', delay = 0, as: Tag = 'div', className, style }) {
  const { ref, isVisible } = useReveal()

  return (
    <Tag
      ref={ref}
      className={['reveal', isVisible ? 'is-visible' : '', className].filter(Boolean).join(' ')}
      data-reveal-from={from}
      style={{ ...style, '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
