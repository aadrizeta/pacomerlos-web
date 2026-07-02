'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import PaquitoHint from './paquitoHint';
import GalleryArrow from './GalleryArrow';
import type { Paquito } from '@/types/paquitos';

// El paquete core `embla-carousel` es solo dependencia transitiva; derivamos el
// tipo de la API del propio hook para no importarlo directamente.
type EmblaCarouselType = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

const AUTOPLAY_MS = 8000;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

interface PaquitosCarouselProps {
  paquitos: Paquito[];
}

export default function PaquitosCarousel({ paquitos }: PaquitosCarouselProps) {
  const count = paquitos.length;
  const loop = count > 1;

  // draggable (por defecto en Embla) + loop + align: 'center'.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: 'center' });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const setTweenNodes = useCallback((api: EmblaCarouselType) => {
    tweenNodes.current = api
      .slideNodes()
      .map((n) => n.querySelector('.paquito-slide__inner') as HTMLElement);
  }, []);

  // Efecto coverflow: en cada frame de scroll (arrastre, autoplay o scrollTo)
  // calculamos la distancia de cada slide al centro y aplicamos escala + blur +
  // opacidad + desplazamiento hacia el centro. Reproduce la visualización clásica
  // (activa nítida y grande; laterales pequeñas, borrosas y superpuestas detrás),
  // pero ahora sigue al dedo durante el arrastre. Escrito sobre el patrón oficial
  // de Embla para tweens con soporte de loop.
  const tween = useCallback((api: EmblaCarouselType, eventName?: string) => {
    const engine = api.internalEngine();
    const scrollProgress = api.scrollProgress();
    const slidesInView = api.slidesInView();
    const isScroll = eventName === 'scroll';
    const snapCount = api.scrollSnapList().length;

    api.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScroll && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          });
        }

        const node = tweenNodes.current[slideIndex];
        if (!node) return;

        // Distancia con signo en "número de slides" respecto a la activa.
        const dist = diffToTarget * snapCount;
        const d = Math.min(Math.abs(dist), 3);

        // Mapeos calibrados a la visualización previa: activa 1 / vecina 0.73 / lejana 0.45.
        const scale = d <= 1 ? 1 - 0.27 * d : clamp(0.73 - 0.28 * (d - 1), 0.3, 1);
        const opacity = d <= 1 ? 1 - 0.15 * d : clamp(0.85 * (2 - d), 0, 1);
        const blur = d <= 1 ? 6 * d : clamp(6 + 8 * (d - 1), 0, 18);
        // Tira de las laterales hacia el centro como % del ancho de la propia slide
        // (consistente en cualquier viewport, a diferencia de vw): ~18% deja una
        // ligera superposición bajo la central sin amontonarlas.
        const tx = -dist * 18;

        node.style.transform = `translateX(${tx}%) scale(${scale})`;
        node.style.opacity = `${opacity}`;
        node.style.filter = blur ? `blur(${blur}px)` : 'none';
        node.style.zIndex = `${Math.round(100 - d * 10)}`;
      });
    });
  }, []);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!emblaApi || !loop || prefersReducedMotion()) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
  }, [emblaApi, loop]);

  const goTo = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
      startAutoplay();
    },
    [emblaApi, startAutoplay],
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    startAutoplay();
  }, [emblaApi, startAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    tween(emblaApi);

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onScroll = () => tween(emblaApi, 'scroll');
    const onReInit = () => {
      setTweenNodes(emblaApi);
      onSelect();
      tween(emblaApi);
    };
    // Autoplay: no avanza mientras pausedRef sea true (hover, arrastre o pestaña oculta).
    const onPointerDown = () => {
      pausedRef.current = true;
    };
    const onPointerUp = () => {
      pausedRef.current = false;
    };
    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };

    onSelect();
    startAutoplay();

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onReInit);
    emblaApi.on('scroll', onScroll);
    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onReInit);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [emblaApi, startAutoplay, tween, setTweenNodes]);

  if (count === 0) return null;

  const currentPaquito = paquitos[selectedIndex] ?? paquitos[0];

  return (
    <div className="w-full">
      <div
        className="paquito-carousel"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        <div className="paquito-stage" ref={emblaRef} aria-roledescription="carrusel">
          <div className="paquito-track">
            {paquitos.map((paquito, i) => (
              <div
                key={paquito.id}
                className="paquito-slide"
                aria-roledescription="slide"
                aria-hidden={i !== selectedIndex}
                aria-label={`${i + 1} de ${count}`}
              >
                <div className="paquito-slide__inner">
                  <PaquitoHint paquito={paquito} active={i === selectedIndex} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p
        className="font-chunko text-2xl uppercase tracking-wider text-center text-paco-orange md:text-3xl mt-4"
        style={currentPaquito.primary_color ? { color: currentPaquito.primary_color } : undefined}
      >
        {currentPaquito.name}
      </p>

      {count > 1 && (
        <span className="flex items-center justify-center gap-6 lg:gap-8 mt-4">
          <button type="button" onClick={scrollPrev} aria-label="Paquito anterior">
            <GalleryArrow
              direction="prev"
              color={currentPaquito.primary_color ?? undefined}
              className="h-6 w-6 text-paco-orange md:h-7.5 md:w-7.5 cursor-pointer"
            />
          </button>

          <span className="flex gap-1.5 md:gap-2">
            {paquitos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al paquito ${i + 1}`}
                aria-current={i === selectedIndex}
                className={`hero-dot h-2 md:h-2.5 hover:opacity-100 ${i === selectedIndex ? 'bg-paco-orange-dark w-6 opacity-100' : 'bg-paco-orange opacity-60'}`}
                style={currentPaquito.primary_color ? { backgroundColor: currentPaquito.primary_color } : undefined}
              />
            ))}
          </span>

          <button type="button" onClick={scrollNext} aria-label="Paquito siguiente">
            <GalleryArrow
              direction="next"
              color={currentPaquito.primary_color ?? undefined}
              className="h-6 w-6 text-paco-orange md:h-7.5 md:w-7.5 cursor-pointer"
            />
          </button>
        </span>
      )}

    </div>
  );
}
