import type { ReactNode } from 'react';

const BOLD_SEGMENT = /(<b>.*?<\/b>)/g;
const BOLD_TAG = /^<b>(.*)<\/b>$/;

/** Convierte marcadores `<b>...</b>` de un string plano (p. ej. SECTION_DATA) en `<strong>` con font-bold. */
export function renderBoldText(text: string): ReactNode {
  return text.split(BOLD_SEGMENT).map((part, i) => {
    const match = part.match(BOLD_TAG);
    if (!match) return part || null;
    return (
      <strong key={i} className="font-bold">
        {match[1]}
      </strong>
    );
  });
}
