'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
