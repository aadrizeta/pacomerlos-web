'use client';

import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

export interface CtaButtonProps {
  label: ReactNode;
  /** Destino. Si se omite, el botón no navega (útil para acciones como cerrar un modal). */
  href?: string;
  bgColor?: string;
  textColor?: string;
  /** Color de fondo al pasar el ratón. Si se omite, el fondo no cambia en hover. */
  hoverBgColor?: string;
  external?: boolean;
  /** Acción extra al hacer clic (p. ej. cerrar un popup). Se ejecuta siempre. */
  onClick?: () => void;
  /** Clases adicionales para el botón (márgenes, etc.). */
  className?: string;
}

export default function CtaButton({
  label,
  href,
  bgColor = "var(--paco-orange)",
  textColor = "var(--paco-cream)",
  hoverBgColor,
  external = false,
  onClick,
  className = "",
}: CtaButtonProps) {
  const [hovered, setHovered] = useState(false);

  // Ancla en la misma página (#id): hacemos scroll suave por JS y evitamos el
  // salto nativo. Con preventDefault el hash NO se escribe en la URL (si no,
  // quedaría pegado al navegar entre páginas) y, al ir en el <button> interno,
  // Next.js lee `defaultPrevented` en el <Link> y no navega. El `scroll-margin-top`
  // del destino se respeta también con scrollIntoView.
  const isAnchor = !!href && href.startsWith('#');

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (isAnchor) {
      e.preventDefault();
      const target = document.getElementById(href!.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Pulso de atención tras el scroll suave: reinicia la animación de forma
        // fiable (quitar clase → forzar reflow → volver a añadirla) y la limpia
        // al terminar para poder repetirla en clics sucesivos.
        window.setTimeout(() => {
          target.classList.remove('attn-pulse');
          void target.offsetWidth;
          target.classList.add('attn-pulse');
          target.addEventListener(
            'animationend',
            () => target.classList.remove('attn-pulse'),
            { once: true },
          );
        }, 1200);
      }
    }
    onClick?.();
  };

  const button = (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered && hoverBgColor ? hoverBgColor : bgColor,
        color: textColor,
      }}
      className={`button transition-colors ${className}`.trim()}
    >
      {label}
    </button>
  );

  // Sin href: acción pura (no navega), devolvemos solo el botón.
  if (!href) return button;

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {button}
    </Link>
  );
}
