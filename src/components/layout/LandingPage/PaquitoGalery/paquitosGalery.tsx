import Image from 'next/image';
import PaquitosCarousel from '../../../ui/LangingPage/paquitosCarousel';
import Button from '../../../ui/Button';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
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
        <SectionHeader
          kicker="Nuestros Sabores"
          title={['Conoce', 'cada uno']}
        />
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
      <div className="mt-5 flex justify-center">
        <Button
          label="ver todos"
          href="/sabores"
        />
      </div>
    </section>
  );
}
