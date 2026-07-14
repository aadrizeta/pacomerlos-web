'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LaunchPopupProps {
  /** Controla la visibilidad desde el padre. Si se omite, el pop-up gestiona
   *  su propio estado y se muestra al montar (útil hasta cablear la lógica). */
  open?: boolean;
  /** Se llama al cerrar (botón, backdrop o Escape). */
  onClose?: () => void;
}

/**
 * Pop-up de aviso "muy pronto": informa de que el producto estará disponible
 * en breve. La lógica de cuándo/ a quién mostrarlo se cableará más adelante;
 * por ahora se muestra al montar y puede cerrarse.
 */
export default function LaunchPopup({ open, onClose }: LaunchPopupProps) {
  // Modo no controlado: si no llega `open`, el componente lleva su propio estado.
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = isControlled ? open : internalOpen;

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
  };

  // Bloquea el scroll del body mientras está abierto + cierre con Escape.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-popup-title"
      aria-describedby="launch-popup-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-paco-dark/60 backdrop-blur-sm"
      />

      {/* Tarjeta */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/5 bg-paco-cream shadow-[0_1rem_3rem_rgba(0,0,0,0.28)]">
        {/* Botón cerrar */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-paco-dark/5 text-paco-dark transition-colors hover:bg-paco-orange hover:text-paco-cream"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Cabecera con acento de marca */}
        <div className="flex flex-col items-center gap-4 bg-paco-orange px-8 pb-6 pt-10 text-center">
          <Image
            src="/img/pacomoji.png"
            alt="Paco Merlos"
            width={110}
            height={110}
            className="h-24 w-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
          />
          <span className="rounded-full bg-paco-cream px-4 py-1.5 font-now text-xs font-bold uppercase tracking-[0.18em] text-paco-orange">
            Muy pronto
          </span>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-col items-center gap-4 px-8 pb-9 pt-7 text-center">
          <h2
            id="launch-popup-title"
            className="font-chunko text-3xl uppercase leading-none text-paco-dark"
          >
            ¡Ya casi están aquí!
          </h2>
          <p
            id="launch-popup-desc"
            className="font-now text-base leading-relaxed text-paco-dark/70"
          >
            Los paquitos están a punto de llegar. Estamos ultimando los últimos
            detalles para que puedas disfrutarlos muy pronto.
          </p>
          <button
            type="button"
            onClick={close}
            className="button mt-2 bg-paco-purple text-paco-cream transition-colors hover:bg-paco-purple-dark"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
