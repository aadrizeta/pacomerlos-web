import type { CSSProperties } from 'react';
import type { CarouselSlide } from '@/types/carousel';
import { slideSources } from '@/lib/directus/carousel-images';

interface CarouselSlideProps {
  slide: CarouselSlide;
  priority?: boolean;
}

export default function CarouselSlide({ slide, priority = false }: CarouselSlideProps) {
  const sources = slideSources(slide);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <picture>
        <source media="(min-width: 1024px)" srcSet={sources.desktop} />
        <source media="(min-width: 768px)" srcSet={sources.tablet} />
        {/* <img> plano (no next/image): assets servidos directos por Cloudflare/Directus,
            sin pasar por /_next/image, y art direction vía <picture> (ver CLAUDE.md). */}
        <img
          src={sources.mobile}
          alt=""
          width={768}
          height={432}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none"
        />
      </picture>
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end padding-responsive pb-20 md:items-center md:justify-center md:pb-0 md:text-center">
        <h2
          className={`font-chunko text-4xl uppercase leading-tight md:text-5xl lg:text-8xl md:max-w-2xl lg:max-w-4xl ${
            slide.title_outline ? 'paco-outline' : 'bp-text-color'
          }`}
          style={
            slide.title_outline
              ? // Contorno activo: relleno paco-cream (default de .paco-outline) +
                // color de contorno resuelto. Sin color de breakpoint (un solo color).
                ({ '--outline-color': slide.title_outline_color } as CSSProperties)
              : ({
                  '--bp-color-mobile': slide.title_color_mobile,
                  '--bp-color-desktop': slide.title_color_desktop,
                } as CSSProperties)
          }
        >
          {slide.title}
        </h2>
        {slide.description && (
          <p
            className="bp-text-color mt-3 max-w-lg text-xl md:text-2xl"
            style={
              {
                '--bp-color-mobile': slide.description_color_mobile,
                '--bp-color-desktop': slide.description_color_desktop,
              } as CSSProperties
            }
          >
            {slide.description}
          </p>
        )}
      </div>
    </div>
  );
}
