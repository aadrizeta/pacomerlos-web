export function ConectorTop() {
  return (
    <div className="relative z-10 bg-paco-orange text-paco-cream">
      <svg
        className="pointer-events-none absolute inset-x-0 w-full"
        style={{ top: '-46px', height: '47px' }}
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="var(--paco-orange)" d="M0,48 H1200 V30 C1010,2 840,42 600,20 C400,2 190,38 0,16 Z" />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-8 py-8 text-center pb-25">
        <h1 className="text-3xl md:text-6xl font-now font-semibold uppercase">
          Prepárate<br /><span className="font-chunko text-4xl md:text-5xl lg:text-8xl">Pa&apos; Comerlos</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-now font-semibold">
          Olvídate de los bollos industriales. Un paquito es otra cosa
        </h2>
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
