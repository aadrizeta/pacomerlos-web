'use client';

import { useState } from 'react';

const PHOTOS = [
  { src: '/img/pacogrupal tablón.png',  alt: 'Equipo Paco Merlos',   caption: 'El equipo' },
  { src: '/img/foto bollo tablón.jpg',  alt: 'Nuestros paquitos',     caption: 'Los paquitos' },
  { src: '/img/mordisco tablón.png',    alt: 'Mordisco a un paquito', caption: '¡Pruébalo!' },
];

const ROTATIONS = ['-8deg', '2deg', '10deg'];
const OFFSETS   = ['-50px, 30px', '10px, -10px', '60px, 25px'];

export default function PhotoGallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="pg-fan">
        {PHOTOS.map((photo, i) => (
          <button
            key={i}
            className="pg-polaroid"
            style={{ '--rot': ROTATIONS[i], '--off': OFFSETS[i] } as React.CSSProperties}
            onClick={() => setOpen(i)}
            aria-label={`Ver foto: ${photo.alt}`}
          >
            <img src={photo.src} alt={photo.alt} />
            <span className="pg-caption">{photo.caption}</span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="pg-lightbox" onClick={() => setOpen(null)}>
          <button className="pg-lightbox-close" onClick={() => setOpen(null)} aria-label="Cerrar">✕</button>
          <div className="pg-lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={PHOTOS[open].src} alt={PHOTOS[open].alt} />
            <p className="pg-lightbox-caption">{PHOTOS[open].caption}</p>
            <div className="pg-lightbox-nav">
              <button onClick={() => setOpen((open - 1 + PHOTOS.length) % PHOTOS.length)}>←</button>
              <button onClick={() => setOpen((open + 1) % PHOTOS.length)}>→</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
