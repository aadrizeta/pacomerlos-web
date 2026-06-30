import type { Metadata } from 'next';
import CarouselSlide from '@/components/layout/LandingPage/Hero/CarouselSlide';
import HeroCarousel from '@/components/layout/LandingPage/Hero/HeroCarousel';
import MainBanner from '@/components/layout/LandingPage/Hero/MainBanner';
import { ConectorTop } from '@/components/ui/LangingPage/conector';
import { getCarouselSlides, getLaunchSettings, getPaquitos } from '@/lib/directus/queries';
import { contentEnv } from '@/lib/directus/status';
import { buildCarouselOrder } from '@/utils/carousel-order';
import PaquitosGalery from '@/components/layout/LandingPage/PaquitoGalery/paquitosGalery';
// import ConectorMiddle from '@/components/ui/LangingPage/ConectorMiddle';
import Encuentralos from '@/components/layout/LandingPage/Encuentralos/Encuentralos';
import PanelAcordeon from '@/components/layout/LandingPage/PanelAcordeon/PanelAcordeon';
import { MOCK_STORES } from '@/lib/stores/mock';
import Anatomia from '@/components/layout/LandingPage/Anatomia/Anatomia';
import Pacommunity from '@/components/layout/LandingPage/Pacommunity/Pacommunity';

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

  // Localizador "Encuéntralos": en desarrollo siempre visible (para maquetar/probar);
  // en producción solo cuando el sitio está "launched" (site_settings del CMS). El
  // short-circuit evita pedir site_settings en dev.
  const showLocator =
    contentEnv() === 'development' ||
    (await getLaunchSettings()).launch_status === 'launched';

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
      {/* <ConectorMiddle
        topText="Ni repostería fina, ni postureo"
        bottomText="Nosotros nos manchamos las manos"
        bgColor="var(--paco-orange)"
      /> */}
      <PanelAcordeon />
      {/* Datos provisionales (MOCK_STORES); sustituir por getPuntosVenta() cuando se
          defina el origen en Directus — ver docs/encuentralos-store-locator.md.
          Visibilidad: dev siempre; prod solo si site_settings = "launched". */}
      <Anatomia />
      {showLocator && <Encuentralos stores={MOCK_STORES} />}
      <Pacommunity />
    </div>
  );
}
