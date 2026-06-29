'use client';

import { useEffect } from 'react';

const BANDS = [
  {
    modifier: 'anat-band--orange',
    kicker: 'Rellenos',
    word: 'Únicos',
    desc: 'Crema pastelera artesanal',
    img: '/img/rellenos unicos.png',
    imgAlt: 'Rellenos únicos',
    photoFirst: false,
  },
  {
    modifier: 'anat-band--purple',
    kicker: 'Cuerpo',
    word: 'Nube',
    desc: 'Masa madre fermentada 48 h',
    img: '/img/MASA NUBE.png',
    imgAlt: 'Masa madre nube',
    photoFirst: true,
  },
  {
    modifier: 'anat-band--cream',
    kicker: 'Cobertura',
    word: 'Golosa',
    desc: 'Cargada de crema y tus toppings favoritos',
    img: '/img/cobertura_.png 2.png',
    imgAlt: 'Cobertura golosa',
    photoFirst: false,
  },
];

export default function Anatomia() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function ease(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function tick() {
      const viewH = window.innerHeight;
      document.querySelectorAll<HTMLElement>('.anat-band').forEach(band => {
        const rect = band.getBoundingClientRect();
        const raw  = (viewH - rect.top) / (viewH * 0.7);
        const prog = ease(Math.max(0, Math.min(1, raw)));

        const text = band.querySelector<HTMLElement>('.anat-text');
        const img  = band.querySelector<HTMLElement>('.anat-photo img');
        if (text) text.style.transform = `translateY(${(1 - prog) * 110}%)`;
        if (img)  img.style.transform  = `translateY(${(1 - prog) * 100}%)`;
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, []);

  return (
    <section id="anatomia">
      {BANDS.map(({ modifier, kicker, word, desc, img, imgAlt, photoFirst }) => (
        <div key={word} className={`anat-band ${modifier}`}>
          {photoFirst && (
            <div className="anat-photo">
              <img src={img} alt={imgAlt} loading="eager" decoding="async" />
            </div>
          )}
          <div className="anat-text">
            <span className="anat-kicker">{kicker}</span>
            <h3 className="anat-word">{word}</h3>
            <p className="anat-desc">{desc}</p>
          </div>
          {!photoFirst && (
            <div className="anat-photo">
              <img src={img} alt={imgAlt} loading="eager" decoding="async" />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
