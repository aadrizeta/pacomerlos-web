import ComingSoonHeader from './ComingSoonHeader';
import ComingSoonFooter from './ComingSoonFooter';

/**
 * Chrome minimalista de la fase "coming soon": cabecera (logo + redes) y pie
 * (enlaces legales) de la holding page, con el contenido de página en medio.
 *
 * Lo comparten:
 *  - La holding page en sí (`ComingSoon` como children, vía el gate de `(site)`).
 *  - Las páginas legales del route group `(legal)` (aviso legal, privacidad,
 *    cookies), que quedan fuera del gate y por eso son accesibles siempre.
 *
 * Sin `overflow-hidden` en el contenedor para que las páginas legales largas
 * puedan hacer scroll; el recorte de la lluvia de pacomojis se scopea dentro de
 * `ComingSoon`.
 */
export default function HoldingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-paco-cream">
      <ComingSoonHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <ComingSoonFooter />
    </div>
  );
}
