import RedesContainer from "@/components/ui/Footer/redes";
import NavContainer, { type FooterNavLink } from "@/components/ui/Footer/navContainer";
import Contacto from "@/components/ui/Footer/contacto";
import FooterLogo from "@/components/ui/Footer/footerLogo";

const NAVEGAR_LINKS: FooterNavLink[] = [
  { name: "Sabores", href: "/sabores" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  { name: "Pacommunity", href: "/pacommunity" },
];

const LEGAL_LINKS: FooterNavLink[] = [
  { name: "Política de cookies", href: "/politica-de-cookies" },
  { name: "Privacidad", href: "/privacidad" },
  { name: "Aviso legal", href: "/aviso-legal" },
];

export default function MainFooter() {
  return (
    <div className="w-full py-3 bg-paco-purple">
      <div className="padding-responsive-footer flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:grid-rows-[auto_auto] lg:gap-y-3 lg:items-center">
        {/* Centro superior: redes, centrado horizontal (arriba en mobile/tablet) */}
        <div className="lg:col-start-2 lg:row-start-1 lg:pt-3 lg:self-center lg:justify-self-center">
          <RedesContainer />
        </div>

        {/* Izquierda: enlaces (Navegar + Legal contiguos), centrado vertical */}
        <div className="nav-row flex justify-between lg:col-start-1 lg:row-span-2 lg:justify-start lg:gap-24 lg:self-center px-7 lg:px-0">
          <NavContainer name="Navegar" links={NAVEGAR_LINKS} />
          <NavContainer name="Legal" links={LEGAL_LINKS} />
        </div>

        {/* Centro inferior: logo, centrado horizontal */}
        <div className="lg:col-start-2 lg:row-start-2 lg:self-center lg:justify-self-center">
          <FooterLogo />
        </div>

        {/* Derecha: contacto en columna, centrado vertical */}
        <div className="lg:col-start-3 lg:row-span-2 lg:self-center lg:justify-self-center">
          <Contacto />
        </div>
      </div>
    </div>
  );
}