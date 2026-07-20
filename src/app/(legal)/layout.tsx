import HoldingLayout from "@/components/layout/ComingSoon/HoldingLayout";

/**
 * Layout de las páginas legales (aviso legal, privacidad, cookies). NO aplica el
 * gate de lanzamiento: son accesibles siempre, también mientras el resto del sitio
 * está oculto en `coming_soon` (se enlazan desde la holding page). Reutiliza el
 * chrome minimalista de la holding page (`HoldingLayout`: cabecera con logo +
 * redes y pie con enlaces legales) en lugar del Header/Footer completo del sitio.
 */
export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <HoldingLayout>{children}</HoldingLayout>;
}
