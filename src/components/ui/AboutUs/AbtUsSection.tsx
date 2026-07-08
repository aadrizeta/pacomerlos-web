import Image, { type StaticImageData } from "next/image";
import Reveal from "@/components/ui/Reveal";
import BorderWave from "@/components/ui/BorderWave";

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
}

export default function AbtUsSection({ title, text1, text2, img, imgAlt, bgColor, waveTop, waveBottom, waveTopFill, waveBottomFill, reverse }: ImageTextProps) {
  return (
    <>
      {waveTop && <BorderWave background={bgColor} fill={waveTopFill} flip />}
      <section style={{ backgroundColor: bgColor }}>

        <div className={`padding-responsive max-w-9xl flex flex-col gap-16 items-center py-15 lg:justify-between ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          <Reveal delay={2} repeat className="w-full lg:flex-1 lg:max-w-2xl">
            <Image
              src={img}
              alt={imgAlt}
              sizes="(min-width: 1024px) 576px, 90vw"
              style={{ width: '100%', height: 'auto' }}
              className={`abt-section-image${reverse ? ' abt-section-image--reverse' : ''}`}
            />
          </Reveal>
          <div className="w-full lg:flex-1 lg:max-w-2xl">
            <Reveal as="h2" delay={1} repeat className="text-title-big font-chunko uppercase text-paco-cream leading-none">{title}</Reveal>
            <div className="abt-respaldo-divider mt-5" />
            <Reveal delay={3} repeat className="flex flex-col gap-5 md:gap-9">
              <p className="font-now text-lg md:text-xl lg:text-3xl text-paco-cream">{text1}</p>
              {text2 && <p className="font-now text-lg md:text-xl lg:text-3xl text-paco-cream">{text2}</p>}
            </Reveal>
          </div>
        </div>

      </section>
      {waveBottom && <BorderWave background={bgColor} fill={waveBottomFill} />}
    </>
  );
}