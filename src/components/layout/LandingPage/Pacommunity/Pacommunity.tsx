'use client';

import { useEffect, useRef } from 'react';

export default function Pacommunity() {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    const board: HTMLDivElement = node;

    let dragging = false;
    let didDrag  = false;
    let offsetX  = 0;
    let startX   = 0;
    let downX    = 0;

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
      didDrag  = false;
      downX    = e.clientX;
      startX   = e.clientX - offsetX;
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
    <section id="social">
      <div className="pacomunity-intro">
        <div className="pacomunity-eyebrow">
          <span className="pacomunity-eyebrow-line"></span>
          Galería · @paco_merlos
          <span className="pacomunity-eyebrow-line"></span>
        </div>
        <h2 className="pacomunity-title">PACOMMUNITY</h2>
        <p className="pacomunity-sub">Etiquétanos y forma parte de nuestro mural.</p>
        <a href="https://www.instagram.com/paco_merlos/" target="_blank" rel="noopener noreferrer" className="pacomunity-cta-link">@paco_merlos →</a>
      </div>

      <div className="pcom-board" id="pcomBoard" ref={boardRef}>

        <div className="pcom-raw pcom-ticket" style={{ gridColumn:'1/4', gridRow:'1/4' }}>
          <img src="/img/TICKET PACO TABLÓN.png" alt="" loading="lazy" decoding="async" />
        </div>

        <div className="pcom-sticker pcom-m pcom-m-s1" style={{ gridColumn:'3', gridRow:'1', alignSelf:'start', justifySelf:'start', zIndex:25, transform:'rotate(-5deg) translate(-50%, 10%)' }}>
          <img src="/img/PIN PACOMERLOS NARANJA.png" alt="" loading="lazy" decoding="async" style={{ width:'220px', maxWidth:'220px' }} />
        </div>

        <div className="pcom-pin pcom-m pcom-m-a" style={{ ['--r' as string]:'-14deg', gridColumn:'3/5', gridRow:'1/3', height:'auto', alignSelf:'start', aspectRatio:'3/4', width:'92%', marginTop:'3rem' }}>
          <img src="/img/foto tablon gente .png" alt="" loading="lazy" decoding="async" style={{ flex:1, height:'100%', objectFit:'cover' }} />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin pcom-pin--note pcom-m pcom-m-b" style={{ ['--r' as string]:'2.5deg', gridColumn:'5', gridRow:'1/3', alignSelf:'start', aspectRatio:'1/1' }}>
          <p className="pcom-note-ofertan">GRATIS</p>
          <img src="/img/pacorotulador.png" alt="" className="pcom-note-rotulador" loading="lazy" decoding="async" />
          <p className="pcom-note-text">LLÉVATE UNA CAJA GRATIS CON TU FOTO</p>
        </div>

        <div className="pcom-pin pcom-m pcom-m-c" style={{ ['--r' as string]:'9deg', ['--tx' as string]:'36%', gridColumn:'5', gridRow:'1/4', alignSelf:'end', justifySelf:'end', marginBottom:'2rem', width:'115%' }}>
          <img src="/img/pacogrupal tablón.png" alt="" loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-destello pcom-m pcom-m-destello" style={{ ['--r' as string]:'20deg', gridColumn:'2', gridRow:'2', alignSelf:'end', justifySelf:'end', transform:'rotate(20deg) translateX(40%)' }}>
          <img src="/img/destello naranja.png" alt="" loading="lazy" decoding="async" style={{ width:'160%', maxWidth:'340px' }} />
        </div>

        <div className="pcom-raw pcom-m" id="empleadoDelMes" style={{ ['--r' as string]:'-5deg', gridColumn:'6/9', gridRow:'1/4', width:'68%', justifySelf:'center' }}>
          <img src="/img/empleado del mes tablon.png" alt="Empleado del mes" loading="lazy" decoding="async" />
        </div>

        <div className="pcom-pin pcom-m pcom-m-d" style={{ ['--r' as string]:'8deg', ['--tx' as string]:'-18%', gridColumn:'9/11', gridRow:'1/3' }}>
          <img src="/img/foto bollo tablón.jpg" alt="" loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin pcom-m pcom-m-mordisco" style={{ ['--r' as string]:'4deg', gridColumn:'11', gridRow:'1', alignSelf:'center', width:'75%', justifySelf:'center' }}>
          <img src="/img/mordisco tablón.png" alt="" loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-sticker pcom-m pcom-m-s2" style={{ gridColumn:'10', gridRow:'1', alignSelf:'start', justifySelf:'start', transform:'rotate(-12deg) translateX(22%)' }}>
          <img src="/img/PIN PACOMERLOS MORADO.png" alt="" style={{ width:'230px', maxWidth:'230px' }} />
        </div>

        <div className="pcom-pin" style={{ ['--r' as string]:'-8deg', gridColumn:'11', gridRow:'2', alignSelf:'center', width:'75%', justifySelf:'center' }}>
          <img src="/img/post2.jpg" alt="" loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-pin" style={{ ['--r' as string]:'7deg', gridColumn:'11', gridRow:'3', alignSelf:'center', width:'75%', justifySelf:'center' }}>
          <img src="/img/pacogrupal tablón.png" alt="" loading="lazy" decoding="async" />
          <span className="pcom-handle">@paco_merlos</span>
        </div>

        <div className="pcom-destello" style={{ ['--r' as string]:'-18deg', gridColumn:'10', gridRow:'3' }}>
          <img src="/img/destello naranja.png" alt="" loading="lazy" decoding="async" />
        </div>

        <div className="pcom-sticker pcom-m pcom-m-pegata" style={{ ['--r' as string]:'-10deg', gridColumn:'3/5', gridRow:'3', alignSelf:'end', justifySelf:'end', transform:'rotate(-10deg) translate(40%, 25%)' }}>
          <img src="/img/PEGATA PACO naranja.png" alt="" loading="lazy" decoding="async" style={{ width:'420%', maxWidth:'760px' }} />
        </div>

        <div className="pcom-sticker" style={{ ['--r' as string]:'6deg', gridColumn:'9', gridRow:'3' }}>
          <img src="/img/PEGATA PACO.png" alt="" loading="lazy" decoding="async" style={{ width:'300%', maxWidth:'560px' }} />
        </div>

      </div>
    </section>
  );
}
