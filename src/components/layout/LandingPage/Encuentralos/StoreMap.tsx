'use client';

import { useEffect, useRef, useState } from 'react';
import type { Store } from '@/types/stores';
import { distanceKm } from '@/lib/stores/geo';
import { googleMapId, loadGoogleMaps } from '@/lib/maps/google-maps';

interface StoreMapProps {
  /** Puntos a pintar (ya filtrados por ciudad en el contenedor). */
  stores: Store[];
  /** Id del punto seleccionado, o null. Abre su ficha y centra el mapa. */
  activeId: string | null;
  /** Se dispara al pulsar un marcador. */
  onSelect: (id: string) => void;
  /** Ubicación del usuario, si la ha compartido. */
  userPos: { lat: number; lng: number } | null;
  className?: string;
}

/** Centro por defecto mientras no hay puntos que encuadrar (Puerta del Sol). */
const MADRID = { lat: 40.4168, lng: -3.7038 };
/** Zoom máximo al encuadrar: con un solo punto, `fitBounds` se acercaría demasiado. */
const MAX_FIT_ZOOM = 15;

type MapsNS = typeof google.maps;
type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;

/** Marcador de punto de venta (HTML propio: `AdvancedMarkerElement` acepta un nodo). */
function pinElement(active: boolean): HTMLElement {
  const el = document.createElement('div');
  el.className = active ? 'enc-pin enc-pin--active' : 'enc-pin';
  return el;
}

/**
 * Ficha del punto de venta dentro del InfoWindow.
 *
 * Se construye por DOM (`textContent`), no por HTML: los textos vienen del CMS y
 * así no hay que escaparlos a mano. El enlace "Cómo llegar" apunta al `maps_url`
 * de la colección (enlace externo: sin coste ni cuota de Directions API).
 */
function infoContent(store: Store): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'enc-info';

  const name = document.createElement('p');
  name.className = 'enc-info__name';
  name.textContent = store.name;

  const address = document.createElement('p');
  address.className = 'enc-info__address';
  address.textContent = store.address;

  const link = document.createElement('a');
  link.className = 'enc-info__cta';
  link.href = store.mapsUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Cómo llegar →';

  wrap.append(name, address, link);
  return wrap;
}

/** Marcador de la ubicación del usuario (pin con pulso, estilos en globals.css). */
function userPinElement(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'enc-user-pin';
  const pulse = document.createElement('div');
  pulse.className = 'enc-user-pulse';
  const dot = document.createElement('div');
  dot.className = 'enc-user-dot';
  el.append(pulse, dot);
  return el;
}

/** Encuadra una lista de puntos sin pasarse de zoom. */
function fitTo(maps: MapsNS, map: google.maps.Map, points: { lat: number; lng: number }[]) {
  if (points.length === 0) return;
  const bounds = new maps.LatLngBounds();
  points.forEach((p) => bounds.extend(p));
  map.fitBounds(bounds, 48);
  // `fitBounds` es asíncrono: el zoom definitivo no está disponible hasta el
  // siguiente `idle`, así que el tope se aplica ahí.
  maps.event.addListenerOnce(map, 'idle', () => {
    if ((map.getZoom() ?? 0) > MAX_FIT_ZOOM) map.setZoom(MAX_FIT_ZOOM);
  });
}

export default function StoreMap({
  stores,
  activeId,
  onSelect,
  userPos,
  className = '',
}: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapsRef = useRef<MapsNS | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<Record<string, AdvancedMarker>>({});
  const userMarkerRef = useRef<AdvancedMarker | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // `onSelect` se guarda en un ref para que el efecto de marcadores no dependa de
  // la identidad de la función (si no, cada render del padre recrearía los pines).
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // ── Crea el mapa una sola vez ──
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: MADRID,
          zoom: 12,
          mapId: googleMapId(),
          // En táctil exige dos dedos para mover el mapa (un dedo desplaza la
          // página) y en escritorio ctrl + rueda para el zoom. Equivalente nativo
          // del plugin `leaflet-gesture-handling` que se usaba antes.
          gestureHandling: 'cooperative',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        infoRef.current = new maps.InfoWindow({ maxWidth: 260 });
        mapsRef.current = maps;
        setReady(true);
      })
      .catch((err) => {
        console.error('[StoreMap]', err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Pinta los marcadores y encuadra cada vez que cambian los puntos visibles ──
  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;

    stores.forEach((store) => {
      const marker = new maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: store.lat, lng: store.lng },
        title: store.name,
        content: pinElement(false),
        gmpClickable: true,
      });
      marker.addListener('gmp-click', () => onSelectRef.current(String(store.id)));
      markersRef.current[String(store.id)] = marker;
    });

    fitTo(maps, map, stores);

    // Cleanup: al cambiar el filtro (o desmontar) se sueltan los marcadores de la
    // pasada anterior. `marker.map = null` los desengancha junto con su listener.
    return () => {
      Object.values(markersRef.current).forEach((m) => {
        m.map = null;
      });
      markersRef.current = {};
      infoRef.current?.close();
    };
  }, [stores, ready]);

  // ── Marcador del usuario ──
  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    if (!maps || !map || !userPos) return;

    userMarkerRef.current = new maps.marker.AdvancedMarkerElement({
      map,
      position: userPos,
      title: 'Tu ubicación',
      content: userPinElement(),
      zIndex: 1000,
    });

    // Encuadra la ubicación con los 3 puntos más cercanos: si el usuario está
    // lejos de la ciudad filtrada, meter TODOS los puntos en el encuadre alejaría
    // el mapa hasta dejarlo inútil.
    const nearest = [...stores]
      .sort(
        (a, b) =>
          distanceKm(userPos.lat, userPos.lng, a.lat, a.lng) -
          distanceKm(userPos.lat, userPos.lng, b.lat, b.lng),
      )
      .slice(0, 3);
    fitTo(maps, map, [userPos, ...nearest]);

    return () => {
      if (userMarkerRef.current) userMarkerRef.current.map = null;
      userMarkerRef.current = null;
    };
  }, [userPos, stores, ready]);

  // ── Selección: destaca el pin, abre su ficha y centra el mapa ──
  useEffect(() => {
    const map = mapRef.current;
    const info = infoRef.current;
    if (!map || !info) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.content = pinElement(id === activeId);
      marker.zIndex = id === activeId ? 500 : undefined;
    });

    if (!activeId) {
      info.close();
      return;
    }
    const marker = markersRef.current[activeId];
    const store = stores.find((s) => String(s.id) === activeId);
    if (!marker || !store) return;

    info.setContent(infoContent(store));
    info.open({ map, anchor: marker });
    map.panTo({ lat: store.lat, lng: store.lng });
  }, [activeId, stores, ready]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-paco-dark/10 bg-paco-dark/3 p-6 text-center text-sm text-paco-dark/55 ${className}`}
      >
        No se pudo cargar el mapa. Puedes abrir cada punto de venta con su enlace
        &laquo;Cómo llegar&raquo;.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Mapa de puntos de venta"
      className={`overflow-hidden rounded-xl border border-paco-dark/10 bg-paco-dark/3 ${className}`}
    />
  );
}
