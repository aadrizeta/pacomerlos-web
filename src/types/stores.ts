/**
 * Punto de venta del localizador "Encuéntralos".
 *
 * Fuente de verdad: colección `store_locations` de Directus (colección plana, sin
 * relaciones). El backend devuelve SOLO datos puros; la normalización (coordenadas
 * a número, etiquetas de ciudad, orden) es responsabilidad del frontend.
 */

/**
 * Forma **cruda** tal cual la devuelve `GET /items/store_locations`.
 *
 * ⚠️ Dos trampas del esquema real:
 *  - el campo de dirección se llama `store_adress` (una sola `d`), no `address`;
 *  - `latitude` / `longitude` llegan como **string**, no como número.
 */
export interface StoreLocationRaw {
  id: number;
  city: string;
  store_name: string;
  store_adress: string;
  latitude: string;
  longitude: string;
  maps_url: string | null;
}

/** Punto de venta ya normalizado para el frontend (coordenadas numéricas). */
export interface Store {
  id: number;
  /** Nombre del punto de venta (p. ej. "La Fresería Chueca"). */
  name: string;
  /** Dirección legible. */
  address: string;
  /** Slug de ciudad para el filtro: `madrid`, `barcelona`, … */
  city: string;
  lat: number;
  lng: number;
  /**
   * Enlace de Google Maps del punto ("Cómo llegar"). Si la colección no lo trae,
   * el adaptador genera uno con las coordenadas, así que nunca es null.
   */
  mapsUrl: string;
}

/**
 * Etiquetas visibles de las ciudades conocidas (los slugs llegan en minúsculas y
 * sin acentos desde Directus). Una ciudad que no esté aquí no rompe nada: se
 * capitaliza su slug automáticamente (ver `cityLabel`).
 *
 * Hoy solo se usa para la etiqueta de cada punto en la lista; el filtro por ciudad
 * se retiró a la espera de su rediseño.
 */
const CITY_LABELS: Record<string, string> = {
  madrid: 'Madrid',
  barcelona: 'Barcelona',
  sevilla: 'Sevilla',
  valencia: 'Valencia',
  malaga: 'Málaga',
  zaragoza: 'Zaragoza',
  bilbao: 'Bilbao',
};

/** Etiqueta visible de una ciudad a partir de su slug. */
export function cityLabel(slug: string): string {
  return CITY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
