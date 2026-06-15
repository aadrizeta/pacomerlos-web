import type { Slide } from './CarouselSlide';

const DIRECTUS_IMG_URL = process.env.NEXT_PUBLIC_DIRECTUS_IMG_URL;

function assetUrl(uuid: string) {
  return `${DIRECTUS_IMG_URL}${uuid}`;
}

export default function CarouselTest({ slide }: { slide: Slide }) {
  const mobileUrl = assetUrl(slide.img_mobile);
  const tabletUrl = assetUrl(slide.img_tablet);
  const desktopUrl = assetUrl(slide.img_desktop);

  return (
    <div className="relative h-full w-full" data-mobile={mobileUrl} data-tablet={tabletUrl} data-desktop={desktopUrl}>
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end padding-responsive pb-16">
        <h2 className="font-chunko text-4xl uppercase leading-tight md:text-5xl lg:text-6xl">
          {slide.title}
        </h2>
        {slide.description && (
          <p className="mt-3 max-w-lg text-base md:text-lg">
            {slide.description}
          </p>
        )}
      </div>
    </div>
  );
}