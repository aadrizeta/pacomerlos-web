'use client';

import { useEffect, useRef } from 'react';

export interface PanelProps {
  /** Etiqueta de orden: "01" | "02" | "03". */
  label: string;
  title: string;
  description: string;
  /**
   * URL del vídeo de fondo (mp4/webm). Se carga y reproduce SOLO al abrir el
   * panel (lazy): preload="none" + play on demand → cero descarga hasta que el
   * usuario interactúa. Recomendado: vídeo corto, mudo, sin pista de audio.
   */
  bgVideo?: string;
  /** Primer frame (WebP) que pinta al instante mientras el vídeo carga. */
  poster?: string;
  /** Color de fondo / fallback mientras no haya vídeo. */
  bgColor?: string;
  /** Icono decorativo de fondo (URL de SVG/imagen). Marca de agua tras el contenido. */
  backgroundIcon?: string;
  /** Panel expandido. Gobierna móvil/tablet; en desktop manda :hover (CSS). */
  active?: boolean;
  /** true en móvil/tablet (el panel es un botón); false en desktop (solo hover). */
  interactive?: boolean;
  /** Se invoca al activar (click/Enter/Espacio) en modo interactivo. */
  onActivate?: () => void;
}

export default function Panel({
  label,
  title,
  description,
  bgVideo,
  poster,
  bgColor,
  backgroundIcon,
  active = false,
  interactive = false,
  onActivate,
}: PanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => videoRef.current?.play().catch(() => { });
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  // Móvil/tablet: el vídeo se reproduce mientras el panel está activo.
  // En desktop la reproducción la disparan onMouseEnter/Leave (ver abajo).
  useEffect(() => {
    if (!interactive) return;
    if (active) play();
    else stop();
  }, [active, interactive]);

  const controlProps = interactive
    ? {
      role: 'button' as const,
      tabIndex: 0,
      'aria-expanded': active,
      onClick: onActivate,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      },
    }
    : {
      // Desktop: la expansión es CSS (hover); aquí solo sincronizamos el vídeo.
      onMouseEnter: play,
      onMouseLeave: stop,
    };

  // Estructura con hooks semánticos (.acc-panel__*). Todo el diseño por estado
  // (móvil/tablet · escritorio, cerrado · abierto) vive en globals.css.
  // `.active` marca el estado abierto en móvil/tablet; en escritorio manda :hover.
  return (
    <article
      className={`acc-panel${active ? ' active' : ''}`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      {...controlProps}
    >
      {bgVideo && (
        <video
          ref={videoRef}
          className="acc-panel__video"
          src={bgVideo}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
        />
      )}

      <div className="acc-panel__content">
        {backgroundIcon && (
          // SVG decorativo estático: next/image no optimiza SVG y añadiría overhead.
          // Dentro de .acc-panel__content para poder apilarlo con el título en
          // escritorio (flujo flex); en móvil va absolute como marca de agua.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="acc-panel__icon"
            src={backgroundIcon}
            alt=""
            aria-hidden="true"
          />
        )}
        <span className="acc-panel__label">{label}</span>
        <h3 className="acc-panel__title">{title}</h3>
        <div className="acc-panel__desc-wrap">
          <p className="acc-panel__desc">{description}</p>
        </div>
      </div>

      {/* Indicador de dropdown (solo móvil/tablet): chevron en la esquina inf.
          izq. que gira al abrir/cerrar. Decorativo: el <article> ya expone el
          estado vía role=button + aria-expanded. */}
      {interactive && (
        <svg
          className="acc-panel__indicator"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </article>
  );
}
