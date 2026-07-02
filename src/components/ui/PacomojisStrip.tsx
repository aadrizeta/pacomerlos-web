'use client';

import { useEffect, useRef } from 'react';

const PACOS = [
  { src: '/img/pacomoji.png',  rot: -6,  left: '5%',  mass: 0.85 },
  { src: '/img/pacomoji1.png', rot:  5,  left: '22%', mass: 1.15 },
  { src: '/img/pacomoji2.png', rot: -4,  left: '38%', mass: 0.75 },
  { src: '/img/pacomoji4.png', rot:  8,  left: '58%', mass: 1.2  },
  { src: '/img/pacomoji1.png', rot: -5,  left: '76%', mass: 0.95 },
  { src: '/img/pacomoji.png',  rot: 10,  left: '92%', mass: 1.05 },
];

export default function PacomojisStrip() {
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const physics = useRef(PACOS.map(() => ({ y: 0, vy: 0 })));
  const impulse = useRef(0);

  useEffect(() => {
    // wheel funciona aunque la página ya no pueda bajar más
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // usuario rueda hacia abajo → lanzamos hacia arriba
        impulse.current -= e.deltaY * 0.5;
      }
    };

    // touch: swipe hacia arriba también lanza
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - e.touches[0].clientY; // positivo = swipe hacia arriba
      if (dy > 0) impulse.current -= dy * 0.4;
      touchStartY = e.touches[0].clientY;
    };

    let raf: number;
    const tick = () => {
      const imp = impulse.current;

      PACOS.forEach((paco, i) => {
        const p = physics.current[i];

        // impulso del wheel repartido según masa
        p.vy += imp / paco.mass;

        // gravedad + spring de vuelta al suelo
        p.vy += -p.y * 0.055;
        p.vy += 0.3;
        p.vy *= 0.87;

        p.y += p.vy;
        if (p.y > 0)    { p.y = 0; p.vy = 0; }
        if (p.y < -150) { p.y = -150; }

        const el = imgRefs.current[i];
        if (el) {
          el.style.transform = `translateY(${p.y.toFixed(1)}px) rotate(${paco.rot}deg)`;
        }
      });

      // el impulso se consume rápido para no acumularse
      impulse.current *= 0.25;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="abt-pacomojis" aria-hidden="true">
      {PACOS.map((paco, i) => (
        <img
          key={i}
          ref={el => { imgRefs.current[i] = el; }}
          src={paco.src}
          className="abt-pacomoji-phys"
          style={{ left: paco.left }}
          alt=""
        />
      ))}
    </div>
  );
}
