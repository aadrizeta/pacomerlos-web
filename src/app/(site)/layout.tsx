import ComingSoon from "@/components/layout/ComingSoon/ComingSoon";
import HoldingLayout from "@/components/layout/ComingSoon/HoldingLayout";
import SiteChrome from "@/components/layout/SiteChrome";
import { getLaunchSettings } from "@/lib/directus/queries";
import { contentEnv } from "@/lib/directus/status";

/**
 * Layout del sitio principal con el GATE de lanzamiento. Mientras `coming_soon`
 * en producción, todo el sitio queda oculto tras la holding page (`ComingSoon`).
 * En desarrollo se ve la web completa para poder construir. No renderizar
 * `{children}` cuando está gateado evita que las páginas ejecuten sus fetches.
 *
 * Las páginas legales viven en el route group `(legal)`, fuera de este gate, por
 * lo que siguen siendo accesibles antes del lanzamiento.
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const revealed =
    contentEnv() === "development" ||
    (await getLaunchSettings()).launch_status === "launched";

  if (!revealed) {
    return (
      <HoldingLayout>
        <ComingSoon />
      </HoldingLayout>
    );
  }

  return <SiteChrome>{children}</SiteChrome>;
}
