import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NormaCounter from '@/components/ui/NormaCounter';
import EmpleadoCard from '@/components/ui/EmpleadoCard';

export const metadata: Metadata = {
  title: 'Nosotros — Paco Merlos',
  description: 'Repostería moderna con personalidad propia, nacida en Madrid.',
};

export default function AboutUsPage() {
  return (
    <main className="sobre-nosotros">

      {/* ── 1. HERO ── */}
      <section className="abt-intro">
        <div className="abt-intro-content">
          <h1 className="paco-outline abt-intro-title">ABOUT<br className="abt-intro-br" /> PACO</h1>
          <p className="abt-intro-pill">¿Quieres saber cómo los hacemos?</p>
        </div>
        <div className="abt-intro-scroll" aria-hidden="true">
          <span className="abt-intro-scroll-label">Baja y te lo contamos</span>
          <svg className="abt-intro-scroll-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4v16M5 13l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── 2. ORIGEN ── */}
      <section className="abt-origen">
        <div className="abt-origen-inner">
          <div className="abt-origen-text">
            <h2 className="abt-origen-title">NUESTROS ORÍGENES</h2>
            <div className="abt-respaldo-divider" />
            <p>Pacomerlos surge de un <span className="abt-origen-highlight">antojo de medianoche</span>, de ese quiero y no puedo a altas horas de la noche.</p>
            <p>Nosotros <span className="abt-origen-highlight">no nos quedamos con las ganas</span>, canalizamos toda esa hambre, gochería y antojo hasta crear el <span className="abt-origen-highlight">postre definitivo</span>.</p>
          </div>
          <div className="abt-origen-img">
            <Image src="/img/paco dibujio.png" alt="Paco Merlos" width={1080} height={1350} className="abt-origen-dibujo" />
          </div>
        </div>
      </section>

      <div className="abt-wave" style={{ background: 'var(--paco-orange)' }} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill="var(--paco-purple)" />
        </svg>
      </div>

      {/* ── 3. EL PRODUCTO ── */}
      <section className="abt-producto abt-producto--purple">
        <div className="abt-producto-inner">
          <div className="abt-producto-img">
            <EmpleadoCard />
          </div>
          <div className="abt-producto-text">
            <h2 className="abt-producto-title">SOMOS<br />OTRO ROLLO</h2>
            <div className="abt-respaldo-divider" />
            <div className="abt-producto-body">
              <p>Ni cruasán, ni suizo, ni donut. Un Paquito es <strong>masa madre artesanal, relleno de crema y toppings brutales.</strong></p>
              <p>No hacemos dulces genéricos: los hemos personificado y les hemos dado vida propia. <strong>Cada uno es único, irreverente y con una personalidad y sabor que no encontrarás en ningún otro sitio.</strong></p>
            </div>
          </div>
        </div>
      </section>

      <div className="abt-wave" style={{ background: 'var(--paco-purple)' }} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill="var(--paco-cream)" />
        </svg>
      </div>

      {/* ── 4. LA NORMA DE TRES — única aparición de los números ── */}
      <section className="abt-norma">
        <NormaCounter />
      </section>

      <div className="abt-wave" style={{ background: 'var(--paco-cream)' }} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill="var(--paco-orange)" />
        </svg>
      </div>

      {/* ── 5. OBRADORES ── */}
      <section className="abt-respaldo abt-respaldo--orange">
        <div className="abt-respaldo-inner">
          <div className="abt-respaldo-foto">
            <Image src="/img/pacodibujo 2.png" alt="Elaboración artesanal" width={1080} height={844} className="abt-respaldo-img" />
          </div>
          <div className="abt-respaldo-content">
            <h2>HECHOS<br />A MANO</h2>
            <div className="abt-respaldo-divider" />
            <div className="abt-respaldo-text">
              <p>Cada Paquito se moldea a mano <strong>en obradores artesanos de Madrid.</strong> Sin procesos industriales, con producto nacional y directo del horno al mostrador.</p>
              <p>Para hacerlo realidad, nos hemos aliado con La Fresería: una colaboración de lo más TOP entre dos marcas que comparten la misma obsesión por el sabor brutal.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="abt-wave" style={{ background: 'var(--paco-orange)' }} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill="var(--paco-purple)" />
        </svg>
      </div>

      {/* ── 6. CTA ── */}
      <section className="abt-cta abt-cta--purple">
        <p className="abt-cta-eyebrow">Créenos o pruébalo</p>
        <h2>UNA MORDIDA<br />LO EXPLICA TODO.</h2>
        <div className="abt-cta-btns">
          <Link href="/#encuentralos" className="btn btn-cream" style={{ color: 'var(--paco-purple)', textTransform: 'uppercase' }}>Dónde encontrarlos</Link>
          <a href="https://www.instagram.com/paco_merlos/" target="_blank" rel="noopener noreferrer" className="btn btn-orange" style={{ textTransform: 'uppercase' }}>@paco_merlos</a>
        </div>
      </section>

      {/* ── 7. PACOMOJIS ── */}
      <div className="abt-pacomojis" aria-hidden="true">
        <div className="abt-pacomoji-wrap" style={{ '--delay': '0s', '--arc': '90px', left: '5%' } as React.CSSProperties}>
          <Image src="/img/pacomoji.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '-8deg' } as React.CSSProperties} alt="" />
        </div>
        <div className="abt-pacomoji-wrap" style={{ '--delay': '0.28s', '--arc': '90px', left: '18%' } as React.CSSProperties}>
          <Image src="/img/pacomoji1.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '5deg' } as React.CSSProperties} alt="" />
        </div>
        <div className="abt-pacomoji-wrap" style={{ '--delay': '0.57s', '--arc': '90px', left: '32%' } as React.CSSProperties}>
          <Image src="/img/pacomoji2.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '-4deg' } as React.CSSProperties} alt="" />
        </div>
        <div className="abt-pacomoji-wrap" style={{ '--delay': '0.85s', '--arc': '90px', left: '55%' } as React.CSSProperties}>
          <Image src="/img/pacomoji4.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '7deg' } as React.CSSProperties} alt="" />
        </div>
        <div className="abt-pacomoji-wrap" style={{ '--delay': '1.13s', '--arc': '90px', left: '72%' } as React.CSSProperties}>
          <Image src="/img/pacomoji1.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '-5deg' } as React.CSSProperties} alt="" />
        </div>
        <div className="abt-pacomoji-wrap" style={{ '--delay': '1.42s', '--arc': '90px', left: '87%' } as React.CSSProperties}>
          <Image src="/img/pacomoji.png" width={120} height={120} className="abt-pacomoji" style={{ '--rot': '10deg' } as React.CSSProperties} alt="" />
        </div>
      </div>

    </main>
  );
}
