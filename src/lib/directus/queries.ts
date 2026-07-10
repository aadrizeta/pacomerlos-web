import type { CarouselSlide, CarouselSlideRaw } from '@/types/carousel';
import type { Paquito } from '@/types/paquitos';
import type { LaunchSettings } from '@/types/launch';
import { directusFetch } from './client';
import { statusFilter, targetFilter } from './status';
import { slugify } from '@/lib/slug';

/** Forma cruda que devuelve la API (sin el `slug`, que se calcula en frontend). */
type PaquitoRaw = Omit<Paquito, 'slug'>;

const COLOR_FALLBACK = '#0F0F0F';
// Color de contorno por defecto (paco-orange, en sync con --paco-orange de globals.css).
const OUTLINE_FALLBACK = '#ff4e1b';

const CAROUSEL_FIELDS = [
  'id', 'sort', 'is_featured',
  'title', 'description', 'button_function',
  'img_mobile', 'img_tablet', 'img_desktop',
  // Color de escritorio (≥1024px)
  'title_color_preset', 'title_color_custom',
  'description_color_preset', 'description_color_custom',
  // Override opcional tablet/móvil (<1024px)
  'title_color_preset_mobile', 'title_color_custom_mobile',
  'description_color_preset_mobile', 'description_color_custom_mobile',
  // Contorno del título (booleano + color, sin override por breakpoint)
  'title_outline', 'title_outline_color_preset', 'title_outline_color_custom',
].join(',');

// paquitos_data no tiene campo `status` (flujo draft/published) — por eso aquí
// no se aplica statusFilter. Sí tiene `target` (enum dev|prod|both), así que se
// aplica targetFilter() para mostrar solo lo destinado al entorno actual.
const PAQUITO_FIELDS = [
  'id', 'name', 'tagline', 'image_main',
  'general_description', 'interior_description', 'topping_description',
  'primary_color', 'secondary_color',
  'allergens', 'cross_contact',
].join(',');

function toCarouselSlide(raw: CarouselSlideRaw): CarouselSlide {
  const {
    title_color_preset,
    title_color_custom,
    description_color_preset,
    description_color_custom,
    title_color_preset_mobile,
    title_color_custom_mobile,
    description_color_preset_mobile,
    description_color_custom_mobile,
    title_outline,
    title_outline_color_preset,
    title_outline_color_custom,
    ...rest
  } = raw;

  // Desktop: custom > preset > fallback (prioridad original).
  const titleDesktop = title_color_custom ?? title_color_preset ?? COLOR_FALLBACK;
  const descDesktop =
    description_color_custom ?? description_color_preset ?? COLOR_FALLBACK;

  // Mobile/tablet: custom_mobile > preset_mobile > color de escritorio.
  return {
    ...rest,
    title_color_desktop: titleDesktop,
    title_color_mobile:
      title_color_custom_mobile ?? title_color_preset_mobile ?? titleDesktop,
    description_color_desktop: descDesktop,
    description_color_mobile:
      description_color_custom_mobile ??
      description_color_preset_mobile ??
      descDesktop,
    // Contorno del título: custom > preset > paco-orange. El booleano decide si
    // se renderiza (el color siempre queda resuelto, nunca null).
    title_outline: Boolean(title_outline),
    title_outline_color:
      title_outline_color_custom ?? title_outline_color_preset ?? OUTLINE_FALLBACK,
  };
}

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  try {
    const { data } = await directusFetch<CarouselSlideRaw[]>(
      '/items/carousel_slides',
      { params: { ...statusFilter(), ...targetFilter(), fields: CAROUSEL_FIELDS } },
    );
    return data.map(toCarouselSlide);
  } catch (err) {
    console.error('[getCarouselSlides]', err);
    return [];
  }
}

export async function getPaquitos(): Promise<Paquito[]> {
  try {
    const { data } = await directusFetch<PaquitoRaw[]>('/items/paquitos_data', {
      params: { ...targetFilter(), fields: PAQUITO_FIELDS },
    });
    return data.map((p) => ({ ...p, slug: slugify(p.name) }));
  } catch (err) {
    console.error('[getPaquitos]', err);
    return [];
  }
}

/**
 * Lee el singleton `site_settings` (lectura pública en Directus). Devuelve un
 * objeto, no un array. Si falla, degrada a `coming_soon` (nunca revela contenido
 * de lanzamiento por un error de red).
 */
export async function getLaunchSettings(): Promise<LaunchSettings> {
  try {
    const { data } = await directusFetch<{
      launch_status?: string;
      campaign_sent?: boolean;
    }>('/items/site_settings', {
      params: { fields: 'launch_status,campaign_sent' },
    });
    return {
      launch_status: data.launch_status === 'launched' ? 'launched' : 'coming_soon',
      campaign_sent: Boolean(data.campaign_sent),
    };
  } catch (err) {
    console.error('[getLaunchSettings]', err);
    return { launch_status: 'coming_soon', campaign_sent: false };
  }
}
