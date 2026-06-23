'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import styles from './SubscribeForm.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';
type Phase = 'idle' | 'submitting' | 'revealing';

export interface SubscribeFormProps {
  /** Endpoint al que se hace POST. Por defecto /api/notify */
  endpoint?: string;
  /** Texto del botón */
  buttonLabel?: string;
  /** Placeholder del input */
  placeholder?: string;
  /** Ms que se mantiene el error en pantalla antes de poder reintentar */
  errorResetMs?: number;

  /* ---- tamaños (px) ---- */
  width?: number;
  height?: number;
  radius?: number;
  buttonWidth?: number;

  /* ---- colores (cualquier valor CSS) ---- */
  bg?: string;
  text?: string;
  buttonBg?: string;
  buttonHover?: string;
  buttonText?: string;
  curtainBg?: string;
  successColor?: string;
  errorColor?: string;

  className?: string;
  /** Callback opcional al completar con éxito */
  onSubscribed?: (info: { alreadySubscribed: boolean }) => void;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SubscribeForm({
  endpoint = '/api/notify',
  buttonLabel = 'subscribe',
  placeholder = 'tu@email.com',
  errorResetMs = 3500,
  width,
  height,
  radius,
  buttonWidth,
  bg,
  text,
  buttonBg,
  buttonHover,
  buttonText,
  curtainBg,
  successColor,
  errorColor,
  className,
  onSubscribed,
}: SubscribeFormProps) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot anti-bots
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');

  // Solo sobreescribe las variables que el usuario haya pasado.
  const cssVars: CSSProperties = {
    ...(width != null && { ['--sf-width' as string]: `${width}px` }),
    ...(height != null && { ['--sf-height' as string]: `${height}px` }),
    ...(radius != null && { ['--sf-radius' as string]: `${radius}px` }),
    ...(buttonWidth != null && {
      ['--sf-button-width' as string]: `${buttonWidth}px`,
    }),
    ...(bg && { ['--sf-bg' as string]: bg }),
    ...(text && { ['--sf-text' as string]: text }),
    ...(buttonBg && { ['--sf-button-bg' as string]: buttonBg }),
    ...(buttonHover && { ['--sf-button-hover' as string]: buttonHover }),
    ...(buttonText && { ['--sf-button-text' as string]: buttonText }),
    ...(curtainBg && { ['--sf-curtain-bg' as string]: curtainBg }),
    ...(successColor && { ['--sf-success' as string]: successColor }),
    ...(errorColor && { ['--sf-error' as string]: errorColor }),
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;

    // 1) Arranca la animación: la cortina barre y el botón baja.
    setStatus('loading');
    setMessage('');
    setPhase('submitting');

    // La cortina tarda ~1s en barrer; garantizamos ese mínimo para que
    // la transición no se corte aunque la API responda al instante.
    const minAnim = wait(1100);

    let nextStatus: Status = 'success';
    let nextMessage = '';
    let already = false;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const raw = await res.text();
      let data: { error?: string; alreadySubscribed?: boolean };
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          `Respuesta inesperada (${res.status}). ¿Está arrancado "pnpm dev" y la ruta ${endpoint}?`,
        );
      }
      if (!res.ok) throw new Error(data.error ?? 'No se pudo completar.');

      already = Boolean(data.alreadySubscribed);
      nextMessage = already
        ? 'Ya estabas en la lista 😊'
        : '¡Listo! Te avisaremos del lanzamiento.';
    } catch (err) {
      nextStatus = 'error';
      nextMessage = err instanceof Error ? err.message : 'Algo salió mal.';
    }

    // 2) Espera a que la cortina termine y revela el mensaje:
    //    el input sale por la derecha y el resultado sube a su sitio.
    await minAnim;
    setStatus(nextStatus);
    setMessage(nextMessage);
    setPhase('revealing');

    if (nextStatus === 'success') {
      setEmail('');
      onSubscribed?.({ alreadySubscribed: already });
    } else {
      // En error, reseteamos para que el usuario pueda reintentar.
      setTimeout(() => {
        setPhase('idle');
        setStatus('idle');
        setMessage('');
      }, errorResetMs);
    }
  }

  const busy = phase !== 'idle';

  return (
    <form
      onSubmit={handleSubmit}
      style={cssVars}
      className={[styles.bar, className].filter(Boolean).join(' ')}
      aria-busy={status === 'loading'}
    >
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        autoComplete="email"
        aria-label="Email"
        className={[styles.input, phase === 'revealing' && styles.inputActive]
          .filter(Boolean)
          .join(' ')}
      />

      {/* honeypot: invisible para humanos, lo rellenan los bots */}
      <div className={styles.honeypot} aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <span
        className={[styles.curtain, busy && styles.curtainActive]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />

      <span
        className={[
          styles.result,
          status === 'error' && styles.resultError,
          phase === 'revealing' && styles.resultActive,
        ]
          .filter(Boolean)
          .join(' ')}
        role="status"
        aria-live="polite"
      >
        {message}
      </span>

      <button
        type="submit"
        disabled={status === 'loading'}
        className={[styles.button, busy && styles.buttonActive]
          .filter(Boolean)
          .join(' ')}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
