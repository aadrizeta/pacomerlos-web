const DIRECTUS_IMG_URL = process.env.NEXT_PUBLIC_DIRECTUS_IMG_URL;

export interface Slide {
  id: number;
  sort: number | null;
  is_featured: boolean;
  title: string;
  description: string | null;
  button_function: string | null;
  img_mobile: string;
  img_tablet: string;
  img_desktop: string;
}

function assetUrl(uuid: string) {
  return `${DIRECTUS_IMG_URL}${uuid}`;
}

export default function CarouselSlide({ slide }: { slide: Slide }) {
  return (
    <div
      className="relative h-full w-full bg-cover bg-center [background-image:var(--slide-bg-mobile)] md:[background-image:var(--slide-bg-tablet)] lg:[background-image:var(--slide-bg-desktop)]"
      style={
        {
          '--slide-bg-mobile': `url('${assetUrl(slide.img_mobile)}')`,
          '--slide-bg-tablet': `url('${assetUrl(slide.img_tablet)}')`,
          '--slide-bg-desktop': `url('${assetUrl(slide.img_desktop)}')`,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end padding-responsive pb-16 text-foreground">
        <h2 className="font-chunko text-4xl uppercase leading-tight md:text-5xl lg:text-6xl">
          {slide.title}
        </h2>
        {slide.description && (
          <p className="mt-3 max-w-lg text-base text-foreground md:text-lg">
            {slide.description}
          </p>
        )}
        {/* {slide.button_function && (
          <a
            href={slide.button_function}
            className="mt-6 inline-block rounded-full bg-paco-orange px-6 py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:bg-paco-orange/85"
          >
            Ver más
          </a>
        )} */}
      </div>
    </div>
  );
}