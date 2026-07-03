'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const MARGIN = 8; // px de separación con el icono y con los bordes del viewport

interface TooltipProps {
  /** Texto del tooltip. */
  label: string;
  /** Elemento disparador (p. ej. el icono). */
  children: ReactNode;
  /** Clases del wrapper disparador. Por defecto inline-flex para no romper layout. */
  className?: string;
}

/**
 * Tooltip renderizado en un PORTAL a `<body>` con posición `fixed`. Al vivir fuera
 * de la jerarquía del disparador, NINGÚN `overflow-hidden` ancestro lo recorta
 * (el caso que motivó esto: el `overflow-hidden` de `[data-stack-card]` en
 * `StackedCards`, que cortaba el tooltip de los alérgenos pegados al borde).
 *
 * - Se centra sobre el disparador y se ACOTA al ancho del viewport, de modo que un
 *   icono en el borde no empuja el tooltip fuera de pantalla.
 * - Hace flip vertical (se coloca debajo) si no cabe encima.
 * - Se muestra en hover y en focus (accesible por teclado) y se anuncia con
 *   `aria-describedby`.
 */
export default function Tooltip({ label, children, className = '' }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const id = useId();

  // Tras montar el tooltip ya podemos medir su tamaño real y colocarlo: centrado
  // sobre el icono, acotado al viewport y con flip vertical si no cabe arriba.
  useLayoutEffect(() => {
    if (!anchor || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;

    let left = anchor.left + anchor.width / 2 - tip.width / 2;
    left = Math.max(MARGIN, Math.min(left, vw - tip.width - MARGIN));

    let top = anchor.top - tip.height - MARGIN;
    if (top < MARGIN) top = anchor.bottom + MARGIN; // no cabe arriba → debajo

    setCoords({ top, left });
  }, [anchor]);

  const show = () => {
    if (triggerRef.current) setAnchor(triggerRef.current.getBoundingClientRect());
  };
  const hide = () => {
    setAnchor(null);
    setCoords(null);
  };

  return (
    <span
      ref={triggerRef}
      className={className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      aria-describedby={anchor ? id : undefined}
    >
      {children}
      {anchor &&
        createPortal(
          <span
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              // Antes de medir (coords === null) se pinta invisible (opacity-0),
              // así que la posición provisional no llega a verse.
              top: coords?.top ?? anchor.top,
              left: coords?.left ?? anchor.left,
            }}
            className={`pointer-events-none z-[100] whitespace-nowrap rounded-md bg-paco-dark px-2 py-1 text-base text-paco-cream shadow-lg transition-opacity duration-150 ${
              coords ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {label}
          </span>,
          document.body
        )}
    </span>
  );
}
