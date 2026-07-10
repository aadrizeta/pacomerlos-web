'use client';

import { useEffect, useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import AbtUsSection from '@/components/ui/AboutUs/AbtUsSection';
import AbtUsHero from '@/components/ui/AboutUs/AbtUsHero';

export interface ScrollStagePanelData {
  title: string;
  text1: string;
  text2?: string;
  img: StaticImageData;
  imgAlt: string;
}

interface AbtScrollStageProps {
  bgImage: string;
  bgAlt: string;
  panels: ScrollStagePanelData[];
}

// Zona totalmente visible (mitad de ancho) y zona de fundido más allá de esa zona.
const HOLD_HALF = 0.34;
const FADE = 0.32;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function AbtScrollStage({ bgImage, bgAlt, panels }: AbtScrollStageProps) {
  const stageRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // El último panel (índice = panels.length) no necesita desvanecerse: no hay
  // nada después de él en el stage. Si se incluyera su FADE en el tope de
  // scroll, quedaría un tramo de scroll "muerto" mostrando solo el fondo
  // mientras el panel se desvanece a la nada. Por eso el tope real es solo
  // panels.length + HOLD_HALF: el último panel se queda a opacidad 1 hasta
  // que el stage termina de pinearse.
  const rawMax = panels.length + HOLD_HALF;

  useEffect(() => {
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    if (!stage || !overlay) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;

    function update() {
      const rect = stage!.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = stage!.offsetHeight - vh;
      const progress = clamp(scrollable > 0 ? -rect.top / scrollable : 0, 0, 1);
      const raw = progress * rawMax;

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const dist = raw - i;
        const absDist = Math.abs(dist);

        let opacity: number;
        if (absDist <= HOLD_HALF) opacity = 1;
        else if (absDist <= HOLD_HALF + FADE) opacity = 1 - (absDist - HOLD_HALF) / FADE;
        else opacity = 0;
        opacity = clamp(opacity, 0, 1);

        const travel = reduceMotion ? 0 : -clamp(dist, -1, 1) * vh * 0.85;
        panel.style.opacity = opacity.toFixed(3);
        panel.style.transform = `translateY(${travel.toFixed(1)}px)`;
        panel.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
      });

      // Sombra atenuada sobre el hero, a máxima fuerza en cuanto entra el primer panel.
      overlay!.style.opacity = (0.55 + 0.45 * clamp(raw, 0, 1)).toFixed(3);
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rawMax]);

  return (
    <section ref={stageRef} className="relative" style={{ height: `${rawMax * 100}dvh` }}>
      <div className="sticky top-0 h-dvh overflow-hidden">
        <Image
          src={bgImage}
          alt={bgAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.92) 100%)',
            // Estado inicial = el que `update()` calcula en progress 0 (0.55),
            // para no parpadear a opacidad plena antes de que corra el efecto.
            opacity: 0.55,
          }}
        />

        {/* Hero: primer slot del mismo stage, reutiliza el componente dedicado.
            Estado inicial visible (es el panel activo en progress 0). */}
        <div
          ref={(el) => { panelRefs.current[0] = el; }}
          className="absolute inset-0"
          style={{ opacity: 1 }}
        >
          <AbtUsHero />
        </div>

        {/* Panels de contenido: reutiliza AbtUsSection, con fondo transparente
            para que se vea el bg-image fijo del stage. Estado inicial oculto
            (opacity 0 + sin eventos): en progress 0 solo el hero está visible.
            Sin esto, todos se pintan superpuestos hasta que corre `update()`
            en el useEffect (FOUC). */}
        {panels.map((p, i) => (
          <div
            key={p.title}
            ref={(el) => { panelRefs.current[i + 1] = el; }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: 0, pointerEvents: 'none' }}
          >
            <AbtUsSection
              title={p.title}
              text1={p.text1}
              text2={p.text2}
              img={p.img}
              imgAlt={p.imgAlt}
              bgColor="transparent"
              waveTop={false}
              waveBottom={false}
              reverse={i % 2 === 0}
              outline
              outlineColor={i % 2 === 0 ? 'var(--paco-orange)' : 'var(--paco-purple)'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
