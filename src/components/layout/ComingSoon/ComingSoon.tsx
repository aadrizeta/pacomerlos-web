import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Countdown from '@/components/layout/LandingPage/CuentaAtras/Countdown';
import PacomojiRain, {
  type Drop,
  pacomoji,
  pacomoji1,
  pacomoji2,
  pacomoji4,
} from '@/components/layout/LandingPage/CuentaAtras/PacomojiRain';
import NotifyCta from './NotifyCta';

/**
 * Contenido central de la holding page que sustituye a TODO el sitio mientras
 * `launch_status = coming_soon` en producción (ver gate en `(site)/layout.tsx`).
 * Se revela la web completa el día del lanzamiento (`launch_status = launched`).
 *
 * La cabecera y el pie los aporta `HoldingLayout` (compartidos con las páginas
 * legales); aquí solo va el bloque central: pacomojis + SectionHeader + contador
 * + CTA de captación de email (`NotifyCta` → `EmailInput`, alta en Listmonk vía
 * `/api/notify`).
 */

// Disposición compacta para la holding page: los pacomojis se agrupan en una
// banda más estrecha (más juntos entre sí) y cercana al contador, flanqueándolo
// por izquierda y derecha en vez de repartirse por todo el borde de la pantalla.
const COMPACT_DROPS: Drop[] = [
  { img: pacomoji4, left: '16%', top: '34%', rot: '7deg', size: 112, drop: '-96vh' }, // extra sup. izq.
  { img: pacomoji2, left: '20%', top: '48%', rot: '-6deg', size: 117, drop: '-90vh' }, // sup. izq.
  { img: pacomoji, left: '12%', top: '62%', rot: '-10deg', size: 126, drop: '-82vh' }, // med. izq.
  { img: pacomoji1, left: '24%', top: '74%', rot: '8deg', size: 108, drop: '-76vh' }, // inf. izq.
  { img: pacomoji, left: '84%', top: '34%', rot: '-8deg', size: 112, drop: '-94vh' }, // extra sup. der.
  { img: pacomoji1, left: '80%', top: '48%', rot: '-7deg', size: 114, drop: '-88vh' }, // sup. der.
  { img: pacomoji2, left: '88%', top: '62%', rot: '9deg', size: 129, drop: '-80vh' }, // med. der.
  { img: pacomoji4, left: '76%', top: '74%', rot: '-5deg', size: 120, drop: '-84vh' }, // inf. der.
];

export default function ComingSoon() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-8 text-center md:px-8">
      <PacomojiRain drops={COMPACT_DROPS} className="pmrain-holding" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <Reveal
          as="div"
          delay={1}
          distance="2.5rem"
          duration={1.5}
          className="flex flex-col items-center gap-2"
        >
          <SectionHeader
            kicker="Muy pronto"
            title={['prepárate', 'pacomerlos']}
            kickerColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
            barsColor="color-mix(in srgb, var(--paco-dark) 50%, transparent)"
          />
          <span className="text-lg md:text-xl mt-4 mb-8">
            Los paquitos aterrizan el <b>10 de septiembre</b>
          </span>
          <NotifyCta />
        </Reveal>

        <Reveal delay={3}>
          <Countdown />
        </Reveal>
      </div>
    </div>
  );
}
