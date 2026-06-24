import type { DirectusResponse } from '@/types/directus';

const BASE = process.env.NEXT_PUBLIC_DIRECTUS_URL;

export interface DirectusFetchOptions {
  params?: Record<string, string>;
  revalidate?: number;
}

export async function directusFetch<T>(
  path: string,
  options: DirectusFetchOptions = {},
): Promise<DirectusResponse<T>> {
  if (!BASE) {
    throw new Error('NEXT_PUBLIC_DIRECTUS_URL no está definida');
  }
  const { params, revalidate = 30 } = options;
  const base = BASE.replace(/\/$/, '');
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const url = `${base}${path}${qs}`;
  // Timeout para que un origen lento no bloquee el render del Server Component.
  // Al saltar, el caller (getCarouselSlides/getPaquitos) degrada con su catch → [].
  const res = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Directus ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}
