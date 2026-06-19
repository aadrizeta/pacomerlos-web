import Image from 'next/image';

const BACKGROUNDS = [
  '/img/hero-banners/fondo-oreo.png',
  '/img/hero-banners/fondo-chocolate.png',
  '/img/hero-banners/fondo-galleta.png',
];

const bg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

export default function MainBanner() {

  return (
    <div className="relative h-full w-full overflow-hidden bg-paco-dark">
      <Image
        src={bg}
        alt="Imagen de fondo del banner principal"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <Image
          src="/img/logos/hero-08.svg"
          alt="Paco Merlos"
          width={588}
          height={120}
          priority
          draggable={false}
          className="h-auto w-[min(588px,92vw)] select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
