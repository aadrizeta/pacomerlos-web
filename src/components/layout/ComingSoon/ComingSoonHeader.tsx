import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

/**
 * Cabecera de la holding page (y de las páginas legales mientras el sitio está
 * oculto): logo a la izquierda, redes sociales a la derecha. Diseño minimalista,
 * sin la navegación del sitio principal.
 */

// Redes sociales (mismo asset/estilo que el footer, pero tintadas en oscuro para
// el fondo crema vía `--icon-color`). Reutiliza la clase `.icon-link` de globals.
const SOCIALS = [
  {
    href: 'https://www.instagram.com/paco_merlos/',
    icon: 'icons8-instagram.svg',
    label: 'Instagram de Paco Merlos',
    hover: '#E1306C',
  },
  // {
  //   href: 'https://www.tiktok.com/@paco_merlos',
  //   icon: 'icons8-tik-tok.svg',
  //   label: 'TikTok de Paco Merlos',
  //   hover: '#FE2C55',
  // },
];

export default function ComingSoonHeader() {
  return (
    <header className="relative z-20 w-full mt-5 md:mt-10">
      <div className="padding-responsive flex items-center justify-between">
        <Link href="/" aria-label="Paco Merlos — Inicio">
          <Image
            src="/img/logos/logo-paco-merlos.webp"
            alt="Paco Merlos"
            width={160}
            height={32}
            priority
            className="h-auto w-[min(160px,38vw)]"
          />
        </Link>

        <div className="flex items-center gap-4">
          {SOCIALS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="icon-link size-7! lg:size-8!"
              style={
                {
                  '--icon': `url(/icons/redes/${s.icon})`,
                  '--icon-color': 'var(--paco-dark)',
                  '--hover': s.hover,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </header>
  );
}
