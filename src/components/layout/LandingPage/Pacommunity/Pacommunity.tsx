'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';

export default function Pacommunity() {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    const board: HTMLDivElement = node;

    let dragging = false;
    let didDrag = false;
    let offsetX = 0;
    let startX = 0;
    let downX = 0;

    function clamp(val: number) {
      const max = 0;
      const min = -(board.scrollWidth - (board.parentElement?.clientWidth ?? board.clientWidth));
      return Math.max(min, Math.min(max, val));
    }

    function centerBoard() {
      const overflow = board.scrollWidth - (board.parentElement?.clientWidth ?? 0);
      if (overflow > 0) {
        offsetX = clamp(-Math.round(overflow / 2) + 150);
        board.style.transform = `translateX(${offsetX}px)`;
      }
    }
    centerBoard();

    function onDown(e: MouseEvent) {
      dragging = true;
      didDrag = false;
      downX = e.clientX;
      startX = e.clientX - offsetX;
      board.classList.add('is-dragging');
    }
    function onMove(e: MouseEvent) {
      if (!dragging) return;
      if (Math.abs(e.clientX - downX) > 15) didDrag = true;
      offsetX = clamp(e.clientX - startX);
      board.style.transform = `translateX(${offsetX}px)`;
    }
    function onUp() {
      dragging = false;
      board.classList.remove('is-dragging');
      if (didDrag) {
        (board as HTMLElement & { dataset: DOMStringMap }).dataset.dragged = '1';
        requestAnimationFrame(() => delete board.dataset.dragged);
      }
    }

    board.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    const emp = document.getElementById('empleadoDelMes');
    if (emp) {
      let straight = false;
      emp.addEventListener('click', () => {
        emp.classList.remove('is-straight', 'is-falling');
        void emp.offsetWidth;
        emp.classList.add(straight ? 'is-falling' : 'is-straight');
        straight = !straight;
      });
    }

    return () => {
      board.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <section>
      <div className="pacomunity-intro">
        <Reveal repeat direction="up" distance="2rem" duration={1.5}>
          <SectionHeader
            kicker="Galería @paco_merlos"
            title="pacommunity"
          />
        </Reveal>
        <Reveal as="div" className="flex flex-col items-center gap-4" repeat direction="up" distance="2rem" duration={1.5}>
          <p className="pacomunity-sub">Etiquétanos y forma parte de nuestro mural.</p>
          <Link href="https://www.instagram.com/paco_merlos/" target="_blank" rel="noopener noreferrer" className="pacomunity-cta-link">@paco_merlos →</Link>
        </Reveal>
      </div>

      <div className="pcom-board" id="pcomBoard" ref={boardRef}>

        <div className="pcom-raw pcom-ticket" style={{ gridColumn: '1/4', gridRow: '1/4' }}>
          <Image src="/img/TICKET PACO TABLÓN.png" alt="" width={1449} height={1856} loading="lazy" decoding="async" />
        </div>

        <div className="pcom-sticker pcom-m pcom-m-s1" style={{ gridColumn: '3', gridRow: '1', alignSelf: 'start', justifySelf: 'start', zIndex: 25, transform: 'rotate(-5deg) translate(-50%, 10%)' }}>
          <Image src="/img/PIN PACOMERLOS NARANJA.png" alt="" width={1712} height={1751} loading="lazy" decoding="async" style={{ width: '220px', maxWidth: '220px', height: 'auto' }} />
        </div>

        <div className="pcom-pin pcom-m pcom-m-a" style={{ ['--r' as string]: '-14deg', gridColumn: '3/5', gridRow: '1/3', height: 'auto', alignSelf: 'start', aspectRatio: '3/4', width: '92%', marginTop: '3rem' }}>
          <Image src="/img/foto tablon gente .png" alt="" width={1080} height={1350} loading="lazy" decoding="async" style={{ flex: 1, height: '100%', objectFit: 'cover' }} />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin pcom-pin--note pcom-m pcom-m-b" style={{ ['--r' as string]: '2.5deg', gridColumn: '5', gridRow: '1/3', alignSelf: 'start', aspectRatio: '1/1' }}>
          <p className="pcom-note-ofertan">GRATIS</p>
          <Image src="/img/pacorotulador.png" alt="" width={849} height={530} className="pcom-note-rotulador" loading="lazy" decoding="async" />
          <p className="pcom-note-text">LLÉVATE UNA CAJA GRATIS CON TU FOTO</p>
        </div>

        <div className="pcom-pin pcom-m pcom-m-c" style={{ ['--r' as string]: '9deg', ['--tx' as string]: '36%', gridColumn: '5', gridRow: '1/4', alignSelf: 'end', justifySelf: 'end', marginBottom: '2rem', width: '115%' }}>
          <Image src="/img/pacogrupal tablón.png" alt="" width={1122} height={1402} loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-destello pcom-m pcom-m-destello" style={{ ['--r' as string]: '20deg', gridColumn: '2', gridRow: '2', alignSelf: 'end', justifySelf: 'end', transform: 'rotate(20deg) translateX(40%)' }}>
          <Image src="/img/destello naranja.png" alt="" width={1080} height={1350} loading="lazy" decoding="async" style={{ width: '160%', maxWidth: '340px', height: 'auto' }} />
        </div>

        <div className="pcom-raw pcom-m" id="empleadoDelMes" style={{ ['--r' as string]: '-5deg', gridColumn: '6/9', gridRow: '1/4', width: '68%', justifySelf: 'center' }}>
          <Image src="/img/empleado del mes tablon.png" alt="Empleado del mes" width={1034} height={1199} loading="lazy" decoding="async" />
        </div>

        <div className="pcom-pin pcom-m pcom-m-d" style={{ ['--r' as string]: '8deg', ['--tx' as string]: '-18%', gridColumn: '9/11', gridRow: '1/3' }}>
          <Image src="/img/foto bollo tablón.jpg" alt="" width={736} height={1104} loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin pcom-m pcom-m-mordisco" style={{ ['--r' as string]: '4deg', gridColumn: '11', gridRow: '1', alignSelf: 'center', width: '75%', justifySelf: 'center' }}>
          <Image src="/img/mordisco tablón.png" alt="" width={441} height={571} loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-sticker pcom-m pcom-m-s2" style={{ gridColumn: '10', gridRow: '1', alignSelf: 'start', justifySelf: 'start', transform: 'rotate(-12deg) translateX(22%)' }}>
          <Image src="/img/PIN PACOMERLOS MORADO.png" alt="" width={1712} height={1751} style={{ width: '230px', maxWidth: '230px', height: 'auto' }} />
        </div>

        <div className="pcom-pin" style={{ ['--r' as string]: '-8deg', gridColumn: '11', gridRow: '2', alignSelf: 'center', width: '75%', justifySelf: 'center' }}>
          <Image src="/img/post2.jpg" alt="" width={1080} height={1350} loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin" style={{ ['--r' as string]: '7deg', gridColumn: '11', gridRow: '3', alignSelf: 'center', width: '75%', justifySelf: 'center' }}>
          <Image src="/img/pacogrupal tablón.png" alt="" width={1122} height={1402} loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-destello" style={{ ['--r' as string]: '-18deg', gridColumn: '10', gridRow: '3' }}>
          <Image src="/img/destello naranja.png" alt="" width={1080} height={1350} loading="lazy" decoding="async" />
        </div>

        <div className="pcom-sticker pcom-m pcom-m-pegata" style={{ ['--r' as string]: '-10deg', gridColumn: '3/5', gridRow: '3', alignSelf: 'end', justifySelf: 'end', transform: 'rotate(-10deg) translate(40%, 25%)' }}>
          <Image src="/img/PEGATA PACO naranja.png" alt="" width={2560} height={1429} loading="lazy" decoding="async" style={{ width: '420%', maxWidth: '760px', height: 'auto' }} />
        </div>

        <div className="pcom-sticker" style={{ ['--r' as string]: '6deg', gridColumn: '9', gridRow: '3' }}>
          <Image src="/img/PEGATA PACO.png" alt="" width={2560} height={1429} loading="lazy" decoding="async" style={{ width: '300%', maxWidth: '560px', height: 'auto' }} />
        </div>

      </div>
    </section>
  );
}
