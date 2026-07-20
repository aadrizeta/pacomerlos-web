import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import BackButton from '@/components/ui/SaboresPage/backButton';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description:
    'Información sobre el uso de cookies y tecnologías de almacenamiento en el sitio web de Paco Merlos.',
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

export default function PoliticaDeCookies() {
  return (
    <section className="padding-responsive pt-22 md:pt-25 pb-24">
      <BackButton />

      <div className="mx-auto mt-5 max-w-3xl">
        <h1 className="font-chunko uppercase text-paco-orange text-4xl md:text-6xl">
          Política de cookies
        </h1>
        <p className="mt-3 text-sm text-black/55">
          Última actualización: <PH>FECHA</PH>
        </p>

        <Section title="1. ¿Qué son las cookies?">
          <p>
            Una cookie es un pequeño archivo de texto que un sitio web almacena
            en el navegador del usuario al visitarlo. Sirven, entre otras cosas,
            para recordar preferencias, mantener sesiones o recopilar
            información estadística. Junto a las cookies existen otras
            tecnologías de almacenamiento del navegador (como{' '}
            <em>localStorage</em>, <em>sessionStorage</em> o el almacenamiento
            de sesión) que cumplen funciones similares.
          </p>
        </Section>

        <Section title="2. Cookies utilizadas en este sitio web">
          <p>
            <strong>
              Este sitio web ({' '}
              <span className="text-paco-orange font-semibold">
                pacomerlos.com
              </span>{' '}
              ) no utiliza cookies propias.
            </strong>{' '}
            No empleamos cookies de análisis, de publicidad ni de seguimiento o
            elaboración de perfiles, y no compartimos datos de navegación con
            terceros con fines comerciales.
          </p>
          <p>
            Tampoco almacenamos información personal en el navegador mediante{' '}
            <em>localStorage</em> o <em>sessionStorage</em>. La web únicamente
            utiliza el fragmento de la URL (la parte que sigue a «#») y el
            estado de navegación del propio navegador para poder enlazar
            directamente a un producto concreto del catálogo. No es
            almacenamiento persistente ni permite identificar al usuario.
          </p>
        </Section>

        <Section title="3. Cookies de terceros">
          <p>
            Las imágenes de los productos se sirven desde el dominio{' '}
            <span className="text-paco-orange font-semibold">
              cms.pacomerlos.com
            </span>
            , que está protegido por <strong>Cloudflare</strong> (red de
            distribución de contenidos y seguridad). Al cargar dichas imágenes,
            Cloudflare puede instalar en ese dominio cookies estrictamente
            técnicas y de seguridad, destinadas a proteger el servicio frente a
            tráfico malicioso y ataques automatizados.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/15 text-left">
                  <th className="py-2 pr-4 font-semibold">Cookie</th>
                  <th className="py-2 pr-4 font-semibold">Proveedor</th>
                  <th className="py-2 pr-4 font-semibold">Finalidad</th>
                  <th className="py-2 pr-4 font-semibold">Duración</th>
                  <th className="py-2 font-semibold">Tipo</th>
                </tr>
              </thead>
              <tbody className="text-black/75">
                <tr className="border-b border-black/10">
                  <td className="py-2 pr-4 align-top font-mono">__cf_bm</td>
                  <td className="py-2 pr-4 align-top">Cloudflare</td>
                  <td className="py-2 pr-4 align-top">
                    Distinguir entre humanos y bots para proteger el servicio.
                  </td>
                  <td className="py-2 pr-4 align-top">30 minutos</td>
                  <td className="py-2 align-top">Técnica / seguridad</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top font-mono">cf_clearance</td>
                  <td className="py-2 pr-4 align-top">Cloudflare</td>
                  <td className="py-2 pr-4 align-top">
                    Almacenar el resultado de un desafío de seguridad superado.
                  </td>
                  <td className="py-2 pr-4 align-top">
                    Hasta 1 año (según configuración)
                  </td>
                  <td className="py-2 align-top">Técnica / seguridad</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-black/55">
            Estas cookies se instalan, en su caso, en el dominio{' '}
            <span className="font-semibold">cms.pacomerlos.com</span> (no en el
            dominio principal) y solo al solicitarse los recursos alojados allí.
            Su listado y duración exactos dependen de la configuración de
            Cloudflare y pueden variar.
          </p>
        </Section>

        <Section title="4. Base jurídica y consentimiento">
          <p>
            De acuerdo con el artículo 22.2 de la Ley 34/2002 (LSSI-CE) y la
            Guía sobre el uso de cookies de la Agencia Española de Protección de
            Datos (AEPD), las cookies estrictamente técnicas o necesarias están
            exentas del deber de obtener el consentimiento previo del usuario.
          </p>
          <p>
            Dado que este sitio web no utiliza cookies propias y que las únicas
            cookies de terceros que pueden instalarse son técnicas y de
            seguridad (Cloudflare), <strong>no se solicita consentimiento</strong>{' '}
            ni se muestra un banner de cookies. Si en el futuro se incorporasen
            cookies de análisis, publicidad u otras no exentas, se habilitaría
            previamente un mecanismo de consentimiento conforme a la normativa.
          </p>
        </Section>

        <Section title="5. Cómo gestionar o desactivar las cookies">
          <p>
            El usuario puede permitir, bloquear o eliminar las cookies
            instaladas en su equipo mediante la configuración de su navegador.
            Tenga en cuenta que el bloqueo de las cookies técnicas de seguridad
            podría afectar al correcto funcionamiento de algunas funciones (por
            ejemplo, la carga de imágenes).
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paco-purple-dark underline"
              >
                Google Chrome
              </Link>
            </li>
            <li>
              <Link
                href="https://support.mozilla.org/es/kb/Borrar%20cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paco-purple-dark underline"
              >
                Mozilla Firefox
              </Link>
            </li>
            <li>
              <Link
                href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paco-purple-dark underline"
              >
                Microsoft Edge
              </Link>
            </li>
            <li>
              <Link
                href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paco-purple-dark underline"
              >
                Apple Safari
              </Link>
            </li>
          </ul>
        </Section>

        <Section title="6. Información adicional">
          <p>
            Puede consultar más información sobre el tratamiento de sus datos en
            nuestra{' '}
            <Link href="/privacidad" className="text-paco-purple-dark underline">
              política de privacidad
            </Link>{' '}
            y sobre la titularidad del sitio en el{' '}
            <Link href="/aviso-legal" className="text-paco-purple-dark underline">
              aviso legal
            </Link>
            . Para cualquier duda relacionada con esta política puede escribir a{' '}
            <Link
              href="mailto:info@pacomerlos.com"
              className="text-paco-purple-dark underline"
            >
              info@pacomerlos.com
            </Link>
            .
          </p>
        </Section>

        <Section title="7. Cambios en la política de cookies">
          <p>
            {TITULAR} se reserva el derecho de modificar la presente política de
            cookies para adaptarla a novedades legislativas, técnicas o a cambios
            en el sitio web. Se recomienda revisar su contenido periódicamente.
          </p>
        </Section>
      </div>
    </section>
  );
}
