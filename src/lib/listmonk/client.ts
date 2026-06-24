/**
 * Helper server-side para la Admin API de Listmonk.
 *
 * Las credenciales son **server-only** (sin NEXT_PUBLIC_): solo deben usarse
 * desde route handlers / server components, nunca desde el navegador.
 *
 * Auth de Listmonk v6: header `Authorization: token <usuario>:<token>`.
 */

const API_URL = process.env.LISTMONK_API_URL;
const API_USER = process.env.LISTMONK_API_USER;
const API_TOKEN = process.env.LISTMONK_API_TOKEN;
const LIST_ID = process.env.LISTMONK_LIST_ID;

export interface SubscribeResult {
  ok: true;
  /** true si el email ya estaba dado de alta previamente. */
  alreadySubscribed: boolean;
}

/**
 * Da de alta un email en la lista de lanzamiento (single opt-in).
 * Si el email ya existe, se trata como éxito (`alreadySubscribed: true`).
 */
export async function subscribeToLaunchList(email: string): Promise<SubscribeResult> {
  if (!API_URL || !API_USER || !API_TOKEN || !LIST_ID) {
    throw new Error('Listmonk no está configurado (faltan variables LISTMONK_*)');
  }

  const base = API_URL.replace(/\/$/, '');
  const res = await fetch(`${base}/api/subscribers`, {
    method: 'POST',
    headers: {
      Authorization: `token ${API_USER}:${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name: email.split('@')[0],
      status: 'enabled',
      lists: [Number(LIST_ID)],
      // marca la suscripción como confirmada (necesario para single opt-in)
      preconfirm_subscriptions: true,
    }),
    cache: 'no-store',
    // Si Listmonk se cuelga, no dejamos la request del usuario colgada:
    // el caller (route handler) lo traduce en un 502 controlado.
    signal: AbortSignal.timeout(8000),
  });

  if (res.ok) return { ok: true, alreadySubscribed: false };

  // Listmonk devuelve 409 (o un mensaje con "already exists") si el email ya existe.
  const text = await res.text().catch(() => '');
  if (res.status === 409 || /already exists/i.test(text)) {
    return { ok: true, alreadySubscribed: true };
  }

  throw new Error(`Listmonk ${res.status}: ${text.slice(0, 200)}`);
}
