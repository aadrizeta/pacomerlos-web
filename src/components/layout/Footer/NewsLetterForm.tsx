import EmailInput from '@/components/ui/Footer/EmailInput';
import { getLaunchSettings } from '@/lib/directus/queries';

/**
 * Server Component: el copy del formulario depende de `launch_status` (Directus,
 * ISR 30s). En coming_soon invita a "ser el primero"; tras el lanzamiento pasa a
 * newsletter informativa. La suscripción va siempre a la misma lista de Listmonk.
 */
export default async function NewsLetterForm() {
  const { launch_status } = await getLaunchSettings();
  const launched = launch_status === 'launched';

  return (
    <div
      id="newsletter"
      className="bg-background padding-responsive flex scroll-mt-24 flex-col gap-8 py-5 lg:flex-row lg:items-center lg:justify-between lg:py-10"
    >
      <div className="newsLetter-text">
        <h3 className="text-3xl md:text-5xl font-chunko uppercase text-paco-orange">
          {launched ? 'Newsletter' : 'Muy Pronto'}
        </h3>
        {launched ? (
          <p className='md:text-xl'>
            Suscríbete a nuestra newsletter y no te pierdas{' '}
            <b>las novedades, los nuevos paquitos y dónde encontrarlos</b>.
          </p>
        ) : (
          <p className='md:text-lg'>
            ¡Sé el primero en saber cuándo llegan los paquitos!
            <br />
            <b>
              Suscríbete a nuestra newsletter y no te pierdas el lanzamiento de
              Pacomerlos
            </b>
          </p>
        )}
      </div>

      <div className="w-full lg:flex-1">
        <EmailInput launched={launched} />
      </div>
    </div>
  );
}
