/**
 * Observadores compartidos para el scroll-reveal.
 *
 * En vez de crear un IntersectionObserver por elemento, mantenemos uno por modo
 * (one-shot / repeat) y todos los <Reveal> se registran en ellos. Más eficiente
 * cuando hay muchos elementos animados en la página.
 *
 * Replica el comportamiento del proyecto HTML original:
 *  - one-shot: anima una vez al entrar y deja de observar.
 *  - repeat:   re-anima cada vez que el elemento vuelve a entrar; al salir por
 *              abajo (top > 0) resetea quitando `.revealed`.
 */

/**
 * Margen inferior negativo por defecto: encoge el viewport efectivo por abajo, de modo
 * que el reveal salta cuando el elemento ya ha subido ~18% dentro de la pantalla (no
 * justo al asomar por el borde inferior). Un valor POSITIVO (p. ej. `0px 0px 20% 0px`)
 * hace lo contrario: amplía el viewport por abajo y dispara ANTES, cuando el elemento
 * aún está por debajo del borde inferior.
 */
const DEFAULT_ROOT_MARGIN = '0px 0px -18% 0px';

/**
 * Un observer por combinación de (modo × rootMargin), cacheado y reutilizado por todos
 * los elementos que compartan esa configuración. Así seguimos con pocos observers aunque
 * distintos efectos (reveal genérico, pacomojis…) usen rangos de disparo diferentes.
 */
const observers = new Map<string, IntersectionObserver>();

function getObserver(repeatMode: boolean, rootMargin: string): IntersectionObserver {
  const key = `${repeatMode ? 'repeat' : 'once'}|${rootMargin}`;
  const cached = observers.get(key);
  if (cached) return cached;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (!repeatMode) observer.unobserve(entry.target);
        } else if (repeatMode && entry.boundingClientRect.top > 0) {
          // volvió por debajo del viewport → resetea para re-animar
          entry.target.classList.remove('revealed');
        }
      }
    },
    { threshold: repeatMode ? 0.15 : 0.08, rootMargin },
  );
  observers.set(key, observer);
  return observer;
}

/**
 * Registra un elemento para el efecto de reveal.
 * @param repeatMode  re-anima cada vez que reentra en viewport (resetea al salir por abajo).
 * @param rootMargin  rango de disparo (CSS `rootMargin`). Por defecto dispara ~18% dentro
 *                    de pantalla; pásale un valor positivo por abajo para dispararlo antes.
 * Devuelve una función de limpieza que deja de observarlo.
 */
export function observeReveal(
  el: Element,
  repeatMode = false,
  rootMargin: string = DEFAULT_ROOT_MARGIN,
): () => void {
  const observer = getObserver(repeatMode, rootMargin);
  observer.observe(el);
  return () => observer.unobserve(el);
}
