import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import Reveal from "@/components/ui/Reveal";
import BorderWave from "@/components/ui/BorderWave";
import { renderBoldText } from "@/lib/richText";

export interface ImageTextProps {
  title: string;
  text1: string;
  text2?: string;
  img: StaticImageData;
  imgAlt: string;
  bgColor: string;
  waveTop: boolean;
  waveBottom: boolean;
  waveTopFill?: string;
  waveBottomFill?: string;
  reverse?: boolean;
  outline?: boolean;
  outlineColor?: string;
}

export default function AbtUsSection({ title, text1, text2, img, imgAlt, bgColor, waveTop, waveBottom, waveTopFill, waveBottomFill, reverse, outline, outlineColor }: ImageTextProps) {
  return (
    <>
      {waveTop && <BorderWave background={bgColor} fill={waveTopFill} flip />}
      <section style={{ backgroundColor: bgColor }}>

        <div className={`padding-responsive max-w-9xl flex flex-col gap-16 items-center py-15 lg:justify-between ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          <Reveal repeat className="w-full lg:flex-1 lg:max-w-2xl">
            <Image
              src={img}
              alt={imgAlt}
              sizes="(min-width: 1024px) 576px, 90vw"
              style={{ width: '100%', height: 'auto' }}
              className={`abt-section-image${reverse ? ' abt-section-image--reverse' : ''}`}
            />
          </Reveal>
          <div
            className="w-full lg:flex-1 lg:max-w-2xl"
            style={outlineColor ? ({ '--outline-color': outlineColor } as CSSProperties) : undefined}
          >
            <Reveal
              as="h2"
              repeat
              className={`text-title-big font-chunko uppercase leading-none ${outline ? 'paco-outline' : 'text-paco-cream'}`}
            >
              {title}
              <div
                className="w-20 h-0.5 mt-4 mb-8"
                style={{
                  backgroundColor: outlineColor || '#FFFFF54D'
                }}
              />
            </Reveal>
            <Reveal repeat className="flex flex-col gap-5 md:gap-9">
              <p className="font-now font-light text-lg md:text-2xl text-paco-cream">{renderBoldText(text1)}</p>
              {text2 && <p className="font-now font-light text-lg md:text-2xl text-paco-cream">{renderBoldText(text2)}</p>}
            </Reveal>
          </div>
        </div>

      </section>
      {waveBottom && <BorderWave background={bgColor} fill={waveBottomFill} />}
    </>
  );
}