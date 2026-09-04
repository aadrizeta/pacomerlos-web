/**
 * Carga perezosa de la **Google Maps JavaScript API** (Dynamic Maps).
 *
 * Se inyecta el `<script>` una sola vez por pestaña y se cachea la promesa: en
 * React 19 + StrictMode los efectos se montan dos veces en desarrollo, y sin este
 * singleton se cargaría el script dos veces (Google avisa por consola y se
 * contabilizarían dos cargas de mapa contra la cuota).
 *
 * La carga es en cliente a propósito: la key es **necesariamente pública** (viaja
 * en el bundle y en las peticiones de red). La barrera de seguridad real es la
 * restricción por dominio + restricción a "Maps JavaScript API" en Google Cloud,
 * no el secreto de la clave.
 */

/** Nombre del callback global que la API invoca al terminar de cargar. */
const CALLBACK = '__pacoGoogleMapsReady';

type MapsNamespace = typeof google.maps;

let loading: Promise<MapsNamespace> | null = null;

/**
 * Map ID con el estilo *cloud-based* (POIs ocultos, calles y transporte visibles).
 *
 * ⚠️ `AdvancedMarkerElement` **no se renderiza sin un `mapId` válido**. Si la env no
 * está definida se recurre a `DEMO_MAP_ID`, el id que Google reserva para pruebas:
 * el mapa funciona y los marcadores se ven, pero con el estilo por defecto (con
 * POIs). Es una red de seguridad para desarrollo, no para producción.
 */
export function googleMapId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
}

export function loadGoogleMaps(): Promise<MapsNamespace> {
  if (loading) return loading;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está definida'));
  }

  loading = new Promise<MapsNamespace>((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    w[CALLBACK] = () => {
      delete w[CALLBACK];
      resolve(google.maps);
    };

    const script = document.createElement('script');
    // `libraries=marker` trae AdvancedMarkerElement; `loading=async` evita el aviso
    // de carga bloqueante; `language`/`region` fuerzan los textos del mapa en español.
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(key)}` +
      '&v=weekly&libraries=marker&language=es&region=ES' +
      `&loading=async&callback=${CALLBACK}`;
    script.async = true;
    script.onerror = () => {
      // Permite reintentar en un remontaje posterior (p. ej. tras recuperar la red).
      loading = null;
      reject(new Error('No se pudo cargar la Google Maps JavaScript API'));
    };
    document.head.appendChild(script);
  });

  return loading;
}
