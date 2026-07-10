'use client';
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const AUTOPLAY_MS = 8000;

interface HeroCarouselProps {
  children: ReactNode;
}

export default function HeroCarousel({ children }: HeroCarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const loop = count > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!emblaApi || !loop) return;
    timerRef.current = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
  }, [emblaApi, loop]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const stopAutoplay = () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };

    onSelect();
    startAutoplay();

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', startAutoplay);

    return () => {
      stopAutoplay();
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi, startAutoplay]);

  const goTo = useCallback(
    (i: number) => {
      emblaApi?.scrollTo(i);
      startAutoplay();
    },
    [emblaApi, startAutoplay],
  );

  return (
    <section
      className="relative h-screen w-full overflow-hidden touch-pan-y select-none"
      aria-roledescription="carrusel"
      ref={emblaRef}
    >
      <div className="flex h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="h-full w-full shrink-0"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={i !== selectedIndex}
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir al banner ${i + 1}`}
              aria-current={i === selectedIndex}
              className={`hero-dot hover:bg-paco-purple-dark ${i === selectedIndex ? 'w-6 bg-paco-purple-dark' : 'bg-paco-purple/60'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
