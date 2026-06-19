import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/SaboresPage/backButton';

export const metadata: Metadata = {
  title: 'Política de privacidad | Paco Merlos',
  description:
    'Información sobre el tratamiento de datos personales en el sitio web de Paco Merlos.',
};

const TITULAR = 'ONE STAR TV 2017, S.L.';

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

export default function Privacidad() {
  return (
    <section className="padding-responsive pt-22 md:pt-25 pb-24">
      <BackButton />

      <div className="mx-auto mt-5 max-w-3xl">
        <h1 className="font-chunko uppercase text-paco-orange text-4xl md:text-6xl">
          Política de privacidad
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Última actualización: <PH>FECHA</PH>
        </p>

        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de los datos personales recabados a
            través de este sitio web es:
          </p>
          <ul className="space-y-1">
            <li>
              <strong>Titular:</strong>{' '}
              <span className="text-paco-orange font-semibold">{TITULAR}</span>
            </li>
            <li>
              <strong>NIF/CIF:</strong>{' '}
              <span className="text-paco-orange font-semibold">B95901476</span>
            </li>
            <li>
              <strong>Domicilio:</strong>{' '}
              <span className="text-paco-orange font-semibold">
                Calle Montesa 35, 28006 Madrid, España
              </span>
            </li>
            <li>
              <strong>Correo electrónico:</strong>{' '}
              <Link
                href="mailto:info@pacomerlos.com"
                className="text-paco-purple-dark underline"
              >
                info@pacomerlos.com
              </Link>
            </li>
            <li>
              <strong>Teléfono:</strong>{' '}
              <span className="text-paco-orange font-semibold">603 63 25 85</span>
            </li>
          </ul>
        </Section>

        <Section title="2. Datos que tratamos y su origen">
          <p>
            Este sitio web es de carácter informativo:{' '}
            <strong>
              no dispone de formularios, registro de usuarios, suscripción a
              boletines ni venta en línea
            </strong>
            , por lo que no recopilamos datos personales identificativos de
            forma activa durante la navegación. No obstante, podemos tratar:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Datos técnicos de navegación:</strong> dirección IP, tipo
              de navegador y dispositivo, y registros de acceso generados
              automáticamente por el servidor y por el proveedor de seguridad
              (CDN) al servir las páginas e imágenes.
            </li>
            <li>
              <strong>Datos de contacto:</strong> si decides escribirnos
              voluntariamente al correo electrónico facilitado, trataremos los
              datos que nos proporciones (nombre, dirección de correo y el
              contenido de tu mensaje).
            </li>
          </ul>
        </Section>

        <Section title="3. Finalidades y base jurídica">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>
                Mantener, proteger y garantizar el funcionamiento del sitio web
              </strong>{' '}
              (seguridad, prevención de fraude y abuso, estadísticas técnicas).
              Base jurídica: <em>interés legítimo</em> del responsable
              (art. 6.1.f RGPD).
            </li>
            <li>
              <strong>Atender las consultas o comunicaciones</strong> que nos
              dirijas por correo electrónico. Base jurídica:{' '}
              <em>consentimiento</em> del interesado al contactar (art. 6.1.a
              RGPD) y, en su caso, la aplicación de medidas precontractuales.
            </li>
          </ul>
        </Section>

        <Section title="4. Plazo de conservación">
          <p>
            Los datos técnicos de navegación se conservan durante el tiempo
            estrictamente necesario para las finalidades de seguridad indicadas
            y según los plazos de los proveedores de alojamiento y CDN. Los datos
            de contacto se conservarán durante el tiempo necesario para atender
            tu solicitud y, posteriormente, durante los plazos legales que
            resulten de aplicación.
          </p>
        </Section>

        <Section title="5. Destinatarios y encargados del tratamiento">
          <p>
            No cedemos tus datos a terceros, salvo obligación legal. Para prestar
            el servicio, nos apoyamos en proveedores que actúan como encargados
            del tratamiento:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Proveedor de alojamiento (hosting):</strong>{' '}
              <PH>NOMBRE DEL PROVEEDOR DE HOSTING Y UBICACIÓN</PH>.
            </li>
            <li>
              <strong>Cloudflare, Inc.</strong> — red de distribución de
              contenidos y seguridad que protege el dominio{' '}
              <span className="font-semibold">cms.pacomerlos.com</span> desde el
              que se sirven las imágenes.
            </li>
          </ul>
          <p>
            Algunos de estos proveedores pueden realizar tratamientos fuera del
            Espacio Económico Europeo. En tales casos, las transferencias
            internacionales se amparan en las garantías previstas por el RGPD,
            como las{' '}
            <strong>Cláusulas Contractuales Tipo</strong> aprobadas por la
            Comisión Europea.
          </p>
        </Section>

        <Section title="6. Tus derechos">
          <p>
            Puedes ejercer los siguientes derechos en relación con tus datos
            personales:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Acceso a tus datos personales.</li>
            <li>Rectificación de datos inexactos.</li>
            <li>Supresión de los datos (derecho al olvido).</li>
            <li>Limitación del tratamiento.</li>
            <li>Oposición al tratamiento.</li>
            <li>Portabilidad de los datos.</li>
            <li>Retirar el consentimiento prestado, en su caso.</li>
          </ul>
          <p>
            Para ejercerlos, escríbenos a{' '}
            <Link
              href="mailto:info@pacomerlos.com"
              className="text-paco-purple-dark underline"
            >
              info@pacomerlos.com
            </Link>
            , indicando el derecho que deseas ejercer. Asimismo, si consideras
            que el tratamiento no se ajusta a la normativa, tienes derecho a
            presentar una reclamación ante la{' '}
            <Link
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paco-purple-dark underline"
            >
              Agencia Española de Protección de Datos (AEPD)
            </Link>
            .
          </p>
        </Section>

        <Section title="7. Medidas de seguridad">
          <p>
            Aplicamos las medidas técnicas y organizativas necesarias para
            garantizar la seguridad de los datos y evitar su alteración, pérdida,
            tratamiento o acceso no autorizado, incluyendo el cifrado de las
            comunicaciones (HTTPS/SSL).
          </p>
        </Section>

        <Section title="8. Menores de edad">
          <p>
            Este sitio web no está dirigido específicamente a menores de edad ni
            recaba conscientemente datos de menores. Si detectamos que se han
            facilitado datos de un menor sin la autorización correspondiente,
            procederemos a su supresión.
          </p>
        </Section>

        <Section title="9. Información relacionada">
          <p>
            Esta política se complementa con el{' '}
            <Link href="/aviso-legal" className="text-paco-purple-dark underline">
              aviso legal
            </Link>{' '}
            y la{' '}
            <Link
              href="/politica-de-cookies"
              className="text-paco-purple-dark underline"
            >
              política de cookies
            </Link>
            .
          </p>
        </Section>

        <Section title="10. Cambios en la política de privacidad">
          <p>
            {TITULAR} se reserva el derecho de modificar la presente política
            para adaptarla a novedades legislativas o cambios en el sitio web. Se
            recomienda revisar su contenido periódicamente.
          </p>
        </Section>
      </div>
    </section>
  );
}
