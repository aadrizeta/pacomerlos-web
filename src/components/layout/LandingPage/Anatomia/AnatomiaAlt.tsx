'use client';

import { useEffect } from 'react';
import AnatomiaCard from "@/components/ui/LangingPage/anatomiaCard";

const BANDS = [
  {
    kicker: 'Cobertura',
    word: 'Golosa',
    desc: 'Cargada de crema y tus toppings favoritos',
    bgColor: 'var(--paco-cream)',
    img: '/img/paquito-oreo.png',
    imgAlt: 'Cobertura golosa',
    imgWidth: 1890,
    imgHeight: 744,
    textColor: 'var(--paco-orange)',
  },
  {
    kicker: 'Cuerpo',
    word: 'Nube',
    desc: 'Masa madre fermentada 48 h',
    bgColor: 'var(--paco-purple)',
    img: '/img/masa-nube.png',
    imgAlt: 'Masa madre nube',
    imgWidth: 1713,
    imgHeight: 903,
    textColor: 'var(--paco-cream)',
  },
  {
    kicker: 'Rellenos',
    word: 'Únicos',
    desc: 'Crema pastelera artesanal',
    bgColor: 'var(--paco-orange)',
    img: '/img/rellenos.png',
    imgAlt: 'Rellenos únicos',
    imgWidth: 1931,
    imgHeight: 702,
    textColor: 'var(--paco-cream)',
  },
];
export default function AnatomiaAlt() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function ease(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function tick() {
      const viewH = window.innerHeight;
      document.querySelectorAll<HTMLElement>('.anatomia-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const raw = (viewH - rect.top) / (viewH * 0.7);
        const prog = ease(Math.max(0, Math.min(1, raw)));

        const text = card.querySelector<HTMLElement>('.card-text');
        const img = card.querySelector<HTMLElement>('.card-photo img');
        if (text) text.style.transform = `translateY(${(1 - prog) * 18}%)`;
        if (img) img.style.transform = `translateY(${(1 - prog) * 12}%)`;
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, []);

  return (
    <section className="w-full flex flex-col mt-20">
      {BANDS.map((band, i) => (
        <AnatomiaCard
          key={band.word}
          kicker={band.kicker}
          word={band.word}
          desc={band.desc}
          bgColor={band.bgColor}
          img={band.img}
          imgAlt={band.imgAlt}
          imgWidth={band.imgWidth}
          imgHeight={band.imgHeight}
          reverse={i % 2 === 1}
          textColor={band.textColor}
        />
      ))}
    </section>
  );
}