'use client';

import { useEffect, useRef } from 'react';

const ITEMS = [
  { target: 48, suffix: 'h', title: 'Masa madre', desc: 'Fermentación lenta. Sin prisas, sin atajos. Solo tiempo, técnica y respeto al oficio.' },
  { target: 100, suffix: '%', title: 'Rellenos brutales', desc: 'Combinaciones que rompen esquemas. Se idean y se hacen a diario en el obrador.' },
  { target: 0, suffix: '', title: 'Conservantes', desc: 'Cero aditivos, cero polvos industriales. Producto real para paladares reales.' },
];

const DURATION = 2200;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2.5);
}

export default function NormaCounter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const numsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const animated = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;
        observer.disconnect();

        ITEMS.forEach((item, i) => {
          const el = numsRef.current[i];
          if (!el || item.target === 0) return;

          const start = performance.now();
          function frame(now: number) {
            const t = Math.min((now - start) / DURATION, 1);
            const val = Math.round(easeOut(t) * item.target);
            el!.textContent = val + item.suffix;
            if (t < 1) requestAnimationFrame(frame);
            else el!.textContent = item.target + item.suffix;
          }
          requestAnimationFrame(frame);
        });
      },
      { threshold: 0.25 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="abt-norma-grid padding-responsive" ref={wrapperRef}>
      {ITEMS.map((item, i) => (
        <div key={item.title} className="abt-norma-item">
          <span
            ref={(el) => { numsRef.current[i] = el; }}
          >
            {item.target}{item.suffix}
          </span>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
