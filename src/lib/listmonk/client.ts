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
// Plantilla transaccional (tipo `tx`) del correo de confirmación/bienvenida.
const TX_TEMPLATE_ID = process.env.LISTMONK_TX_TEMPLATE_ID;

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

/**
 * Envía el correo transaccional de confirmación/bienvenida (plantilla `tx`
 * `LISTMONK_TX_TEMPLATE_ID`) al recién suscrito, vía `POST /api/tx` de Listmonk.
 *
 * Best-effort: es un extra tras el alta, no debe hacer fallar la suscripción. El
 * caller debe capturar la excepción y seguir devolviendo éxito al usuario. Si la
 * plantilla no está configurada, no hace nada (no rompe entornos sin la env).
 */
export async function sendConfirmationEmail(email: string): Promise<void> {
  if (!API_URL || !API_USER || !API_TOKEN) {
    throw new Error('Listmonk no está configurado (faltan variables LISTMONK_*)');
  }
  if (!TX_TEMPLATE_ID) {
    // Sin plantilla configurada: se omite el correo de confirmación en silencio.
    return;
  }

  const base = API_URL.replace(/\/$/, '');
  const res = await fetch(`${base}/api/tx`, {
    method: 'POST',
    headers: {
      Authorization: `token ${API_USER}:${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriber_email: email,
      template_id: Number(TX_TEMPLATE_ID),
      content_type: 'html',
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Listmonk tx ${res.status}: ${text.slice(0, 200)}`);
  }
}
