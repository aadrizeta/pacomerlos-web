'use client';

import { useEffect } from 'react';
import { slugFromHash } from '@/lib/hashSlug';

const SETTLE_MS = 1500;
const REALIGN_DEBOUNCE_MS = 120;

/**
 * Desplaza hasta el paquito indicado en el hash (`#<slug>`) al llegar desde la
 * home: primero aterrizamos en /sabores normalmente y luego un scroll
 * animado ('smooth') alinea el paquito con la parte superior del viewport.
 * Como la misma página
 * renderiza dos versiones del catálogo (móvil y desktop, una oculta por
 * breakpoint) con el mismo `data-paquito-anchor`, usamos un atributo de datos
 * en vez de `id` (sin IDs duplicados) y elegimos el elemento realmente
 * visible (`offsetParent !== null`).
 *
 * Las imágenes cargan async y no reservan altura → el layout puede
 * desplazarse mientras el scroll suave está en marcha. Para reajustar sin
 * pelearnos con esa animación, un ResizeObserver sobre <body> detecta
 * cambios de TAMAÑO reales (no se dispara por el scroll en sí) durante una
 * ventana corta, y lo cancelamos en cuanto el usuario interactúa con el
 * scroll.
 */
export default function DeepLinkScroller() {
  useEffect(() => {
    let cleanupActive: (() => void) | null = null;

    const scrollToHash = () => {
      cleanupActive?.();
      cleanupActive = null;

      const slug = slugFromHash(window.location.hash);
      if (!slug) return;

      // Ya hemos capturado el slug: quitamos el hash de la URL/historial ahora
      // mismo (no solo lo normalizamos). Si lo dejáramos puesto, el App Router
      // a veces lo concatena en vez de sustituirlo al re-navegar a esta misma
      // ruta (`#a#b`), y además queda "pegado" en el historial: si el usuario
      // sale a otra página y vuelve a /sabores, arrastra el `#item` de nuevo.
      // replaceState no dispara hashchange, así que no reentra aquí.
      history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`
      );

      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-paquito-anchor="${CSS.escape(slug)}"]`
        )
      );
      const target =
        candidates.find((el) => el.offsetParent !== null) ?? candidates[0];
      if (!target) return;

      let cancelled = false;
      let realignTimer = 0;
      let stopTimer = 0;

      const align = () => {
        target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      };

      const removeCancelListeners = () => {
        window.removeEventListener('wheel', onUserScroll);
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('keydown', onUserScroll);
      };
      const onUserScroll = () => {
        cancelled = true;
        window.clearTimeout(realignTimer);
        window.clearTimeout(stopTimer);
        resizeObserver.disconnect();
        removeCancelListeners();
      };

      const resizeObserver = new ResizeObserver(() => {
        if (cancelled) return;
        // Agrupa varias cargas de imagen simultáneas en un solo reajuste.
        window.clearTimeout(realignTimer);
        realignTimer = window.setTimeout(align, REALIGN_DEBOUNCE_MS);
      });

      window.addEventListener('wheel', onUserScroll, { passive: true });
      window.addEventListener('touchmove', onUserScroll, { passive: true });
      window.addEventListener('keydown', onUserScroll);

      align();
      resizeObserver.observe(document.body);
      stopTimer = window.setTimeout(() => {
        resizeObserver.disconnect();
        removeCancelListeners();
      }, SETTLE_MS);

      cleanupActive = () => {
        cancelled = true;
        window.clearTimeout(realignTimer);
        window.clearTimeout(stopTimer);
        resizeObserver.disconnect();
        removeCancelListeners();
      };
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      cleanupActive?.();
    };
  }, []);

  return null;
}
