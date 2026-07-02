// Flecha del carrusel de paquitos como SVG inline: al usar `fill="currentColor"`
// el color se controla desde el frontend (clase `text-*` o prop `color`), a
// diferencia de un <img>/next/image, que no puede recolorearse. La misma ruta
// sirve para ambos sentidos; `direction` solo cambia el transform de reflejo
// (igual que hacían prev.svg / next.svg).

const ARROW_PATH =
  'M2330 5110 c-494 -48 -950 -230 -1350 -538 -195 -150 -448 -432 -594 -662 -63 -99 -186 -351 -230 -471 -49 -134 -102 -340 -128 -499 -31 -195 -31 -565 0 -760 45 -276 116 -498 237 -745 132 -269 269 -460 489 -681 221 -220 412 -357 681 -489 247 -121 469 -192 745 -237 195 -31 565 -31 760 0 276 45 498 116 745 237 269 132 460 269 681 489 220 221 357 412 489 681 88 179 132 296 180 476 63 240 78 371 78 649 0 278 -15 409 -78 649 -48 180 -92 297 -180 476 -132 269 -269 460 -489 681 -221 220 -412 357 -681 489 -246 121 -474 193 -740 235 -147 23 -475 34 -615 20z m-110 -1291 c34 -15 175 -150 583 -557 296 -295 553 -557 570 -582 29 -41 32 -52 32 -120 0 -68 -3 -79 -32 -120 -17 -25 -274 -287 -570 -582 -566 -565 -581 -577 -668 -578 -44 0 -131 36 -157 66 -29 33 -58 107 -58 149 0 86 17 106 508 598 l467 467 -467 468 c-491 491 -508 511 -508 597 0 42 29 116 58 149 26 30 113 66 157 66 22 0 60 -10 85 -21z';

interface GalleryArrowProps {
  direction: 'prev' | 'next';
  /** Color explícito (sobre-escribe el heredado por `currentColor`). */
  color?: string;
  className?: string;
}

export default function GalleryArrow({ direction, color, className }: GalleryArrowProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <g
        transform={
          direction === 'next'
            ? 'translate(0,512) scale(0.1,-0.1)'
            : 'translate(512,512) scale(-0.1,-0.1)'
        }
      >
        <path d={ARROW_PATH} />
      </g>
    </svg>
  );
}
