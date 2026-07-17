'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { observeReveal } from '@/lib/scroll-reveal';
import pacomoji from '../../../../../public/img/pacomoji.png';
import pacomoji1 from '../../../../../public/img/pacomoji1.png';
import pacomoji2 from '../../../../../public/img/pacomoji2.png';
import pacomoji4 from '../../../../../public/img/pacomoji4.png';

interface Drop {
  img: StaticImageData;
  /** Posición horizontal dentro de la sección. */
  left: string;
  /** Altura de aterrizaje: en torno a la parte media de la sección. */
  top: string;
  /** Rotación en reposo. */
  rot: string;
  /** Techo de tamaño en desktop (px); en móvil escala con el viewport. */
  size: number;
  /** Distancia inicial de caída (desde arriba, fuera de la sección). */
  drop: string;
}

// Dispuestos en anillo ALREDEDOR de la cuenta atrás (arriba, laterales y abajo),
// evitando la banda central donde viven las cajas del contador.
const DROPS: Drop[] = [
  { img: pacomoji, left: '3%', top: '38%', rot: '-10deg', size: 126, drop: '-85vh' }, // izq. medio
  { img: pacomoji1, left: '13%', top: '66%', rot: '8deg', size: 108, drop: '-75vh' }, // inf. izq.
  { img: pacomoji2, left: '22%', top: '12%', rot: '-6deg', size: 117, drop: '-95vh' }, // sup. izq.
  { img: pacomoji1, left: '77%', top: '12%', rot: '-7deg', size: 114, drop: '-90vh' }, // sup. der.
  { img: pacomoji2, left: '90%', top: '38%', rot: '9deg', size: 129, drop: '-78vh' }, // der. medio
  { img: pacomoji4, left: '82%', top: '66%', rot: '-5deg', size: 120, drop: '-88vh' }, // inf. der.
];

/**
 * Capa decorativa: pacomojis que "llueven" desde arriba y aterrizan en la parte
 * media de la sección de cuenta atrás, con un pequeño rebote y un balanceo suave
 * en reposo. Se dispara al entrar la sección en viewport (scroll-reveal) y se
 * re-anima al volver. Puramente decorativa: `aria-hidden` + `pointer-events-none`.
 */
export default function PacomojiRain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, true);
  }, []);

  return (
    <div ref={ref} className="pmrain-layer" aria-hidden="true">
      {DROPS.map((d, i) => (
        <div
          key={i}
          className="pmrain"
          style={
            {
              '--i': i,
              '--rot': d.rot,
              '--pm-size': `${d.size}px`,
              '--drop': d.drop,
              left: d.left,
              top: d.top,
            } as CSSProperties
          }
        >
          <Image src={d.img} alt="" width={d.size} height={d.size} className="pmrain-img" />
        </div>
      ))}
    </div>
  );
}
