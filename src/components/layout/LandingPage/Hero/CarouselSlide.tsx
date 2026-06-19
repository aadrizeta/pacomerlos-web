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
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end padding-responsive pb-16 md:items-center md:justify-center md:pb-0 md:text-center">
        <h2
          className="font-chunko text-4xl uppercase leading-tight md:text-5xl lg:text-8xl md:max-w-2xl lg:max-w-4xl"
          style={{ color: slide.title_color }}
        >
          {slide.title}
        </h2>
        {slide.description && (
          <p
            className="mt-3 max-w-lg text-xl md:text-2xl"
            style={{ color: slide.description_color }}
          >
            {slide.description}
          </p>
        )}
      </div>
    </div>
  );
}
