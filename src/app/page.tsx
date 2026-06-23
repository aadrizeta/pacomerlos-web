import type { Metadata } from 'next';
import CarouselSlide from '@/components/layout/LandingPage/Hero/CarouselSlide';
import HeroCarousel from '@/components/layout/LandingPage/Hero/HeroCarousel';
import MainBanner from '@/components/layout/LandingPage/Hero/MainBanner';
import { ConectorTop } from '@/components/ui/LangingPage/conector';
import { getCarouselSlides, getPaquitos } from '@/lib/directus/queries';
import { buildCarouselOrder } from '@/utils/carousel-order';
import PaquitosGalery from '@/components/layout/LandingPage/PaquitoGalery/paquitosGalery';
import ConectorMiddle from '@/components/ui/LangingPage/ConectorMiddle';

export const metadata: Metadata = {
  title: "Paquitos Artesanales en Madrid",
  description: "Paquitos artesanales en Madrid. Hechos a mano con masa madre fermentada 48 h. Descubre dónde encontrarlos.",
  alternates: {
    canonical: "https://pacomerlos.com/",
  },
  openGraph: {
    url: "https://pacomerlos.com/",
    title: "Paquitos Artesanales en Madrid — Paco Merlos",
    description: "Paquitos artesanales hechos a mano con masa madre fermentada 48 h. Descúbrelos en Madrid.",
    images: [{ url: "/img/PACOSJUNTOS.png" }],
  },
};

export const revalidate = 30;

export default async function Home() {
  const [slides, paquitos] = await Promise.all([getCarouselSlides(), getPaquitos()]);
  const { featured, normal } = buildCarouselOrder(slides);

  return (
    <div className="relative">
      <div className="sticky top-0 overflow-hidden">
        <HeroCarousel>
          {featured.map((slide, i) => (
            <CarouselSlide key={slide.id} slide={slide} priority={i === 0} />
          ))}
          <MainBanner />
          {normal.map((slide, i) => (
            <CarouselSlide
              key={slide.id}
              slide={slide}
              priority={featured.length === 0 && i === 0}
            />
          ))}
        </HeroCarousel>
      </div>
      <ConectorTop />
      <PaquitosGalery paquitos={paquitos} />
      <ConectorMiddle
        topText="Ni repostería fina, ni postureo"
        bottomText="Nosotros nos manchamos las manos"
        bgColor="var(--paco-orange)"
      />
    </div>
  );
}
