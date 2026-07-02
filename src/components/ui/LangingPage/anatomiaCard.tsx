import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export interface AnatomiaCardProps {
  kicker: string;
  word: string;
  desc: string;
  bgColor: string;
  img: string;
  imgAlt: string;
  imgWidth: number;
  imgHeight: number;
  reverse?: boolean;
  textColor?: string;
}

export default function AnatomiaCard({ kicker, word, desc, bgColor, img, imgAlt, imgWidth, imgHeight, reverse = false, textColor }: AnatomiaCardProps) {
  return (
    <div className="anatomia-card w-full" style={{ backgroundColor: bgColor }}>
      <div
        className={`mx-auto flex w-full max-w-450 flex-col pt-6 px-6 lg:items-center lg:justify-between md:px-12 lg:px-20 ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
      >
        <Reveal
          as="div"
          className="card-text"
          direction={reverse ? 'left' : 'right'}
          distance="2.5rem"
          duration={1.5}
          repeat
        >
          <p className="card-kicker" style={{ color: textColor }}>
            {kicker}
          </p>
          <p className="card-word" style={{ color: textColor }}>
            {word}
          </p>
          <p className="card-desc" style={{ color: textColor }}>
            {desc}
          </p>
        </Reveal>
        <Reveal
          as="div"
          className="card-photo"
          direction={reverse ? 'right' : 'left'}
          distance="5rem"
          duration={1.5}
          delay={1}
          repeat
        >
          <Image
            src={img}
            alt={imgAlt}
            width={imgWidth}
            height={imgHeight}
            className="h-auto max-h-85 w-auto max-w-full"
          />
        </Reveal>
      </div>
    </div>
  );
}