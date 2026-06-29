'use client';

import { useEffect, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import Panel from './Panel';
import { assetUrl } from '@/lib/directus/assets';

/**
 * Contenido de cada panel. `bgVideo` se sirve desde Directus (edge-cached por
 * Cloudflare; lazy en `Panel.tsx` con preload="none"). `bgColor` es el fallback
 * que se ve mientras el vídeo no ha cargado. `poster` (primer frame webp) está
 * pendiente. `backgroundIcon` es el icono decorativo de fondo (marca de agua).
 */
const PANELS = [
  {
    id: 'panel-1',
    label: '01',
    title: 'la masa',
    description: 'Fermentación de 48 horas. Masa madre, harina, agua y tiempo. Sin aditivos, sin atajos. El reposo largo es lo que da a cada pieza su textura única.',
    bgVideo: assetUrl('ee88fb98-34b5-456d-b310-5f1a98fcc563'),
    bgColor: 'var(--paco-purple)',
    backgroundIcon: '/icons/icono-masa.svg',
  },
  {
    id: 'panel-2',
    label: '02',
    title: 'El obrador',
    description: '100% artesanal. Cada pieza moldeada, rellenada y acabada a mano en nuestro propio obrador. Sin automatización, sin intermediarios.',
    bgVideo: assetUrl('ff5e8e0b-54f8-4494-b47a-9632d08398c1'),
    bgColor: 'var(--paco-orange)',
    backgroundIcon: '/icons/icono-obrador.svg',
  },
  {
    id: 'panel-3',
    label: '03',
    title: 'El resultado',
    description: 'Del horno a tus manos. Horneamos en lotes pequeños durante toda la jornada. Sin almacenaje, sin recalentados. Si no está recién hecho, no sale.',
    bgVideo: assetUrl('7a446542-5847-4af1-a334-8a933f5a48f6'),
    bgColor: 'var(--paco-orange)',
    backgroundIcon: '/icons/icono-vitrina.svg',
  },
];

const MOBILE_MQ = '(max-width: 1023px)';

export default function PanelAcordeon() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Solo en móvil/tablet (<1024px) los paneles son interactivos (click/teclado).
  // En escritorio la expansión es exclusivamente por hover (CSS puro).
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => {
      setIsMobile(mq.matches);
      // Al pasar a escritorio reseteamos el estado para que mande el hover limpio.
      if (!mq.matches) setActiveIndex(null);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const toggle = (i: number) =>
    setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section className="relative z-20 w-full bg-paco-cream py-10">

      <Reveal className="mb-5 flex items-center justify-center gap-3.5">
        <span className="h-px w-8 bg-paco-orange" />
        <span className="text-xl font-semibold uppercase tracking-widest text-paco-orange">
          Sin atajos
        </span>
        <span className="h-px w-8 bg-paco-orange" />
      </Reveal>
      <Reveal
        as="h2"
        delay={1}
        className="text-center font-chunko text-5xl uppercase leading-[0.9] text-paco-orange md:text-7xl lg:text-8xl pb-10"
      >
        Del horno <br />a tus manos
      </Reveal>

      <Reveal>
        {/* El padding ultra-wide va en este wrapper (fuera del marco) para que el
            borde del .acc-stage ciña solo los paneles y no enmarque el padding. */}
        <div className="mx-auto w-full max-w-480 min-[120rem]:px-8 min-[160rem]:px-16">
          <div className="acc-stage h-[80vh] w-full overflow-hidden lg:h-[70vh]">
            {PANELS.map((panel, i) => (
              <Panel
                key={panel.id}
                label={panel.label}
                title={panel.title}
                description={panel.description}
                bgVideo={panel.bgVideo}
                bgColor={panel.bgColor}
                backgroundIcon={panel.backgroundIcon}
                active={isMobile && activeIndex === i}
                interactive={isMobile}
                onActivate={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
