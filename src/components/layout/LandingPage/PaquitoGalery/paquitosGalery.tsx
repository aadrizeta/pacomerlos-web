import Image from 'next/image';
import PaquitosCarousel from '../../../ui/LangingPage/paquitosCarousel';
import GalleryButton from '../../../ui/LangingPage/galleryButtton';
import Reveal from '@/components/ui/Reveal';
import type { Paquito } from '@/types/paquitos';

interface PaquitosGaleryProps {
  paquitos: Paquito[];
}

export default function PaquitosGalery({ paquitos }: PaquitosGaleryProps) {
  return (
    <section className="relative z-20 flex flex-col justify-center items-center py-5 bg-background">
      <Reveal
        as="div"
        delay={1}
        distance="2.5rem"
        duration={1.5}
        repeat
        className="flex flex-col justify-center items-center"
      >
        <div className="w-full flex justify-center items-center gap-4 opacity-80 text-paco-orange">
          <div className="side-bars" />
          <p className="text-center text-xl uppercase tracking-widest font-now">Nuestros Sabores</p>
          <div className="side-bars" />
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-8xl font-chunko uppercase text-center mt-3 max-w-2xl text-paco-orange">
          Conoce cada uno
        </h2>
        <Image
          src="/icons/flecha-hacia-abajo.svg"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className="h-8 w-8 md:h-10 md:w-10"
        />
      </Reveal>
      <PaquitosCarousel paquitos={paquitos} />
      <GalleryButton />
    </section>
  );
}
