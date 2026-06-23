import EmailInput from '@/components/ui/Footer/EmailInput';

export default function NewsLetterForm() {
  return (
    <div className="bg-background padding-responsive flex flex-col gap-8 py-5 lg:flex-row lg:items-center lg:justify-between lg:py-10">
      <div className="newsLetter-text">
        <h3 className="text-2xl font-chunko uppercase text-paco-orange">Muy Pronto</h3>
        <p>
          ¡Sé el primero en saber cuándo llegan los paquitos!
          <br />
          <b>
            Suscríbete a nuestra newsletter y no te pierdas el lanzamiento de
            Pacomerlos
          </b>
        </p>
      </div>

      <div className="w-full lg:flex-1">
        <EmailInput />
      </div>
    </div>
  );
}
