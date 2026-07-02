'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Envoltura `sticky` del hero. El carrusel queda pinned en `top:0` mientras el
 * resto de secciones (con fondo propio y mayor z-index) scrollean por encima.
 *
 * Problema que resuelve: al ser sticky dentro de un `relative` que abarca toda
 * la página, el hero permanece pintado detrás de TODO el contenido aunque ya no
 * se vea, y su autoplay sigue mutando el `transform` → repintados constantes,
 * bleed en los bordes y jank (sobre todo en iOS).
 *
 * Solución: un sentinel marca el final del hero en el flujo. En cuanto sube por
 * encima del viewport (el contenido ya lo tapa), ocultamos el hero con
 * `visibility:hidden` → deja de pintar. Al volver a bajar, reaparece. El toggle
 * ocurre detrás del contenido, así que es imperceptible.
 */
export default function HeroSticky({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Tapado = el sentinel (final del hero) ha quedado por encima del
        // viewport. Si solo está por debajo (aún no scrolleamos), sigue visible.
        setCovered(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className={`sticky top-0 overflow-hidden ${covered ? 'invisible' : ''}`}>
        {children}
      </div>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
    </>
  );
}
