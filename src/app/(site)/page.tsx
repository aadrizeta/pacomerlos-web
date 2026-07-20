import type { Metadata } from 'next';
import CarouselSlide from '@/components/layout/LandingPage/Hero/CarouselSlide';
import HeroCarousel from '@/components/layout/LandingPage/Hero/HeroCarousel';
import MainBanner from '@/components/layout/LandingPage/Hero/MainBanner';
import { ConectorTop } from '@/components/ui/LangingPage/conector';
import { getCarouselSlides, getLaunchSettings, getPaquitos } from '@/lib/directus/queries';
import { contentEnv } from '@/lib/directus/status';
import { buildCarouselOrder } from '@/utils/carousel-order';
import PaquitosGalery from '@/components/layout/LandingPage/PaquitoGalery/paquitosGalery';
import Encuentralos from '@/components/layout/LandingPage/Encuentralos/Encuentralos';
import CuentaAtras from '@/components/layout/LandingPage/CuentaAtras/CuentaAtras';
// Desactivado por ahora; se reutilizará en el futuro (ver PanelAcordeon.tsx / Panel.tsx).
// import PanelAcordeon from '@/components/layout/LandingPage/PanelAcordeon/PanelAcordeon';
import { MOCK_STORES } from '@/lib/stores/mock';
import AnatomiaAlt from '@/components/layout/LandingPage/Anatomia/AnatomiaAlt';
import Pacommunity from '@/components/layout/LandingPage/Pacommunity/Pacommunity';
import LaunchPopup from '@/components/ui/LaunchPopup';

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
  const showLocator =
    contentEnv() === 'development' ||
    (await getLaunchSettings()).launch_status === 'launched';

  return (
    <div className="relative">
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
      <ConectorTop />
      {/* Coming soon: la cuenta atrás va arriba, justo tras el hero. */}
      {!showLocator && <CuentaAtras />}
      <PaquitosGalery paquitos={paquitos} />
      <AnatomiaAlt />
      {/* <PanelAcordeon /> */}
      <Pacommunity />
      {/* Lanzado: el mapa de puntos de venta va al final. */}
      {showLocator && <Encuentralos stores={MOCK_STORES} />}
      <LaunchPopup />
    </div>
  );
}
