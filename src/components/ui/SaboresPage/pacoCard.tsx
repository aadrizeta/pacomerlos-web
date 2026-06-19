import Image from 'next/image';
import type { Paquito } from '@/types/paquitos';
import { assetUrl } from '@/lib/directus/assets';
import { normalizeAllergens } from '@/lib/allergens';

const IMG_MOBILE = 500;
const IMG_DESKTOP = 800;

interface PacoCardProps {
  paquito: Paquito;
  /** Invierte el orden imagen/texto para el patrón zig-zag */
  reverse?: boolean;
}

export default function PacoCard({ paquito, reverse = false }: PacoCardProps) {
  const accent = paquito.primary_color ?? 'var(--paco-orange)';
  const secondary = paquito.secondary_color ?? 'var(--paco-purple)';

  const allergens = normalizeAllergens(paquito.allergens);
  const traces = normalizeAllergens(paquito.cross_contact);

  return (
    <article
      data-paquito-anchor={paquito.slug}
      className={`scroll-mt-28 flex py-10 flex-col items-center gap-10 ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
    >
      {/* Imagen */}
      <div
        className="w-full md:w-1/2 md:self-stretch flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: secondary }}
      >
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={assetUrl(paquito.image_main, { width: IMG_DESKTOP, format: 'webp', quality: 80 })}
          />
          <img
            src={assetUrl(paquito.image_main, { width: IMG_MOBILE, format: 'webp', quality: 80 })}
            alt={paquito.name}
            width={IMG_MOBILE}
            height={IMG_MOBILE}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-auto w-full object-contain select-none md:h-full md:w-auto"
          />
        </picture>
      </div>

      {/* Texto */}
      <div className="w-full md:w-1/2">
        <h2
          className="font-chunko uppercase text-4xl md:text-5xl lg:text-6xl"
          style={{ color: accent }}
        >
          {paquito.name}
        </h2>

        {paquito.tagline && (
          <p className="mt-2 text-lg md:text-xl" style={{ color: accent }}>
            {paquito.tagline}
          </p>
        )}

        <span className="mt-4 block h-1 w-16 rounded" style={{ backgroundColor: accent }} />

        {paquito.general_description && (
          <p className="mt-5 text-base md:text-lg leading-relaxed">
            {paquito.general_description}
          </p>
        )}

        {paquito.interior_description && (
          <div className="mt-5">
            <h3 className="font-chunko uppercase text-lg md:text-xl" style={{ color: accent }}>
              El interior
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              {paquito.interior_description}
            </p>
          </div>
        )}

        {paquito.topping_description && (
          <div className="mt-5">
            <h3 className="font-chunko uppercase text-lg md:text-xl" style={{ color: accent }}>
              El topping
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              {paquito.topping_description}
            </p>
          </div>
        )}

        {allergens.length > 0 && <AllergenRow title="Alérgenos" items={allergens} />}
        {traces.length > 0 && (
          <AllergenRow title="Puede contener trazas de" items={traces} />
        )}
      </div>
    </article>
  );
}

function AllergenRow({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof normalizeAllergens>;
}) {
  return (
    <div className="mt-6">
      <p className="text-sm uppercase tracking-widest text-black/55">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-4">
        {items.map(({ slug, label, icon }) => (
          <li key={slug} className="group relative flex items-center">
            <Image
              src={icon}
              alt={label}
              title={label}
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-paco-dark px-2 py-1 text-base text-paco-cream opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
