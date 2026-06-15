import { type Slide } from '@/components/layout/Hero/CarouselSlide';
import CarouselTest from '@/components/layout/Hero/CarouselTest';
import HeroCarousel from '@/components/layout/Hero/HeroCarousel';
import MainBanner from '@/components/layout/Hero/MainBanner';

export const dynamic = 'force-dynamic';

const SLIDES_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

async function getSlides(): Promise<Slide[]> {
  const statusFilter =
    process.env.NODE_ENV === 'development'
      ? 'filter[status][_in]=draft,published'
      : 'filter[status][_eq]=published';

  try {
    const res = await fetch(
      `${SLIDES_URL}?${statusFilter}&fields=id,sort,is_featured,title,description,button_function,img_mobile,img_tablet,img_desktop`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const { data } = await res.json();
    return data as Slide[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const slides = await getSlides();

  const bySort = (a: Slide, b: Slide) => (a.sort ?? 0) - (b.sort ?? 0);
  const featured = slides.filter(s => s.is_featured).sort(bySort);
  const normal = slides.filter(s => !s.is_featured).sort(bySort);

  return (
    <HeroCarousel>
      {featured.map(slide => (
        <CarouselTest key={slide.id} slide={slide} />
      ))}
      <MainBanner />
      {normal.map(slide => (
        <CarouselTest key={slide.id} slide={slide} />
      ))}
    </HeroCarousel>
  );
}