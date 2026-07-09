'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { observeReveal } from '@/lib/scroll-reveal';

interface PacomojiProps {
  src: string | StaticImageData;
  alt?: string;
  index?: number;
  left: string;
  rot?: string;
  size?: number;
  repeat?: boolean;
  jump?: string;
}

const ROOT_MARGIN = '0px 0px 20% 0px';

export default function Pacomoji({
  src,
  alt = '',
  index = 0,
  left,
  rot = '0deg',
  size = 110,
  repeat = false,
  jump,
}: PacomojiProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, repeat, ROOT_MARGIN);
  }, [repeat]);

  const style = {
    '--i': index,
    '--rot': rot,
    '--pm-size': `${size}px`,
    ...(jump ? { '--jump': jump } : {}),
    left,
  } as CSSProperties;

  return (
    <div ref={ref} className="pacomoji" style={style} aria-hidden="true">
      <Image src={src} width={size} height={size} alt={alt} className="pacomoji-img" />
    </div>
  );
}
