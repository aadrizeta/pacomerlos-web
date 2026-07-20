import Link from 'next/link';

/**
 * Pie de la holding page (y de las páginas legales mientras el sitio está oculto):
 * solo enlaces legales, sin el footer completo del sitio. Estos enlaces quedan
 * FUERA del gate de lanzamiento (route group `(legal)`), así que son accesibles
 * antes del lanzamiento.
 */
export default function ComingSoonFooter() {
  return (
    <footer className="relative z-20 flex items-center justify-center gap-6 px-4 py-5 text-sm text-paco-dark/60">
      <Link href="/aviso-legal" className="hover:text-paco-orange hover:underline">
        Aviso legal
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/privacidad" className="hover:text-paco-orange hover:underline">
        Política de privacidad
      </Link>
    </footer>
  );
}
