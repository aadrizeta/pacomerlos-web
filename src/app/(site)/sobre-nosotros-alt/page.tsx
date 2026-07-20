import type { Metadata } from 'next';
// import Image from 'next/image';
import NormaCounter from '@/components/ui/AboutUs/NormaCounter';
import AbtScrollStage from '@/components/ui/AboutUs/AbtScrollStage';
import pacoNevera from '../../../../public/img/paco-nevera.png';
import paquitoDeMes from '../../../../public/img/paquito-de-mes.png';
import pacoDibujoAMano from '../../../../public/img/paco-dibujo-a-mano.png';
import pacomoji from '../../../../public/img/pacomoji.png';
import pacomoji1 from '../../../../public/img/pacomoji1.png';
import pacomoji2 from '../../../../public/img/pacomoji2.png';
import pacomoji4 from '../../../../public/img/pacomoji4.png';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Pacomoji from '@/components/ui/AboutUs/Pacomoji';

export const metadata: Metadata = {
  title: 'Nosotros — Paco Merlos',
  description: 'Repostería moderna con personalidad propia, nacida en Madrid.',
};

const PACOMOJIS = [
  { img: pacomoji, delay: '0s', left: '5%', rot: '-8deg' },
  { img: pacomoji1, delay: '0.28s', left: '18%', rot: '5deg' },
  { img: pacomoji2, delay: '0.57s', left: '32%', rot: '-4deg' },
  { img: pacomoji4, delay: '0.85s', left: '55%', rot: '7deg' },
  { img: pacomoji1, delay: '1.13s', left: '72%', rot: '-5deg' },
  { img: pacomoji, delay: '1.42s', left: '87%', rot: '10deg' },
]

const SECTION_DATA = [
  {
    title: 'NUESTROS ORÍGENES',
    text1: 'Pacomerlos surge de un <b>antojo de medianoche</b>, de ese quiero y no puedo a altas horas de la noche.',
    text2: 'Nosotros <b>no nos quedamos con las ganas</b>, canalizamos toda esa hambre, gochería y antojo hasta crear el <b>postre definitivo</b>.',
    img: pacoNevera,
    imgAlt: 'Paco Merlos',
  },
  {
    title: 'SOMOS OTRO ROLLO',
    text1: 'Ni cruasán, ni suizo, ni donut. Un Paquito es <b>masa madre artesanal, relleno de crema y toppings brutales.</b>',
    text2: 'No hacemos dulces genéricos: los hemos personificado y les hemos dado vida propia. <b>Cada uno es único, irreverente y con una personalidad y sabor que no encontrarás en ningún otro sitio.</b>',
    img: paquitoDeMes,
    imgAlt: 'Paquito del mes',
  },
  {
    title: 'HECHOS A MANO',
    text1: 'Cada Paquito se moldea a mano en <b>obradores artesanos de Madrid</b>. Sin procesos industriales, con producto nacional y directo del horno al mostrador.',
    text2: 'Para hacerlo realidad, nos hemos aliado con La Fresería: una colaboración de lo más TOP entre dos marcas que comparten la misma obsesión por el sabor brutal.',
    img: pacoDibujoAMano,
    imgAlt: 'Elaboración artesanal',
  }
]

export default function AboutUsPage() {
  return (
    <>
      <AbtScrollStage
        bgImage="/img/pacomerlos-about-us-banner.png"
        bgAlt="Paco Merlos preparando paquitos"
        panels={SECTION_DATA}
      />
      <section className="py-20 lg:py30">
        <NormaCounter />
      </section>
      {/* ── 6. CTA ── */}
      <section className="abt-cta">
        <SectionHeader
          kicker="créenos o pruébalos"
          title={['una mordida', 'lo explica todo']}
          titleColor="var(--paco-cream)"
          kickerColor="var(--paco-cream)"
          barsColor="var(--paco-cream)"
        />
        <div className="flex gap-2 md:gap-4 mt-5 justify-center">
          <Button
            label="encuéntralos"
            href="/#encuentralos"
            bgColor="var(--paco-cream)"
            textColor="var(--paco-purple)"
          />
          <Button
            label="@paco_merlos"
            href="https://www.instagram.com/paco_merlos/"
            external={true}
          />
        </div>
      </section>

      {/* ── 7. PACOMOJIS ── */}
      {/* v2: saltan, aterrizan en fila y hacen ola (componente <Pacomoji>). */}
      <div className="pacomoji-row" aria-hidden="true">
        {PACOMOJIS.map((p, i) => (
          <Pacomoji key={i} src={p.img} index={i} left={p.left} rot={p.rot} size={160} repeat />
        ))}
      </div>

      {/* v1 (fallback): parábola en bucle indefinido. Para volver a esta versión,
                descomenta este bloque y elimina el <div className="pacomoji-row"> de arriba.
            <div className="abt-pacomojis" aria-hidden="true">
              {PACOMOJIS.map((p, i) => (
                <div key={i} className="abt-pacomoji-wrap" style={{ '--delay': p.delay, '--arc': '90px', left: p.left } as React.CSSProperties}>
                  <Image src={p.img} width={120} height={120} className="abt-pacomoji" style={{ '--rot': p.rot } as React.CSSProperties} alt="" />
                </div>
              ))}
            </div>
            */}
    </>
  );
}