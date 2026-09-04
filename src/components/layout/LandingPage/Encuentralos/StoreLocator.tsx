'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cityLabel, type Store } from '@/types/stores';
import { distanceKm, formatDistance } from '@/lib/stores/geo';
import StoreMap from './StoreMap';

interface StoreLocatorProps {
  stores: Store[];
}

type RankedStore = Store & { dist?: number };

const GEO_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="8" strokeOpacity=".3" />
  </svg>
);

export default function StoreLocator({ stores }: StoreLocatorProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Con ubicación compartida la lista se ordena por cercanía y muestra la distancia.
  // Sin ella se respeta el orden de Directus (ciudad, nombre).
  const visibleStores = useMemo<RankedStore[]>(() => {
    if (!userPos) return stores;
    return stores
      .map((s) => ({ ...s, dist: distanceKm(userPos.lat, userPos.lng, s.lat, s.lng) }))
      .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
  }, [stores, userPos]);

  // Desplaza el ítem seleccionado dentro de la lista cuando la selección viene del
  // mapa (al pulsar un marcador, su ficha debe verse también en la columna).
  useEffect(() => {
    if (activeId) scrollItemIntoList(listRef.current, activeId);
  }, [activeId]);

  /**
   * Pide la ubicación al navegador.
   *
   * La Geolocation API **siempre** exige consentimiento explícito: el navegador
   * muestra su propio diálogo de permiso y, si el usuario lo deniega, lo recuerda
   * (no se puede volver a preguntar por código — hay que cambiarlo en los ajustes
   * del sitio). Además solo está disponible en contexto seguro: HTTPS o localhost.
   * Por eso cada desenlace tiene aquí su mensaje, en vez de un error genérico.
   */
  function handleGeolocate() {
    if (userPos) {
      // Segundo clic: deja de usar la ubicación y devuelve la lista a su orden natural.
      setUserPos(null);
      setMessage(null);
      return;
    }
    if (!navigator.geolocation || !window.isSecureContext) {
      setMessage('Tu navegador no permite compartir la ubicación en esta página.');
      return;
    }
    setBusy(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(false);
      },
      (err) => {
        setBusy(false);
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? 'No has dado permiso para usar tu ubicación. Puedes activarlo en los ajustes del navegador para este sitio.'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'No hemos podido determinar tu ubicación.'
              : 'La localización ha tardado demasiado. Inténtalo de nuevo.',
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="text-left">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={busy}
            aria-pressed={userPos != null}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-paco-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.08em] text-paco-cream shadow-[3px_3px_0_rgba(15,15,15,0.15)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {GEO_SVG}
            {busy ? 'Buscando…' : userPos ? 'Quitar mi ubicación' : 'Usar mi ubicación'}
          </button>
          <span className="text-xs leading-snug text-paco-dark/50">
            {userPos
              ? 'Puntos ordenados por cercanía a ti.'
              : 'Te pediremos permiso para ordenar los puntos por cercanía.'}
          </span>
        </div>
        {message && (
          <p role="status" className="text-xs leading-snug text-paco-dark/70">
            {message}
          </p>
        )}
      </div>

      {/* Cuerpo: lista + mapa */}
      <div className="grid h-auto gap-6 md:h-150 md:grid-cols-[340px_1fr]">
        <div
          ref={listRef}
          className="order-2 h-70 overflow-y-auto rounded-xl border border-paco-dark/10 bg-paco-dark/2 p-2 md:order-1 md:h-full"
        >
          {visibleStores.length === 0 && (
            <p className="px-4 py-6 text-center text-sm leading-relaxed text-paco-dark/55">
              Todavía no hay puntos de venta publicados.
            </p>
          )}
          {visibleStores.map((s, i) => {
            const isActive = String(s.id) === activeId;
            return (
              <div
                key={s.id}
                data-id={s.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => setActiveId(String(s.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(String(s.id));
                  }
                }}
                className={`flex cursor-pointer items-start gap-3.5 rounded-lg border-b border-paco-dark/6 p-3 transition last:border-b-0 ${isActive ? 'bg-paco-orange/12' : 'hover:bg-paco-dark/4'
                  }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paco-orange text-xs font-extrabold text-paco-cream">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-paco-dark">{s.name}</span>
                    <span className="shrink-0 rounded-full bg-paco-dark/6 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-paco-dark/55">
                      {cityLabel(s.city)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-paco-dark/55">{s.address}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {s.dist != null ? (
                      <span className="text-xs font-extrabold uppercase tracking-wide text-paco-orange">
                        {formatDistance(s.dist)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <a
                      href={s.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 border-b border-paco-dark/30 text-xs font-bold text-paco-dark transition hover:border-paco-orange hover:text-paco-orange"
                    >
                      Cómo llegar →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <StoreMap
          stores={visibleStores}
          activeId={activeId}
          onSelect={setActiveId}
          userPos={userPos}
          className="order-1 z-0 block h-75 w-full md:order-2 md:h-full"
        />
      </div>
    </div>
  );
}

/**
 * Desplaza el ítem activo dentro del contenedor de la lista SIN mover la ventana.
 * (Usar `scrollIntoView` arrastraba toda la página hasta la sección al seleccionar
 * un punto, porque la lista está por debajo del pliegue.)
 */
function scrollItemIntoList(list: HTMLElement | null, id: string) {
  const item = list?.querySelector<HTMLElement>(`[data-id="${id}"]`);
  if (!list || !item) return;
  const itemRect = item.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  if (itemRect.top < listRect.top) {
    list.scrollTop += itemRect.top - listRect.top;
  } else if (itemRect.bottom > listRect.bottom) {
    list.scrollTop += itemRect.bottom - listRect.bottom;
  }
}
