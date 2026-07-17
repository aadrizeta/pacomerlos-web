'use client';

import Link from "next/link";
import type { MouseEvent } from "react";

export interface CtaButtonProps {
  label: string;
  href: string;
  bgColor?: string;
  textColor?: string;
  external?: boolean;
}

export default function CtaButton({
  label,
  href,
  bgColor = "var(--paco-orange)",
  textColor = "var(--paco-cream)",
  external = false
}: CtaButtonProps) {
  // Ancla en la misma página (#id): hacemos scroll suave por JS y evitamos el
  // salto nativo. Con preventDefault el hash NO se escribe en la URL (si no,
  // quedaría pegado al navegar entre páginas). El `scroll-margin-top` del destino
  // se respeta también con scrollIntoView.
  const isAnchor = href.startsWith('#');

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isAnchor) return;
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Pulso de atención tras el scroll suave: reinicia la animación de forma
    // fiable (quitar clase → forzar reflow → volver a añadirla) y la limpia al
    // terminar para poder repetirla en clics sucesivos.
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
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <button style={{ backgroundColor: bgColor, color: textColor }} className="button">{label}</button>
    </Link>
  );
}
