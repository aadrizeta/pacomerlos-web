'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'idle' | 'loading' | 'success' | 'error';
type Phase = 'idle' | 'submitting' | 'revealing';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function EmailInput() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot anti-bots
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (status === 'loading') return;

    if (!consent) {
      setConsentError(true);
      return;
    }

    setConsentError(false);
    setStatus('loading');
    setMessage('');
    setPhase('submitting');

    // Garantiza al menos 1.1s de animación aunque la API responda antes.
    const minAnim = wait(1100);

    let nextStatus: Status = 'success';
    let nextMessage = '';

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const data: { error?: string; alreadySubscribed?: boolean } =
        await res.json();
      if (!res.ok) throw new Error(data.error ?? 'No se pudo completar.');

      nextMessage = data.alreadySubscribed
        ? 'Ya estabas en la lista 😊'
        : '¡Te avisaremos del lanzamiento!';
    } catch (err) {
      nextStatus = 'error';
      nextMessage = err instanceof Error ? err.message : 'Algo salió mal.';
    }

    await minAnim;
    setStatus(nextStatus);
    setMessage(nextMessage);
    setPhase('revealing');

    const resetMs = nextStatus === 'success' ? 2600 : 3500;
    if (nextStatus === 'success') setEmail('');
    setTimeout(() => {
      setPhase('idle');
      setStatus('idle');
      setMessage('');
    }, resetMs);
  }

  const busy = phase !== 'idle';

  return (
    <div className="flex w-full flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="sf-bar"
        aria-busy={status === 'loading'}
      >
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          aria-label="Correo electrónico"
          className={['sf-input', phase === 'revealing' && 'sf-input-active']
            .filter(Boolean)
            .join(' ')}
        />

        <div className="sf-honeypot" aria-hidden="true">
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
          className={['sf-curtain', busy && 'sf-curtain-active']
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />

        <span
          className={[
            'sf-result',
            status === 'error' && 'sf-result-error',
            phase === 'revealing' && 'sf-result-active',
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
          disabled={busy}
          style={{ color: consent ? undefined : 'rgba(255,255,255,0.3)' }}
          className={['sf-button', busy && 'sf-button-active']
            .filter(Boolean)
            .join(' ')}
        >
          Enviar
        </button>
      </form>

      <label className="mx-auto flex max-w-125 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentError(false);
          }}
          className="cursor-pointer accent-paco-purple"
        />
        <span>
          He leído y acepto la{' '}
          <Link
            href="/privacidad"
            className="underline hover:text-paco-purple"
          >
            política de privacidad
          </Link>
        </span>
      </label>

      {consentError && (
        <p className="text-xs text-[#e74c3c]" role="alert">
          Debes aceptar la política de privacidad para continuar.
        </p>
      )}
    </div>
  );
}
