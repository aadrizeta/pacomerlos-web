interface ConectorMiddleProps {
  topText: string;
  bottomText: string;
  bgColor: string;
}

export default function ConectorMiddle({ topText, bottomText, bgColor }: ConectorMiddleProps) {
  return (
    <div className="relative z-10 text-paco-cream" style={{ backgroundColor: bgColor }}>
      <svg
        className="pointer-events-none absolute inset-x-0 w-full"
        style={{ top: '-46px', height: '47px' }}
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill={bgColor} d="M0,48 H1200 V30 C1010,2 840,42 600,20 C400,2 190,38 0,16 Z" />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-8 pt-18 text-center tracking-widest pb-25">
        {/* Ola superior del contenedor interno */}
        <svg
          className="pointer-events-none absolute inset-x-0 w-full"
          style={{ top: 0, height: '32px' }}
          viewBox="0 0 1200 32"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="var(--background)" d="M0,0 H1200 V14 C1000,28 820,4 600,18 C380,32 180,6 0,22 Z" />
        </svg>

        <p className="text-xl md:text-2xl font-now uppercase">
          {topText}
        </p>
        <h3 className="padding-responsive max-w-225 text-3xl md:text-6xl font-now font-bold uppercase">
          {bottomText}
        </h3>
      </div>

      <svg
        className="pointer-events-none absolute inset-x-0 w-full"
        style={{ bottom: '-1px', height: '48px' }}
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="var(--background)" d="M0,48 H1200 V26 C1000,2 820,42 600,20 C380,0 180,38 0,16 Z" />
      </svg>
    </div>
  );
}
