'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DivIcon, Map as LeafletMap, Marker } from 'leaflet';
import { CHAINS, type ChainFilter, type ChainId, type Store } from '@/types/stores';
import { distanceKm, formatDistance } from '@/lib/stores/geo';

interface StoreLocatorProps {
  stores: Store[];
}

type RankedStore = Store & { dist?: number };
type LeafletNS = typeof import('leaflet');

const MADRID: [number, number] = [40.4168, -3.7038];
const GEO_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="8" strokeOpacity=".3" />
  </svg>
);

function storeDivIcon(L: LeafletNS, color: string, active: boolean): DivIcon {
  const size = active ? 26 : 20;
  const html = active
    ? `<div style="width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid ${color};box-shadow:0 3px 12px rgba(0,0,0,.5)"></div>`
    : `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45)"></div>`;
  return L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

export default function StoreLocator({ stores }: StoreLocatorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const leaflet = useRef<LeafletNS | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const userMarker = useRef<Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [chain, setChain] = useState<ChainFilter>('all');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<'geo' | 'search' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Cadenas presentes en los datos (para no pintar chips de cadenas sin tiendas).
  const presentChains = useMemo(() => {
    const ids = new Set<ChainId>();
    stores.forEach((s) => ids.add(s.chain));
    return (Object.keys(CHAINS) as ChainId[]).filter((id) => ids.has(id));
  }, [stores]);

  // Lista visible: filtrada por cadena y, si hay ubicación, con distancia y orden.
  const visibleStores = useMemo<RankedStore[]>(() => {
    const filtered = stores.filter((s) => chain === 'all' || s.chain === chain);
    if (!userPos) return filtered;
    return filtered
      .map((s) => ({ ...s, dist: distanceKm(userPos.lat, userPos.lng, s.lat, s.lng) }))
      .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
  }, [stores, chain, userPos]);

  // ── Inicializa el mapa una sola vez (Leaflet se importa en cliente) ──
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;
    (async () => {
      const L = (await import('leaflet')).default;
      // En táctil (móvil/tablet) se exige mover el mapa con dos dedos: un dedo
      // desplaza la página. En escritorio (ratón) el arrastre normal se mantiene.
      const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      if (isTouch) {
        const { GestureHandling } = await import('leaflet-gesture-handling');
        L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
      }
      if (cancelled || !mapRef.current || mapInstance.current) return;
      map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        gestureHandling: isTouch,
        gestureHandlingOptions: {
          text: { touch: 'Usa dos dedos para mover el mapa' },
        },
      }).setView(MADRID, 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);
      leaflet.current = L;
      mapInstance.current = map;
      setMapReady(true);
      setTimeout(() => map?.invalidateSize(), 200);
    })();
    return () => {
      cancelled = true;
      map?.remove();
      mapInstance.current = null;
      leaflet.current = null;
      markers.current = {};
      userMarker.current = null;
      setMapReady(false);
    };
  }, []);

  // ── Redibuja marcadores cuando cambian las tiendas visibles o la ubicación ──
  useEffect(() => {
    const L = leaflet.current;
    const map = mapInstance.current;
    if (!L || !map) return;

    visibleStores.forEach((s) => {
      const color = CHAINS[s.chain].color;
      const marker = L.marker([s.lat, s.lng], { icon: storeDivIcon(L, color, false) }).addTo(map);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:160px">
           <strong style="font-size:.85rem">${escapeHtml(s.name)}</strong>
           <div style="font-size:.75rem;color:#666;margin:3px 0 8px">${escapeHtml(s.address)}</div>
           <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
              style="display:block;text-align:center;background:${color};color:#fff;font-weight:700;font-size:.75rem;padding:6px 10px;border-radius:6px;text-decoration:none">Cómo llegar →</a>
         </div>`,
      );
      marker.on('click', () => setActiveId(String(s.id)));
      markers.current[String(s.id)] = marker;
    });

    // Marcador del usuario (pin con pulso).
    if (userPos) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div class="enc-user-pin"><div class="enc-user-pulse"></div><div class="enc-user-dot"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      userMarker.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map).bindPopup('Tu ubicación');
    }

    // Encuadre.
    const points: [number, number][] = visibleStores.slice(0, 15).map((s) => [s.lat, s.lng]);
    if (userPos) points.push([userPos.lat, userPos.lng]);
    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }

    // Destaca el más cercano (o el primero) al cambiar ubicación/filtro.
    setActiveId(visibleStores.length ? String(visibleStores[0].id) : null);

    // Cleanup: al reejecutar (cambian las deps) o al desmontar, libera los
    // marcadores y sus listeners (marker.on('click', …)) creados en esta pasada.
    // React ejecuta esto antes del siguiente body y al desmontar → sin fugas.
    return () => {
      Object.values(markers.current).forEach((m) => m.remove());
      markers.current = {};
      userMarker.current?.remove();
      userMarker.current = null;
    };
  }, [visibleStores, userPos, mapReady]);

  // ── Sincroniza el marcador/lista activos sin reconstruir todo ──
  useEffect(() => {
    const L = leaflet.current;
    const map = mapInstance.current;
    if (!L || !map) return;
    Object.entries(markers.current).forEach(([id, marker]) => {
      const store = visibleStores.find((s) => String(s.id) === id);
      if (!store) return;
      marker.setIcon(storeDivIcon(L, CHAINS[store.chain].color, id === activeId));
    });
    if (activeId && markers.current[activeId]) {
      const store = visibleStores.find((s) => String(s.id) === activeId);
      if (store) {
        markers.current[activeId].openPopup();
        map.panTo([store.lat, store.lng], { animate: true });
      }
      scrollItemIntoList(listRef.current, activeId);
    }
  }, [activeId, visibleStores]);

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setMessage('Tu navegador no soporta geolocalización.');
      return;
    }
    setBusy('geo');
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBusy(null);
      },
      () => {
        setBusy(null);
        setMessage('No se pudo obtener tu ubicación. Prueba a buscar por dirección.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setBusy('search');
    setMessage(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.result) {
        setMessage('No encontramos esa dirección.');
      } else {
        setUserPos({ lat: data.result.lat, lng: data.result.lng });
      }
    } catch {
      setMessage('Error al buscar. Inténtalo de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="text-left">
      {/* Filtro por cadena */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-paco-dark/50">Filtrar:</span>
        <ChainChip label="Todos" active={chain === 'all'} onClick={() => setChain('all')} />
        {presentChains.map((id) => (
          <ChainChip key={id} label={CHAINS[id].label} active={chain === id} onClick={() => setChain(id)} />
        ))}
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={busy === 'geo'}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-paco-orange px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.08em] text-paco-cream shadow-[3px_3px_0_rgba(15,15,15,0.15)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {GEO_SVG}
          {busy === 'geo' ? 'Buscando…' : 'Usar mi ubicación'}
        </button>
        <span className="text-center text-xs font-semibold uppercase tracking-widest text-paco-dark/40">o</span>
        <div className="flex min-w-0 flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Escribe tu dirección o ciudad…"
            aria-label="Buscar por dirección o ciudad"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-paco-dark/20 bg-paco-dark/3 px-4 py-2.5 text-paco-dark outline-none transition placeholder:text-paco-dark/40 focus:border-paco-orange focus:bg-paco-dark/5"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={busy === 'search'}
            className="rounded-r-lg border border-paco-dark/20 bg-paco-dark/6 px-4 py-2.5 text-sm font-bold text-paco-dark transition hover:bg-paco-dark/10 disabled:opacity-60"
          >
            {busy === 'search' ? '…' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Cuerpo: lista + mapa */}
      <div className="grid h-auto gap-6 md:h-125 md:grid-cols-[340px_1fr]">
        <div
          ref={listRef}
          className="order-2 h-70 overflow-y-auto rounded-xl border border-paco-dark/10 bg-paco-dark/2 p-2 md:order-1 md:h-full"
        >
          {message && <p className="px-4 py-6 text-center text-sm leading-relaxed text-paco-dark/55">{message}</p>}
          {!message && visibleStores.length === 0 && (
            <p className="px-4 py-6 text-center text-sm leading-relaxed text-paco-dark/55">
              No hay puntos de venta para esta cadena.
            </p>
          )}
          {visibleStores.map((s, i) => {
            const isActive = String(s.id) === activeId;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
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
                      {CHAINS[s.chain].label}
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
                      href={mapsUrl}
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

        <div
          ref={mapRef}
          className="order-1 z-0 block h-75 w-full rounded-xl border border-paco-dark/10 md:order-2 md:h-full"
        />
      </div>
    </div>
  );
}

function ChainChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${active
        ? 'border-paco-orange bg-paco-orange text-paco-cream'
        : 'border-paco-dark/15 bg-transparent text-paco-dark/70 hover:border-paco-orange/50 hover:text-paco-orange'
        }`}
    >
      {label}
    </button>
  );
}

/**
 * Desplaza el ítem activo dentro del contenedor de la lista SIN mover la ventana.
 * (Usar `scrollIntoView` arrastraba toda la página hasta la sección al autoseleccionar
 * el primer punto en el montaje, porque la lista está por debajo del pliegue.)
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

/** Escapa texto para inyectarlo en el HTML del popup de Leaflet (datos externos). */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
