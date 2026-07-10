import BorderWave from "../BorderWave";

export function ConectorTop() {
  return (
    <div className="relative z-10 bg-paco-orange text-paco-cream">
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-8 py-8 text-center">
        <h1 className="text-3xl md:text-6xl font-now font-semibold uppercase">
          Prepárate<br /><span className="font-chunko text-4xl md:text-5xl lg:text-8xl">Pa&apos; Comerlos</span>
        </h1>
        <h2 className="text-xl md:text-2xl font-now font-semibold">
          Olvídate de los bollos industriales. Un paquito es otra cosa
        </h2>
      </div>
      <BorderWave background="var(--paco-orange)" fill="var(--paco-cream)" />
    </div>
  );
}
