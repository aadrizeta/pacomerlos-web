import BorderWave from "../BorderWave";

export function ConectorTop() {
  return (
    <div className="relative z-10 bg-paco-orange text-paco-cream">
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-8 py-8 md:pb-3 text-center">
        <h2 className="font-now text-xl md:text-3xl">Olvídate de los bollos industriales</h2>
        <h1 className="font-now font-bold text-title-big leading-none">Un paquito es otra cosa</h1>
      </div>
      <BorderWave background="var(--paco-orange)" fill="var(--paco-cream)" />
    </div>
  );
}
