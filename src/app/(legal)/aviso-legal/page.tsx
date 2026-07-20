import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/SaboresPage/backButton';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Aviso legal y condiciones de uso del sitio web de Paco Merlos.',
};

/** Marca un dato pendiente de rellenar para que sea fácil de localizar. */
function PH({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-paco-orange/10 px-1 font-medium text-paco-orange">
      [{children}]
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-now text-xl font-bold uppercase text-paco-purple-dark">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-black/80">
        {children}
      </div>
    </section>
  );
}

function DataLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-paco-orange font-semibold">{children}</span>
  );
}

export default function AvisoLegal() {
  return (
    <section className="padding-responsive pt-22 md:pt-25 pb-24">
      <BackButton />

      <div className="mx-auto mt-5 max-w-3xl">
        <h1 className="font-chunko uppercase text-paco-orange text-4xl md:text-6xl">
          Aviso legal
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Última actualización: <PH>FECHA</PH>
        </p>

        <Section title="1. Información general">
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio,
            de Servicios de la Sociedad de la Información y de Comercio
            Electrónico (LSSI-CE), se ponen a disposición de los usuarios los
            siguientes datos identificativos del titular de este sitio web:
          </p>
          <ul className="space-y-1">
            <li>
              <strong>Titular:</strong> <DataLabel>ONE STAR TV 2017</DataLabel>
            </li>
            <li>
              <strong>NIF/CIF:</strong> <DataLabel>B95901476</DataLabel>
            </li>
            <li>
              <strong>Domicilio:</strong> <DataLabel>Calle Montesa 35, 28006 Madrid, España</DataLabel>
            </li>
            <li>
              <strong>Correo electrónico:</strong>{' '}
              <Link href="mailto:info@pacomerlos.com" target="_blank">
                <DataLabel>info@pacomerlos.com</DataLabel>
              </Link>
            </li>
            <li>
              <strong>Teléfono:</strong> <DataLabel>603 63 25 85</DataLabel>
            </li>
            <li>
              <strong>Nombre de dominio:</strong> <DataLabel>pacomerlos.com</DataLabel>
            </li>
          </ul>
        </Section>

        <Section title="2. Objeto">
          <p>
            El presente aviso legal regula el acceso, navegación y uso del sitio
            web <DataLabel>pacomerlos.com</DataLabel> (en adelante, el «Sitio Web»), titularidad de{' '}
            <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel>. La utilización del Sitio Web atribuye
            la condición de usuario e implica la aceptación plena de todas las
            cláusulas de este aviso legal.
          </p>
          <p>
            Este sitio web tiene como finalidad ofrecer información sobre los productos y servicios de <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel>, así como facilitar la comunicación con los usuarios.
          </p>
        </Section>

        <Section title="3. Condiciones de acceso y uso">
          <p>
            El acceso al Sitio Web es gratuito y no exige suscripción ni
            registro previo. El usuario se compromete a hacer un uso adecuado de
            los contenidos y a no emplearlos para incurrir en actividades
            ilícitas o contrarias a la buena fe y al orden público.
          </p>
        </Section>

        <Section title="4. Propiedad intelectual e industrial">
          <p>
            Todos los contenidos del Sitio Web (textos, fotografías, gráficos,
            imágenes, iconos, logotipos, marcas, diseño y código fuente) son
            titularidad de <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel> o de terceros que han
            autorizado su uso, y están protegidos por los derechos de propiedad
            intelectual e industrial.
          </p>
          <p>
            Queda prohibida su reproducción, distribución, comunicación pública
            o transformación sin autorización expresa del titular.
          </p>
        </Section>

        <Section title="5. Responsabilidad">
          <p>
            <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel> no se hace responsable de los daños o
            perjuicios que pudieran derivarse del uso de la información contenida
            en el Sitio Web, ni de las interrupciones, errores u omisiones que
            puedan producirse, sin perjuicio de lo establecido en la legislación
            vigente.
          </p>
        </Section>

        <Section title="6. Enlaces a terceros">
          <p>
            El Sitio Web puede contener enlaces a sitios de terceros (por
            ejemplo, perfiles en redes sociales). <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel>{' '}
            no asume responsabilidad alguna sobre el contenido, las políticas de
            privacidad ni las prácticas de dichos sitios externos.
          </p>
        </Section>

        <Section title="7. Protección de datos">
          <p>
            El tratamiento de los datos personales de los usuarios se rige por
            lo establecido en la{' '}
            <Link href="/privacidad" className="text-paco-purple-dark underline">
              política de privacidad
            </Link>
            , que forma parte integrante de este aviso legal.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            La información sobre el uso de cookies y tecnologías de almacenamiento
            se detalla en la{' '}
            <Link
              href="/politica-de-cookies"
              className="text-paco-purple-dark underline"
            >
              política de cookies
            </Link>
            .
          </p>
        </Section>

        <Section title="9. Legislación aplicable y jurisdicción">
          <p>
            El presente aviso legal se rige por la legislación española. Para la
            resolución de cualquier controversia, las partes se someten a los
            juzgados y tribunales de{' '}
            <PH>CIUDAD / PARTIDO JUDICIAL</PH>, salvo que la normativa aplicable
            disponga otro fuero.
          </p>
        </Section>

        <Section title="10. Modificaciones">
          <p>
            <DataLabel>Paco Merlos — Paquitos Artesanales</DataLabel> se reserva el derecho de modificar el
            presente aviso legal para adaptarlo a novedades legislativas o
            cambios en el Sitio Web. Se recomienda revisar su contenido
            periódicamente.
          </p>
        </Section>
      </div>
    </section>
  );
}
