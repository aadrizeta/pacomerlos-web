import Link from 'next/link';
import type { Paquito } from '@/types/paquitos';
import { assetUrl } from '@/lib/directus/assets';

interface PaquitoHintProps {
  paquito: Paquito;
}

export default function PaquitoHint({ paquito }: PaquitoHintProps) {
  return (
    <Link
      href={`/sabores#${paquito.slug}`}
      aria-label={`Ver ${paquito.name} en la página de sabores`}
      draggable={false}
      className="flex w-full items-center justify-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- assets servidos directos por Cloudflare/Directus, sin pasar por /_next/image (ver CLAUDE.md) */}
      <img
        src={assetUrl(paquito.image_main, { width: 600, format: 'webp', quality: 80 })}
        alt={paquito.name}
        width={600}
        height={600}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-auto w-full object-contain select-none"
      />
    </Link>
  );
}
