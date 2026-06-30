import type { Metadata } from 'next';
import Link from 'next/link';
import NormaCounter from '@/components/ui/NormaCounter';

export const metadata: Metadata = {
  title: 'Nosotros — Paco Merlos',
  description: 'Repostería moderna con personalidad propia, nacida en Madrid.',
};

export default function AboutUsPage() {
  return (
    <main className="sobre-nosotros">

      {/* ── 1. HERO ── */}
      <section className="abt-intro">
        <h1 className="abt-intro-title">SOMOS<br />PACO MERLOS</h1>
        <p className="abt-intro-body">Repostería artesanal nacida en Madrid con una sola obsesión:<br />hacer el mejor dulce que hayas probado en tu vida.</p>
        <Link href="/sabores" className="abt-intro-cta">Ver los Paquitos →</Link>
      </section>

      <div className="abt-wave" style={{ background: 'var(--paco-cream)' }} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C320,80 640,0 960,45 C1140,72 1320,20 1440,40 L1440,80 L0,80 Z" fill="var(--paco-orange)" />
        </svg>
      </div>

      {/* ── 2. ORIGEN ── */}
      <section className="abt-origen">
        <div className="abt-origen-inner">
          <h2 className="abt-origen-title">NUESTRO<br />ORIGEN</h2>
          <div className="abt-origen-cols">
            <p>Paco Merlos nació de una pregunta sencilla: ¿Quién decidió que un bollo tiene que ser siempre igual de aburrido? Empezamos en Madrid, con un obrador, una receta simple de masa madre y la convicción de que nuestro producto lograría ser algo único.</p>
            <p>No buscábamos competir con nadie; buscábamos crear algo que no existía. El resultado fueron los Paquitos — piezas con nombre propio, personalidad única y una combinación de sabores que no encontrarás en ningún otro sitio.</p>
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
          <h2 className="abt-producto-title">QUÉ ES<br />UN PAQUITO</h2>
          <div className="abt-producto-divider" aria-hidden="true" />
          <p className="abt-producto-statement">No es un cruasán, ni un suizo, ni un donut.<br />Estamos en otra categoría.</p>
          <div className="abt-producto-body">
            <p>Un Paquito es una pieza artesanal de masa madre rellena de crema y cubierta de toppings. Cada uno tiene nombre, personalidad y una combinación de sabores que no encontrarás en ningún otro sitio.</p>
            <p>Decidimos personificarlos y darles nombre propio: los Pacos. Cada uno es único, irreverente, con su propio carácter. No busques comparaciones porque no existen — cuando lo pruebas, lo entiendes.</p>
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
          <h2>HECHO EN<br />OBRADORES<br /><span>REALES</span></h2>
          <div className="abt-respaldo-text">
            <p>Cada Paquito se elabora en obradores artesanos de Madrid. Trabajamos con maestros panaderos y pasteleros locales que comparten nuestro mismo estándar: sin atajos, sin ingredientes industriales, sin excusas. La masa madre fermenta 48 horas, el relleno se prepara cada mañana y el resultado sale directo del horno al mostrador.</p>
            <p>Trabajamos directamente con La Fresería, donde encontrarás nuestros Paquitos en sus establecimientos. Una colaboración entre dos marcas que comparten la misma obsesión: producto real, sin compromisos y con mucho sabor.</p>
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
        <h2>PRUÉBALOS<br />Y ENTIÉNDELO</h2>
        <p>La única forma de entender qué es un Paquito es probarlo.<br />Encuéntralos en nuestros puntos de venta en Madrid<br />o síguenos en Instagram para estar al día de los sabores de temporada.</p>
        <div className="abt-cta-btns">
          <Link href="/#encuentralos" className="btn btn-cream">Dónde encontrarlos</Link>
          <a href="https://www.instagram.com/paco_merlos/" target="_blank" rel="noopener noreferrer" className="btn btn-orange">@paco_merlos</a>
        </div>
      </section>

    </main>
  );
}
