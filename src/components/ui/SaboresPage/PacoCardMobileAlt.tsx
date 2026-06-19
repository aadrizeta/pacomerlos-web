'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import type { Paquito } from '@/types/paquitos';
import { assetUrl } from '@/lib/directus/assets';
import { normalizeAllergens } from '@/lib/allergens';

const IMG_SRC = 600;

// useLayoutEffect en cliente, useEffect en SSR (evita el warning de Next).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface PacoCardMobileAltProps {
  paquito: Paquito;
  /** Estado controlado por el padre (acordeón: solo una card abierta a la vez). */
  open: boolean;
  /** Pide al padre alternar esta card. */
  onToggle: () => void;
}

/**
 * Variante de PacoCardMobile SIN zig-zag y CONTROLADA: el estado `open` lo
 * gestiona el padre (MobileCatalog), que garantiza una sola card abierta.
 *
 * La animación FLIP compara la posición/tamaño de la render anterior (`prevRects`)
 * con la actual cuando `open` cambia. Así anima correctamente tanto la card que
 * se abre como la que se cierra al abrir otra (no solo la pulsada), sin depender
 * de capturar medidas en el manejador de click.
 */
export default function PacoCardMobileAlt({
  paquito,
  open,
  onToggle,
}: PacoCardMobileAltProps) {
  const accent = paquito.primary_color ?? 'var(--paco-orange)';
  const secondary = paquito.secondary_color ?? 'var(--paco-purple)';

  const allergens = normalizeAllergens(paquito.allergens);
  const traces = normalizeAllergens(paquito.cross_contact);

  const imgRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const prevOpen = useRef(open);
  const prevRects = useRef<{ img: DOMRect | null; name: DOMRect | null }>({
    img: null,
    name: null,
  });

  useIsomorphicLayoutEffect(() => {
    const last = {
      img: imgRef.current?.getBoundingClientRect() ?? null,
      name: nameRef.current?.getBoundingClientRect() ?? null,
    };

    const changed = prevOpen.current !== open;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (changed && !reduce) {
      flip(imgRef.current, prevRects.current.img, last.img);
      flip(nameRef.current, prevRects.current.name, last.name);
    }

    // Guarda la posición actual como referencia para el próximo cambio.
    prevRects.current = last;
    prevOpen.current = open;
  });

  return (
    <article
      data-paquito-anchor={paquito.slug}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-black/5 bg-paco-cream"
    >
      {/* Cabecera clicable: imagen + nombre. El layout (fila ↔ columna) cambia
          según `open`; la animación de recolocación la hace el FLIP. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`relative flex w-full px-3 py-4 text-left ${open
          ? 'flex-col items-center gap-4'
          : 'items-center gap-4'
          }`}
      >
        <div
          ref={imgRef}
          className={`flex shrink-0 items-center justify-center overflow-hidden ${open ? 'aspect-square w-full rounded-2xl' : 'aspect-square w-24 rounded-xl'
            }`}
          style={{ backgroundColor: secondary }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- assets servidos directos por Cloudflare/Directus, sin pasar por /_next/image (ver CLAUDE.md) */}
          <img
            src={assetUrl(paquito.image_main, {
              width: IMG_SRC,
              format: 'webp',
              quality: 80,
            })}
            alt={paquito.name}
            width={IMG_SRC}
            height={IMG_SRC}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        </div>

        <h2
          ref={nameRef}
          className="font-now font-bold text-2xl uppercase leading-none text-start"
          style={{ color: accent }}
        >
          {paquito.name}
        </h2>

        {/* Control flotante: se mantiene en la esquina en ambos layouts. */}
        <span
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-paco-cream/80 shadow-sm"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'rotate-180' : ''
              }`}
            style={{ color: accent }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* Información desplegable */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-6 text-start">
            {paquito.tagline && (
              <p className="text-lg" style={{ color: accent }}>
                {paquito.tagline}
              </p>
            )}

            <span
              className="mt-3 block h-1 w-16 rounded"
              style={{ backgroundColor: accent }}
            />

            {paquito.general_description && (
              <p className="mt-4 text-base leading-relaxed">
                {paquito.general_description}
              </p>
            )}

            {paquito.interior_description && (
              <div className="mt-4">
                <h3
                  className="font-now font-bold text-xl uppercase"
                  style={{ color: accent }}
                >
                  El interior
                </h3>
                <p className="text-base leading-relaxed">
                  {paquito.interior_description}
                </p>
              </div>
            )}

            {paquito.topping_description && (
              <div className="mt-4">
                <h3
                  className="font-now font-bold text-xl uppercase"
                  style={{ color: accent }}
                >
                  El topping
                </h3>
                <p className="text-base leading-relaxed">
                  {paquito.topping_description}
                </p>
              </div>
            )}

            {allergens.length > 0 && (
              <AllergenRow title="Alérgenos" items={allergens} />
            )}
            {traces.length > 0 && (
              <AllergenRow title="Puede contener trazas de" items={traces} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** FLIP de un elemento desde `first` (posición previa) hasta `last` (actual). */
function flip(el: HTMLElement | null, first: DOMRect | null, last: DOMRect | null) {
  if (!el || !first || !last) return;

  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = last.width ? first.width / last.width : 1;
  const sy = last.height ? first.height / last.height : 1;

  if (
    Math.abs(dx) < 0.5 &&
    Math.abs(dy) < 0.5 &&
    Math.abs(sx - 1) < 0.01 &&
    Math.abs(sy - 1) < 0.01
  ) {
    return;
  }

  // INVERT: lo devolvemos visualmente a su posición/tamaño anterior…
  el.style.transformOrigin = 'top left';
  el.style.transition = 'none';
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  void el.offsetWidth; // fuerza reflow para fijar el estado inicial

  // PLAY: …y animamos hasta la identidad.
  requestAnimationFrame(() => {
    el.style.transition = 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.transform = '';
  });
}

function AllergenRow({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof normalizeAllergens>;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm uppercase tracking-widest text-black/55">{title}</p>
      <ul className="mt-2 flex flex-wrap justify-start gap-3">
        {items.map(({ slug, label, icon }) => (
          <li key={slug} className="flex items-center">
            <Image src={icon} alt={label} title={label} width={36} height={36} className="h-9 w-9" />
          </li>
        ))}
      </ul>
    </div>
  );
}
