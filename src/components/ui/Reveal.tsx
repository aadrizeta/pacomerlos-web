'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { observeReveal } from '@/lib/scroll-reveal';

/** Efectos disponibles → clase CSS (ver globals.css, sección SCROLL REVEAL). */
const VARIANT_CLASS = {
  up: 'sr',            // fade + sube
  wipe: 'sr-wipe',     // fade + entra desde la izquierda
  tilt: 'sr-tilt',     // fade + sube + rota +2.5°
  'tilt-neg': 'sr-tilt-neg', // fade + sube + rota -2.5°
  left: 'sr-left',     // fade + entra lateral desde la izquierda
  right: 'sr-right',   // fade + entra lateral desde la derecha
} as const;

export type RevealVariant = keyof typeof VARIANT_CLASS;

interface RevealProps {
  children: ReactNode;
  /** Tipo de efecto. Por defecto `up`. */
  variant?: RevealVariant;
  /** Escalonado (stagger): 1 → 0.1s, 2 → 0.2s, 3 → 0.35s. */
  delay?: 1 | 2 | 3;
  /** Si true, re-anima cada vez que el elemento vuelve a entrar en viewport. */
  repeat?: boolean;
  /** Etiqueta a renderizar (div por defecto). Útil para no romper el layout. */
  as?: ElementType;
  /** Clases extra (de estilo) que se combinan con la animación. */
  className?: string;
}

/**
 * Envoltorio reutilizable para animar la entrada de cualquier elemento al hacer
 * scroll. No sustituye animaciones existentes: solo añade las clases `.sr*`.
 *
 * @example
 * <Reveal variant="left" delay={1}>
 *   <h2>Título</h2>
 * </Reveal>
 */
export default function Reveal({
  children,
  variant = 'up',
  delay,
  repeat = false,
  as: Tag = 'div',
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, repeat);
  }, [repeat]);

  const classes = [
    VARIANT_CLASS[variant],
    delay ? `sr-delay-${delay}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes}>
      {children}
    </Tag>
  );
}
