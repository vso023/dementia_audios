import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Arma el trazado a partir de los puntos (ancla de cada tarjeta, estable
 * aunque la tarjeta se expanda) y los rects de tarjeta completos (para
 * saber donde esta el "hueco" real entre filas). `columnas` viene de leer
 * el grid-template-columns computado, asi que el agrupamiento por fila
 * siempre coincide con el layout real, sea cual sea el breakpoint activo.
 *
 * - Dentro de una misma fila: segmento recto horizontal (mismo Y).
 * - Al cambiar de fila: curva en C con manijas verticales (misma X que el
 *   punto de salida/llegada, Y en el hueco entre el fondo de la tarjeta
 *   que termina la fila y el techo de la que empieza la siguiente) — esto
 *   evita que la linea cruce en diagonal por encima de tarjetas vecinas.
 *   Con una sola columna, salida.x === llegada.x y la curva colapsa sola
 *   en una linea vertical recta.
 */
function construirTrazado(puntos, cardRects, columnas) {
  if (puntos.length === 0) return ''

  let d = `M ${puntos[0].x},${puntos[0].y}`

  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i]
    const p1 = puntos[i + 1]
    const filaActual = Math.floor(i / columnas)
    const filaSiguiente = Math.floor((i + 1) / columnas)

    if (filaActual === filaSiguiente) {
      d += ` L ${p1.x},${p1.y}`
    } else {
      const gapY = (cardRects[i].bottom + cardRects[i + 1].top) / 2
      d += ` C ${p0.x},${gapY} ${p1.x},${gapY} ${p1.x},${p1.y}`
    }
  }

  return d
}

export function useFlowPath(count) {
  const wrapRef = useRef(null)
  const gridRef = useRef(null)
  const itemRefs = useRef([]) // ancla de cada tarjeta (icono): estable al expandir
  const cardRefs = useRef([]) // tarjeta completa: para el hueco entre filas
  const [points, setPoints] = useState([])
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pathD, setPathD] = useState('')

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    function medir() {
      const wrapRect = wrap.getBoundingClientRect()
      const nuevosPuntos = []
      const nuevosCards = []

      for (let i = 0; i < count; i++) {
        const iconEl = itemRefs.current[i]
        const cardEl = cardRefs.current[i]
        if (!iconEl || !cardEl) return

        const ir = iconEl.getBoundingClientRect()
        const cr = cardEl.getBoundingClientRect()

        nuevosPuntos.push({
          x: ir.left - wrapRect.left + ir.width / 2,
          y: ir.top - wrapRect.top + ir.height / 2,
        })
        nuevosCards.push({
          top: cr.top - wrapRect.top,
          bottom: cr.bottom - wrapRect.top,
        })
      }

      let columnas = 1
      if (gridRef.current) {
        const valores = getComputedStyle(gridRef.current)
          .gridTemplateColumns.split(' ')
          .filter(Boolean)
        columnas = valores.length || 1
      }

      setPoints(nuevosPuntos)
      setSize({ width: wrapRect.width, height: wrapRect.height })
      setPathD(construirTrazado(nuevosPuntos, nuevosCards, columnas))
    }

    medir()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', medir)
      return () => window.removeEventListener('resize', medir)
    }

    const observer = new ResizeObserver(medir)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [count])

  return { wrapRef, gridRef, itemRefs, cardRefs, points, size, pathD }
}
