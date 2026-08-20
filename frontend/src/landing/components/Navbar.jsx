import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrollState } from '../hooks/useScrollState.js'
import { NAV_ITEMS, SECTION_IDS, scrollToSection } from '../lib/navigation.js'
import { Icon } from './ui/Icon.jsx'
import { Logo } from './ui/Logo.jsx'
import './Navbar.css'

export function Navbar() {
  const scrolled = useScrollState(12)
  const activeId = useActiveSection(SECTION_IDS)
  const [menuOpen, setMenuOpen] = useState(false)

  const menuId = useId()
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const goTo = useCallback((id) => {
    setMenuOpen(false)
    // Espera a que el panel se retire antes de calcular la posición destino.
    window.requestAnimationFrame(() => scrollToSection(id))
  }, [])

  /* Bloqueo de scroll del fondo mientras el panel móvil está abierto.
     Se compensa el ancho de la barra de scroll para evitar saltos de layout. */
  useEffect(() => {
    if (!menuOpen) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [menuOpen])

  /* Cierre con Escape, foco atrapado dentro del panel y regreso del foco
     al botón que lo abrió. */
  useEffect(() => {
    if (!menuOpen) return

    const panel = panelRef.current
    panel?.querySelector('a, button')?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        toggleRef.current?.focus()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const focusables = Array.from(panel.querySelectorAll('a[href], button:not([disabled])'))
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  /* Si la ventana crece hasta el layout de escritorio, el panel sobra. */
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(min-width: 861px)')
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner shell shell--wide">
        <a
          className="navbar__brand"
          href="#inicio"
          onClick={(event) => {
            event.preventDefault()
            goTo('inicio')
          }}
        >
          <Logo />
          <span className="sr-only">Vox Cognita — volver al inicio</span>
        </a>

        <nav className="navbar__nav" aria-label="Navegación principal">
          <ul className="navbar__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`navbar__link${activeId === item.id ? ' is-active' : ''}`}
                  aria-current={activeId === item.id ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    goTo(item.id)
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <Link to="/app" className="vc-btn vc-btn--primary vc-btn--sm navbar__cta">
            Ir a la herramienta
            <Icon name="arrowRight" size={16} />
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="navbar__toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Panel móvil: permanece en el DOM sólo cuando está abierto para que
          el orden de tabulación no incluya enlaces invisibles. */}
      {menuOpen ? (
        <>
          <div className="navbar__scrim" onClick={closeMenu} aria-hidden="true" />
          <div ref={panelRef} id={menuId} className="navbar__panel" role="dialog" aria-modal="true" aria-label="Menú de navegación">
            <nav aria-label="Navegación móvil">
              <ul className="navbar__panel-list">
                {NAV_ITEMS.map((item, index) => (
                  <li key={item.id} style={{ '--i': index }}>
                    <a
                      href={`#${item.id}`}
                      className={`navbar__panel-link${activeId === item.id ? ' is-active' : ''}`}
                      aria-current={activeId === item.id ? 'true' : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        goTo(item.id)
                      }}
                    >
                      <span>{item.label}</span>
                      <Icon name="arrowRight" size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <Link to="/app" className="vc-btn vc-btn--primary navbar__panel-cta" onClick={closeMenu}>
              Ir a la herramienta
              <Icon name="arrowRight" size={17} />
            </Link>

            <p className="navbar__panel-note">
              Proyecto académico. Los resultados no constituyen un diagnóstico médico.
            </p>
          </div>
        </>
      ) : null}
    </header>
  )
}
