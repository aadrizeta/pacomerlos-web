import type { Metadata } from 'next';
import BackButton from "@/components/ui/SaboresPage/backButton"
import DeepLinkScroller from "@/components/ui/SaboresPage/deepLinkScroller"
import PacoCard from "@/components/ui/SaboresPage/pacoCard"
import MobileCatalog from "@/components/ui/SaboresPage/MobileCatalog"
import StackedCards from "@/components/ui/SaboresPage/stackedCards"
import { getPaquitos } from "@/lib/directus/queries"

export const metadata: Metadata = {
  title: "Nuestros Sabores",
  description: "Descubre todos los sabores de paquitos artesanales de Paco Merlos, hechos a mano con masa madre fermentada 48 horas.",
  alternates: {
    canonical: "https://pacomerlos.com/sabores",
  },
  openGraph: {
    url: "https://pacomerlos.com/sabores",
    title: "Nuestros Sabores — Paco Merlos",
    description: "Descubre todos los sabores de paquitos artesanales de Paco Merlos, hechos a mano con masa madre fermentada 48 horas.",
    images: [{ url: "/img/PACOSJUNTOS.png" }],
  },
};

export const revalidate = 30;

export default async function Sabores() {
  const paquitos = await getPaquitos();

  return (
    <>
      <DeepLinkScroller />

      <section className="padding-responsive pt-22 md:pt-25 pb-10">
        <BackButton />
        <div className="flex flex-col items-center">
          <h1 className="mt-5 text-center font-chunko uppercase text-paco-orange text-4xl md:text-7xl lg:text-8xl">
            Nuestros sabores
          </h1>
          <h2 className="mt-4 text-center font-now uppercase text-xl md:text-3xl lg:text-4xl">
            ¡Cuidado! Querrás repetir
          </h2>
        </div>
      </section>

      {/* Móvil: cards compactas y desplegables (acordeón: una abierta a la vez) */}
      <section className="md:hidden padding-responsive pb-24 flex flex-col gap-4">
        <MobileCatalog paquitos={paquitos} />
      </section>

      {/* Desktop: pila de cards al hacer scroll */}
      <section className="hidden md:block padding-responsive pb-24">
        <StackedCards topOffset={40} gap={24}>
          {paquitos.map((paquito, i) => (
            <PacoCard key={paquito.id} paquito={paquito} reverse={i % 2 === 1} />
          ))}
        </StackedCards>
      </section>
    </>
  )
}