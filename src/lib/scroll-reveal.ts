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

let oneShot: IntersectionObserver | null = null;
let repeat: IntersectionObserver | null = null;

/**
 * Margen inferior negativo: encoge el viewport efectivo por abajo, de modo que el
 * reveal salta cuando el elemento ya ha subido ~18% dentro de la pantalla (no justo
 * al asomar por el borde inferior). Sube el % para dispararlo aún más arriba.
 */
const ROOT_MARGIN = '0px 0px -18% 0px';

function getOneShot(): IntersectionObserver {
  if (oneShot) return oneShot;
  oneShot = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          oneShot!.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: ROOT_MARGIN },
  );
  return oneShot;
}

function getRepeat(): IntersectionObserver {
  if (repeat) return repeat;
  repeat = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else if (entry.boundingClientRect.top > 0) {
          // volvió por debajo del viewport → resetea para re-animar
          entry.target.classList.remove('revealed');
        }
      }
    },
    { threshold: 0.15, rootMargin: ROOT_MARGIN },
  );
  return repeat;
}

/**
 * Registra un elemento para el efecto de reveal.
 * Devuelve una función de limpieza que deja de observarlo.
 */
export function observeReveal(el: Element, repeatMode = false): () => void {
  const observer = repeatMode ? getRepeat() : getOneShot();
  observer.observe(el);
  return () => observer.unobserve(el);
}
