'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import type { Paquito } from '@/types/paquitos';
import PacoCardMobileAlt from './PacoCardMobileAlt';
import { slugFromHash } from '@/lib/hashSlug';

interface MobileCatalogProps {
  paquitos: Paquito[];
}

/**
 * Lista de cards móviles con comportamiento acordeón: solo una puede estar
 * abierta a la vez. Al abrir una, la que estuviera abierta se cierra.
 *
 * Estado:
 *  - `openSlug === undefined` → aún no hay interacción del usuario; seguimos el
 *    deep-link del hash (`#<slug>`), leído como sistema externo (sin mismatch SSR).
 *  - tras la primera interacción, `openSlug` (string | null) manda.
 */
export default function MobileCatalog({ paquitos }: MobileCatalogProps) {
  const subscribeHash = useCallback((onChange: () => void) => {
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const hashSlug = useSyncExternalStore(
    subscribeHash,
    () => slugFromHash(window.location.hash) || null,
    () => null
  );

  const [openSlug, setOpenSlug] = useState<string | null | undefined>(undefined);
  const activeSlug = openSlug === undefined ? hashSlug : openSlug;

  const toggle = (slug: string) => {
    setOpenSlug((prev) => {
      const current = prev === undefined ? hashSlug : prev;
      // Si ya estaba abierta, se cierra; si no, se abre (y cierra cualquier otra).
      return current === slug ? null : slug;
    });
  };

  return (
    <>
      {paquitos.map((paquito) => (
        <PacoCardMobileAlt
          key={paquito.id}
          paquito={paquito}
          open={activeSlug === paquito.slug}
          onToggle={() => toggle(paquito.slug)}
        />
      ))}
    </>
  );
}
