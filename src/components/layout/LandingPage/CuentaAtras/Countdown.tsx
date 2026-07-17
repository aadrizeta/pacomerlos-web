'use client';

import { useEffect, useState } from 'react';

/**
 * Fecha de lanzamiento: 10 de septiembre a las 00:00 hora de Madrid (CEST, UTC+2).
 * Se fija el offset explícito para que el objetivo sea el mismo instante para
 * todos los visitantes, independientemente de su zona horaria local.
 */
const LAUNCH_DATE = new Date('2026-09-10T00:00:00+02:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Horas' },
  { key: 'minutes', label: 'Minutos' },
  { key: 'seconds', label: 'Segundos' },
];

export default function Countdown() {
  // Inicia en `null` para evitar el desajuste de hidratación: el servidor no
  // conoce la hora del cliente, así que ambos pintan "--" en el primer render.
  // El primer valor real se calcula tras montar (rAF, casi instantáneo) y luego
  // se refresca cada segundo. Ambos setState viven en callbacks asíncronos, así
  // que no disparan renders en cascada (react-hooks/set-state-in-effect).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(computeTimeLeft());
    const raf = requestAnimationFrame(update);
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="mx-auto grid w-fit grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {UNITS.map(({ key, label }) => (
        <div
          key={key}
          className="flex min-w-24 flex-col items-center gap-2 rounded-2xl border border-black/5 bg-paco-cream px-4 py-4 shadow-[0_0.5rem_2rem_rgba(0,0,0,0.12)] md:min-w-28 md:px-6 md:py-6"
        >
          <span
            className="font-chunko text-5xl leading-none tabular-nums text-paco-orange md:text-7xl"
            suppressHydrationWarning
          >
            {timeLeft ? String(timeLeft[key]).padStart(2, '0') : '--'}
          </span>
          <span className="font-now text-xs uppercase tracking-[0.18em] text-paco-dark/60 md:text-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
