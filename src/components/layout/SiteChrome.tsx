import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import ScrollToTop from "@/components/ui/ScrollToTop";

/**
 * Envoltorio de "chrome" del sitio (Header + Footer + ScrollToTop) alrededor del
 * contenido de página. Compartido por los route groups `(site)` y `(legal)` para
 * no duplicar el layout: la única diferencia entre ambos es que `(site)` aplica el
 * gate de lanzamiento (holding page) y `(legal)` no.
 */
export default function SiteChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
