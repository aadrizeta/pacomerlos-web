import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Countdown from './Countdown';
import PacomojiRain from './PacomojiRain';
import CtaButton from '@/components/ui/Button';

/**
 * Sección de cuenta atrás que sustituye al mapa "Dónde encontrarlos" mientras el
 * sitio está en `coming_soon`. Muestra el tiempo restante hasta el lanzamiento
 * (10 de septiembre) en días/horas/minutos/segundos. Reutiliza el mismo marco de
 * sección (fondo crema + SectionHeader + Reveal) que `Encuentralos`.
 */
export default function CuentaAtras() {
  return (
    <section
      id="cuenta-atras"
      className="relative z-20 overflow-hidden bg-paco-cream px-4 py-10 md:px-8"
    >
      <PacomojiRain />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal
          as="div"
          delay={1}
          distance="2.5rem"
          duration={1.5}
          repeat
          className="flex flex-col items-center gap-2 text-center pb-10"
        >
          <SectionHeader
            kicker="Muy pronto"
            title={['prepárate', 'pacomerlos']}
            kickerColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
            barsColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
          // titleSizeOverride="clamp(2.25rem, 9.4vw, 8rem)"
          />
          <span className="taxt-lg md:text-xl mb-10">Los paquitos aterrizan el <b>10 de septiembre</b></span>
          <CtaButton label="¡Avísame!" href="#newsletter" />
        </Reveal>

        <Reveal delay={3}>
          <Countdown />
        </Reveal>
      </div>
    </section>
  );
}
