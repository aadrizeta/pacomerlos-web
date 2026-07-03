'use client';

import { useRef, useState, useEffect } from 'react';

export default function EmpleadoCard() {
  const ref = useRef<HTMLDivElement>(null);
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
      <div ref={ref} className="abt-empleado" onClick={handleClick}>
        <img src="/img/empleado del mes tablon.png" alt="Empleado del mes" />
      </div>
    </div>
  );
}
