import Reveal from '@/components/ui/Reveal';
import StoreLocator from './StoreLocator';
import type { Store } from '@/types/stores';
import SectionHeader from '@/components/ui/SectionHeader';

interface EncuentralosProps {
  stores: Store[];
}

/**
 * Sección "Encuéntralos" — localizador de puntos de venta.
 *
 * Fondo paco-cream. Encabezado en paco-orange y el resto del texto en paco-dark
 * jugando con los font-weight y opacidades. El mapa/filtro vive en el Client
 * Component `<StoreLocator>`.
 */
export default function Encuentralos({ stores }: EncuentralosProps) {
  return (
    <section
      id="encuentralos"
      className="relative z-20 overflow-hidden bg-paco-cream px-4 py-20 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow */}
        {/* <Reveal className="mb-5 flex items-center justify-center gap-3.5">
          <span className="h-px w-8 bg-paco-orange/30" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-paco-dark/50">
            Puntos de venta
          </span>
          <span className="h-px w-8 bg-paco-orange/30" />
        </Reveal>

        <Reveal
          as="h2"
          delay={1}
          className="text-center font-chunko text-4xl uppercase leading-[0.9] text-paco-orange md:text-7xl lg:text-8xl"
        >
          Dónde
          <br />
          encontrarlos
        </Reveal> */}
        <Reveal
          as="div"
          delay={1}
          distance="2.5rem"
          duration={1.5}
          repeat
        >
          <SectionHeader
            kicker="Puntos de venta"
            title="Dónde encontrarlos"
            kickerColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
            titleSizeOverride="clamp(2.25rem, 9.4vw, 6rem)"
          />
        </Reveal>

        <Reveal
          as="p"
          delay={2}
          className="mx-auto mt-4 mb-12 max-w-md text-center font-medium text-paco-dark/60"
        >
          Localiza el punto de venta más cercano a ti.
        </Reveal>

        <Reveal delay={3}>
          <StoreLocator stores={stores} />
        </Reveal>
      </div>
    </section>
  );
}
