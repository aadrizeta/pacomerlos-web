'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { observeReveal } from '@/lib/scroll-reveal';

/**
 * Sentido del desplazamiento al revelarse (convención tipo AOS): el elemento
 * parte desplazado desde el lado opuesto y viaja hacia este sentido mientras
 * hace fade-in. `up` = surge desde abajo; `left` = surge desde la derecha; etc.
 */
export type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface RevealProps {
  children: ReactNode;
  /** Sentido del desplazamiento al revelarse. Por defecto `up` (surge desde abajo). */
  direction?: RevealDirection;
  /** Distancia recorrida. Número → px; string → valor CSS tal cual (`'2rem'`). Def. `'1.75rem'`. */
  distance?: number | string;
  /** Duración del reveal. Número → segundos; string → valor CSS (`'700ms'`). Def. `'0.7s'`. */
  duration?: number | string;
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
 * Traduce dirección + distancia a los desplazamientos iniciales (`--sr-tx`/`--sr-ty`).
 * `up`/`left` parten en positivo (abajo/derecha) y viajan hacia arriba/izquierda;
 * `down`/`right`, al revés. El reveal siempre lleva el transform a 0 (`.revealed`).
 */
function offsets(direction: RevealDirection, distance: string) {
  const positive = direction === 'up' || direction === 'left';
  const value = `${positive ? '' : '-'}${distance}`;
  const horizontal = direction === 'left' || direction === 'right';
  return {
    '--sr-tx': horizontal ? value : '0px',
    '--sr-ty': horizontal ? '0px' : value,
  };
}

/**
 * Envoltorio reutilizable para animar la entrada de cualquier elemento al hacer
 * scroll (translate + fade-in). La dirección, la distancia y la duración se pasan
 * como CSS custom properties inline; la clase `.sr` (ver globals.css) las lee, con
 * fallback al comportamiento clásico (sube 1.75rem en 0.7s).
 *
 * @example
 * <Reveal direction="left" distance={40} duration={0.9} delay={1}>
 *   <h2>Título</h2>
 * </Reveal>
 */
export default function Reveal({
  children,
  direction = 'up',
  distance = '1.75rem',
  duration = '0.7s',
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

  const dist = typeof distance === 'number' ? `${distance}px` : distance;
  const dur = typeof duration === 'number' ? `${duration}s` : duration;

  const style = {
    ...offsets(direction, dist),
    '--sr-duration': dur,
  } as CSSProperties;

  const classes = ['sr', delay ? `sr-delay-${delay}` : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} style={style}>
      {children}
    </Tag>
  );
}
