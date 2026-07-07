import type { CSSProperties } from 'react';

export interface SectionHeaderProps {
  kicker: string;
  title: string;
  /** Color del título (h2). Por defecto `var(--paco-orange)`. */
  titleColor?: string;
  /** Color del kicker (p + opacidad). Por defecto `var(--paco-orange)`. */
  kickerColor?: string;
  /** Color de las barras laterales. Por defecto `var(--paco-orange)`. */
  barsColor?: string;
  /** Font-size personalizado del título (CSS: `'4rem'`, `'clamp(...)'`, …). Si se
   *  omite, usa el tamaño por defecto responsive (`text-section-title`). */
  titleSizeOverride?: string;
}

export default function SectionHeader({
  kicker,
  title,
  titleColor,
  kickerColor,
  barsColor,
  titleSizeOverride,
}: SectionHeaderProps) {
  const titleStyle: CSSProperties = {};
  if (titleColor) titleStyle.color = titleColor;
  if (titleSizeOverride) titleStyle.fontSize = titleSizeOverride;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full flex justify-center items-center gap-4 opacity-80 text-paco-orange"
        style={kickerColor ? { color: kickerColor } : undefined}
      >
        <div className="side-bars" style={barsColor ? { backgroundColor: barsColor } : undefined} />
        <p className="text-center text-xl uppercase tracking-widest font-now">{kicker}</p>
        <div className="side-bars" style={barsColor ? { backgroundColor: barsColor } : undefined} />
      </div>
      <h2
        className="px-6 text-section-title font-chunko uppercase text-center mt-3 text-paco-orange leading-none"
        style={titleStyle}
      >
        {title}
      </h2>
    </div>
  );
}
