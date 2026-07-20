'use client';

import { useEffect, useState } from 'react';
import CtaButton from '@/components/ui/Button';
import EmailInput from '@/components/ui/Footer/EmailInput';

/**
 * Botón "¡Avísame!" de la holding page: abre un modal con el formulario de
 * captación de email (`EmailInput`). En la holding page no hay footer al que
 * hacer scroll, así que el CTA abre el formulario en vez de navegar a un ancla.
 *
 * Reutiliza el estilo del modal de `LaunchPopup` (backdrop translúcido + tarjeta
 * crema) y el `EmailInput` del footer con su lógica de validación, honeypot y
 * checkbox de consentimiento RGPD. `launched={false}` → copy de pre-lanzamiento
 * y alta en la lista de lanzamiento vía `/api/notify`.
 */
export default function NotifyCta() {
  const [open, setOpen] = useState(false);

  // Bloquea el scroll del body mientras el modal está abierto + cierre con Escape.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <CtaButton label="¡Avísame!" onClick={() => setOpen(true)} />

      {open && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notify-modal-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-paco-dark/60 backdrop-blur-sm"
          />

          {/* Tarjeta */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/5 bg-paco-cream shadow-[0_1rem_3rem_rgba(0,0,0,0.28)]">
            {/* Botón cerrar */}
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
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

            {/* Cuerpo */}
            <div className="flex flex-col items-center gap-4 px-8 pb-9 pt-10 text-center">
              <h2
                id="notify-modal-title"
                className="font-chunko text-3xl uppercase leading-none text-paco-orange"
              >
                ¡Avísame!
              </h2>
              <p className="font-now text-base leading-relaxed text-paco-dark/70">
                Déjanos tu email y serás el primero en saber cuándo llegan los
                paquitos.
              </p>
              <EmailInput launched={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
