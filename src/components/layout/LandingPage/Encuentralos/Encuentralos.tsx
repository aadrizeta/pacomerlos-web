import Reveal from '@/components/ui/Reveal';
import StoreLocator from './StoreLocator';
import type { Store } from '@/types/stores';
import SectionHeader from '@/components/ui/SectionHeader';

interface EncuentralosProps {
  stores: Store[];
}

export default function Encuentralos({ stores }: EncuentralosProps) {
  return (
    <section
      id="encuentralos"
      className="relative z-20 overflow-hidden bg-paco-cream px-4 py-20 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal
          as="div"
          delay={1}
          distance="2.5rem"
          duration={1.5}
          repeat
          className="flex flex-col items-center gap-2 text-center pb-10"
        >
          <SectionHeader
            kicker="Puntos de venta"
            title={['Dónde', 'encontrarlos']}
            kickerColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
            titleSizeOverride="clamp(2.25rem, 9.4vw, 8rem)"
          />
          <span className='md:text-xl'>Localiza el punto de venta más cercano a ti</span>
        </Reveal>

        {/* <Reveal
          delay={2}
        >
          <span className="">Localiza el punto de venta más cercano a ti.</span>
        </Reveal> */}

        <Reveal delay={3}>
          <StoreLocator stores={stores} />
        </Reveal>
      </div>
    </section>
  );
}
