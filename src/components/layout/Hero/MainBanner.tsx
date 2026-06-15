'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const BACKGROUNDS = [
  '/img/hero-banners/fondo-oreo.png',
  '/img/hero-banners/fondo-chocolate.png',
  '/img/hero-banners/fondo-galleta.png',
];

export default function MainBanner() {
  const [bg, setBg] = useState(BACKGROUNDS[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBg(BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-paco-dark">
      <Image
        src={bg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <Image
          src="/img/logos/hero-08.svg"
          alt="Paco Merlos"
          width={588}
          height={120}
          priority
          className="h-auto w-[min(588px,92vw)]"
        />
      </div>
    </div>
  );
}
