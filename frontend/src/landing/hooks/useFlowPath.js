import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Arma el trazado usando SOLO los huecos (gaps) del grid — nunca el area
 * de una tarjeta, ni siquiera oculta detras de ella. Version anterior
 * conectaba centro-de-icono a centro-de-icono, lo que hacia que buena
 * parte de cada tramo pasara POR DEBAJO del cuerpo de la tarjeta (oculto
 * por su fondo opaco, pero no confinado geometricamente al hueco) — con
 * esquinas redondeadas eso se ve mal (el trazo asoma en el borde curvo,
 * donde el fondo rectangular no llega a cubrir del todo). Ahora cada
 * tramo toca la tarjeta SOLO en su borde exacto, nunca mas alla:
 *
 * - Mismo fila: linea recta desde el borde DERECHO de una tarjeta hasta
 *   el borde IZQUIERDO de la siguiente, a la altura del icono (mismo Y
 *   en toda la fila). Vive enteramente en el hueco de columna.
 * - Cambio de fila: curva en C desde el borde INFERIOR de la tarjeta que
 *   termina la fila hasta el borde SUPERIOR de la que empieza la
 *   siguiente, con manijas verticales (misma X que cada extremo) para
 *   que la curva nunca salga de la banda vacia entre filas. Con una sola
 *   columna, entrada.x === salida.x y la curva colapsa sola en una linea
 *   vertical recta — sigue sin tocar ninguna tarjeta.
 *
 * Como los tramos ya no comparten vertice en el borde de cada tarjeta
 * (el tramo que llega toca el borde izquierdo, el que sale toca el
 * borde derecho — son puntos distintos, con la tarjeta entera entre
 * medio), el trazado resulta en varios sub-trazados independientes
 * dentro del mismo `d` (varios "M"), no una sola polilinea continua. Es
 * SVG valido y la animacion de dibujado (stroke-dasharray/dashoffset vía
 * getTotalLength) sigue funcionando igual sobre el largo total.
 */
function construirTrazado(iconos, cards, columnas) {
  if (iconos.length === 0) return ''

  const tramos = []

  for (let i = 0; i < iconos.length - 1; i++) {
    const filaActual = Math.floor(i / columnas)
    const filaSiguiente = Math.floor((i + 1) / columnas)
    const card0 = cards[i]
    const card1 = cards[i + 1]

    if (filaActual === filaSiguiente) {
      const y = (iconos[i].y + iconos[i + 1].y) / 2
      tramos.push(`M ${card0.right},${y} L ${card1.left},${y}`)
    } else {
      const x0 = iconos[i].x
      const x1 = iconos[i + 1].x
      const y0 = card0.bottom
      const y1 = card1.top
      const gapY = (y0 + y1) / 2
      tramos.push(`M ${x0},${y0} C ${x0},${gapY} ${x1},${gapY} ${x1},${y1}`)
    }
  }

  return tramos.join(' ')
}

export function useFlowPath(count) {
  const wrapRef = useRef(null)
  const gridRef = useRef(null)
  const itemRefs = useRef([]) // icono de cada tarjeta: centro para los nodos, estable al expandir
  const cardRefs = useRef([]) // tarjeta completa: bordes reales para el trazado
  const [points, setPoints] = useState([])
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pathD, setPathD] = useState('')

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    function medir() {
      const wrapRect = wrap.getBoundingClientRect()
      const nuevosIconos = []
      const nuevosCards = []

      for (let i = 0; i < count; i++) {
        const iconEl = itemRefs.current[i]
        const cardEl = cardRefs.current[i]
        if (!iconEl || !cardEl) return

        const ir = iconEl.getBoundingClientRect()
        const cr = cardEl.getBoundingClientRect()

        nuevosIconos.push({
          x: ir.left - wrapRect.left + ir.width / 2,
          y: ir.top - wrapRect.top + ir.height / 2,
        })
        nuevosCards.push({
          left: cr.left - wrapRect.left,
          right: cr.right - wrapRect.left,
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

      setPoints(nuevosIconos)
      setSize({ width: wrapRect.width, height: wrapRect.height })
      setPathD(construirTrazado(nuevosIconos, nuevosCards, columnas))
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
