'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export default function EmpleadoCard() {
  const ref = useRef<HTMLButtonElement>(null);
  const [straight, setStraight] = useState(false);

  useEffect(() => {
    if (!straight) return;
    const timer = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.classList.remove('is-straight', 'is-falling');
      void el.offsetWidth;
      el.classList.add('is-falling');
      setStraight(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [straight]);

  function handleClick() {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('is-straight', 'is-falling');
    void el.offsetWidth;
    el.classList.add(straight ? 'is-falling' : 'is-straight');
    setStraight(s => !s);
  }

  return (
    <div className="abt-empleado-wrap">
      <button
        ref={ref}
        type="button"
        className="abt-empleado"
        aria-label="Enderezar la foto del empleado del mes"
        onClick={handleClick}
      >
        <Image src="/img/empleado del mes tablon.png" alt="Empleado del mes" width={1034} height={1199} />
      </button>
    </div>
  );
}
