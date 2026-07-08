import { Fragment } from 'react';
import type { CSSProperties } from 'react';

export interface SectionHeaderProps {
  kicker: string;
  title: string | string[];
  titleColor?: string;
  kickerColor?: string;
  barsColor?: string;
  titleSizeOverride?: string;
  titleMaxWidth?: string;
}

export default function SectionHeader({
  kicker,
  title,
  titleColor,
  kickerColor,
  barsColor,
  titleSizeOverride,
  titleMaxWidth = '11em',
}: SectionHeaderProps) {
  const titleStyle: CSSProperties = { maxWidth: titleMaxWidth };
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
        className="text-section-title font-chunko uppercase text-center text-balance mt-3 text-paco-orange leading-none"
        style={titleStyle}
      >
        {Array.isArray(title)
          ? title.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))
          : title}
      </h2>
    </div>
  );
}