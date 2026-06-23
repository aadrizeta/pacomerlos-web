# Proyecto: Web Paco Merlos (Next.js + Directus)

## Backend / CMS

- Directus corriendo en Docker en VPS, con MariaDB propia.
- Expuesto vía Apache (reverse proxy) con SSL (Certbot).
- URL base API: <https://cms.pacomerlos.com>

## Colecciones principales

### carousel_slides

Slides del banner hero. Campos relevantes:

- id, sort, status (draft|published), is_featured (bool)
- title, description, button_function
- img_mobile, img_tablet, img_desktop (UUIDs de assets de Directus)
- title_color_preset (hex predefinido), title_color_custom (hex personalizado validado)
- description_color_preset (hex predefinido), description_color_custom (hex personalizado validado)

Reglas de color (a aplicar en el adaptador del frontend):

- El frontend resuelve el color final con esta prioridad: custom > preset > fallback
- title:       title_color_custom       ?? title_color_preset       ?? "#0F0F0F"
- description: description_color_custom ?? description_color_preset ?? "#0F0F0F"
- El componente nunca recibe null en los colores — el fallback garantiza un valor siempre válido

### paquitos_data

Catálogo de productos. Campos:

- id, name, tagline, image_main (UUID)
- general_description, interior_description, topping_description
- primary_color, secondary_color (string, código hex — pueden ser null)

## Flujo de aprobación de contenido (draft → published)

1. Equipo crea/edita slide → status = draft
2. Frontend DESARROLLO: filter[status][_in]=draft,published
3. Equipo aprueba → status = published
4. Frontend PRODUCCIÓN: filter[status][_eq]=published

## Lógica de ordenación del carrusel (Next.js)

1º criterio: is_featured (true antes que false)
2º criterio: sort (desempate dentro de cada grupo)

finalOrder = [...featuredSlides, fixedSlide, ...normalSlides]

## Principio arquitectónico

El backend (Directus) devuelve SOLO datos puros: status, sort, is_featured,
textos y UUIDs de imagen. Directus NO indica componente, layout ni
comportamiento visual.

El frontend Next.js es responsable de:

- Transformar UUIDs de Directus en URLs de assets (<https://cms.pacomerlos.com/assets/><uuid>)
- Aplicar la lógica de ordenación (is_featured + sort)
- Seleccionar imagen según breakpoint (mobile/tablet/desktop)
- Decidir el renderizado completo (componentes, estilos, comportamiento)

## Convenciones

- Variables de entorno: NEXT_PUBLIC_DIRECTUS_URL=<https://cms.pacomerlos.com>
- Distinguir entorno dev (draft+published) vs prod (solo published) vía variable de entorno o parámetro de fetch.

## Infraestructura de rendimiento y caché

### Cloudflare como proxy frente a `cms.pacomerlos.com`

Cloudflare está delante del VPS (proxy naranja activo). Aporta DDoS, SSL en edge,
oculta la IP del origen y descarga tráfico de assets.

#### Cache Rules configuradas (orden importa)

1. **Bypass Directus API** (prioridad más alta — debe ir arriba):
   - Match: `http.host eq "cms.pacomerlos.com"` AND `URI Path` starts_with cualquiera de:
     `/items/`, `/graphql`, `/users`, `/auth`, `/server`, `/collections`, `/fields`, `/files`
   - Acción: **Bypass cache**
   - Motivo: garantiza que cualquier edición en Directus es inmediata.

2. **Cache Directus assets**:
   - Match: `http.host eq "cms.pacomerlos.com"` AND `URI Path` starts_with `/assets/`
   - Acción: Eligible for cache, Edge TTL 1 mes, Browser TTL 1 día.
   - Es seguro porque Directus asigna UUID inmutable a cada archivo: subir una
     imagen nueva genera una URL nueva, sin colisión con la cacheada.

### Headers Cache-Control en Apache (origen)

En el vhost de `cms.pacomerlos.com` (`/etc/apache2/sites-available/cms.pacomerlos.com-le-ssl.conf`):

```apache
# Requiere mod_headers (sudo a2enmod headers)

<LocationMatch "^/assets/">
    Header unset Cache-Control
    Header set Cache-Control "public, max-age=2592000, immutable"
</LocationMatch>

<LocationMatch "^/(items|graphql|users|auth|server|collections|fields|files)(/|$)">
    Header unset Cache-Control
    Header unset Pragma
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
</LocationMatch>
```

Nota: usar `Header unset` + `Header set` **sin** `always` para que sobrescriba
los headers que Directus envía por defecto (que viven en `headers_out`, no en
`err_headers_out`).

### Verificación rápida

```bash
# Asset: primera vez MISS, segunda HIT
curl -I https://cms.pacomerlos.com/assets/<UUID-real>

# API: siempre DYNAMIC o BYPASS (nunca HIT)
curl -I https://cms.pacomerlos.com/items/carousel_slides
```

### Principio de frescura de datos

- Cualquier edición en colecciones de Directus (`carousel_slides`, `paquitos_data`, etc.)
  se sirve **sin caché de edge** → el cliente la ve en cuanto Next.js revalida (ISR).
- Solo los binarios (`/assets/<uuid>`) se cachean en edge, y siempre con URL
  inmutable por UUID.
- Si en algún momento se reemplaza el binario de un asset existente manteniendo
  el mismo UUID, hay que purgar manualmente desde Cloudflare o vía API.

### ISR en Next.js

- `revalidate: 30` segundos en `src/app/page.tsx` y en el `fetch` de slides.
- Combinado con el bypass de Cloudflare: el cliente nunca espera más de 30s
  para ver cambios de contenido en Directus.

### Renderizado de imágenes en el frontend

Estrategia de assets del carrusel (`CarouselSlide.tsx`):

- `<picture>` con `<source media>` para mobile/tablet/desktop. El navegador
  descarga **solo la variante** que coincide con el viewport actual y reevalúa
  al cambiar de tamaño.
- URLs generadas con transformaciones de Directus:
  `<uuid>?width=<px>&format=webp&quality=80`. Anchos por breakpoint: 768 / 1280 / 1920.
- Se usa `<img>` plano en vez de `next/image` (o `next/image` con `unoptimized`)
  para que la petición vaya **directa a Cloudflare/Directus** en lugar de pasar
  por `/_next/image`. Así la caché del edge sirve al cliente final sin saltos
  intermedios por el servidor Next.js.
- `fetchPriority="high"` + `loading="eager"` en la primera slide (LCP).
  El resto, `loading="lazy"`.

`MainBanner.tsx`: Server Component. La selección aleatoria del fondo se hace
a nivel de módulo (fuera del componente) para evitar que el React Compiler
de Next.js rechace `Math.random()` como función impura dentro del render.
El fondo rota en cada nuevo deploy o restart del servidor (no por ISR);
todos los usuarios ven el mismo fondo durante la vida del proceso (aceptable;
si en el futuro se quiere aleatoriedad por usuario habrá que usar un Client
Component o una cookie con seed).

## Despliegue

### Previsualización (Vercel)

- El proyecto está conectado a Vercel **solo para preview**. Producción va en el VPS.
- Cada push genera una URL de preview única.
- Variables de entorno configuradas en Vercel solo para entornos Preview/Development:
  - `NEXT_PUBLIC_DIRECTUS_URL=https://cms.pacomerlos.com`
  - `NEXT_PUBLIC_CONTENT_ENV=development` (muestra drafts + published)
- `vercel.json` tiene `autoAlias: false` para que Vercel no promocione `main` como producción.

### Producción (VPS) — pendiente dockerizar

El frontend Next.js debe dockerizarse para correr en el VPS junto a Directus y MariaDB.
Pasos previstos cuando se acometa:

1. Añadir `output: 'standalone'` en `next.config.ts` para imagen mínima.
2. Crear `Dockerfile` multistage (builder + runner sobre Node Alpine).
3. Integrar el servicio `nextjs` en el `docker-compose.yml` existente del VPS,
   en la misma red interna que Directus.
4. Configurar Apache como reverse proxy hacia el contenedor Next.js (puerto 3000),
   con SSL vía Certbot, igual que `cms.pacomerlos.com`.
5. Variables de entorno de producción:
   - `NEXT_PUBLIC_DIRECTUS_URL=https://cms.pacomerlos.com`
   - `NEXT_PUBLIC_CONTENT_ENV=production` (solo published)

## Newsletter de lanzamiento (Listmonk) — IMPLEMENTADO

Captura de emails para avisar del lanzamiento global del producto. El flujo
mínimo ya funciona: las altas llegan a Listmonk y, al poner la web en `launched`,
un Directus Flow arranca la campaña y se envían los correos (verificado: los
correos de prueba llegaron en el momento de cambiar el status a `launched`).

### Arquitectura del flujo

```
Usuario → ① POST /api/notify { email, website(honeypot) }
       → Next.js Route Handler (valida email + honeypot + rate-limit por IP)
       → Listmonk Admin API (alta en lista de lanzamiento, creds server-only)

Admin → ② pone launch_status = "launched" en Directus (singleton site_settings)
      → Directus Flow (trigger update, condición launch_status == launched)
      → PUT /api/campaigns/{id}/status {status:"running"} en Listmonk
      → Listmonk envía la campaña a la lista
```

Estado actual del singleton (verificado vía API):
`site_settings` = `{ launch_status: "launched", campaign_sent: true }`.

### Funciones / archivos implementados (Next.js)

- `src/lib/listmonk/client.ts` — `subscribeToLaunchList(email)`: helper
  server-side de la Admin API de Listmonk. Auth `Authorization: token <user>:<token>`.
  `POST /api/subscribers` con `status:"enabled"`, `lists:[LIST_ID]` y
  `preconfirm_subscriptions:true` (necesario para single opt-in). Trata el 409 /
  "already exists" como éxito (`alreadySubscribed:true`). Lanza si faltan las
  variables `LISTMONK_*`.
- `src/app/api/notify/route.ts` — Route Handler `POST` (`runtime:'nodejs'`,
  `dynamic:'force-dynamic'`). Rate-limit en memoria (5 peticiones/60s por IP vía
  `x-forwarded-for`), honeypot (campo `website`: si trae valor responde `ok`
  silencioso sin dar pistas), validación de email (regex + máx 254 chars,
  normaliza a minúsculas), delega en `subscribeToLaunchList`. Devuelve
  `{ ok, alreadySubscribed }` o error con código adecuado.
- `src/components/layout/Footer/NotifyForm.tsx` — client component con input
  email + honeypot oculto + estados `idle|loading|success|error`. Mensajes
  distintos para alta nueva vs. ya suscrito. Estilos `paco-purple`/`paco-cream`.
- `src/components/layout/Footer/Footer.tsx` — renderiza `<NotifyForm />`.

### Variables de entorno (server-only, sin `NEXT_PUBLIC_`)

`LISTMONK_API_URL`, `LISTMONK_API_USER`, `LISTMONK_API_TOKEN`, `LISTMONK_LIST_ID`.
En prod (VPS) `LISTMONK_API_URL` puede ser interno (`http://listmonk:9000`); en
preview, la URL pública. (`LISTMONK_CAMPAIGN_ID` lo usa el Directus Flow, no el repo.)

### Pendiente dentro de este flujo (ver ToDo)

- **RGPD**: el formulario aún **no** incluye el checkbox de consentimiento
  obligatorio ni el enlace a `/privacidad`; falta también actualizar `/privacidad`
  con el tratamiento de datos del newsletter.
- **Render condicional por `launch_status`**: no existe `getLaunchSettings()` ni
  `src/types/launch.ts`; el frontend todavía no muestra/oculta secciones según el
  estado. El formulario se muestra siempre en el Footer.
- **Plantillas de email de Listmonk**: falta diseñar el email de confirmación de
  alta y el de notificación de lanzamiento.

### Infra VPS (configurada aparte; no se aplica desde este repo)

- Servicios `listmonk` + `listmonk_db` (Postgres) en el `docker-compose` del VPS,
  red interna de Directus. vhost Apache `lists.pacomerlos.com` (Certbot) → proxy a
  `listmonk:9000` (proteger `/admin`). Cloudflare: subdominio `lists` con bypass.
- Remitente `From: Paco Merlos <newsletter@pacomerlos.com>`, `Reply-To: info@pacomerlos.com`.
- Listmonk: lista "Lanzamiento Paco Merlos" (single opt-in), SMTP `newsletter@`,
  campaña de lanzamiento. Entregabilidad: SPF, DKIM y DMARC para `pacomerlos.com`.
- Directus: singleton `site_settings` con `launch_status` (enum) + `campaign_sent`
  (bool). Lectura pública. Flow: trigger update + condición `launch_status==launched`
  → Request a Listmonk para arrancar la campaña.

## ToDo

- [ ] **Probar funcionalidad del formulario con el backend**: verificar el flujo
  completo de suscripción end-to-end — envío desde `EmailInput.tsx` → Route Handler
  `/api/notify` → Listmonk Admin API → alta en lista. Comprobar también los casos
  edge: email ya suscrito (respuesta `alreadySubscribed`), rate-limit (429), honeypot
  y validación de email inválido.
- [ ] **Componentes condicionados por `launch_status`**: construir componentes que se
  muestren u oculten según el estado de la página (`coming_soon` | `launched`).
  - `src/types/launch.ts` — `LaunchStatus`, `LaunchSettings`.
  - `src/lib/directus/queries.ts` — `getLaunchSettings()` (lee el singleton
    `site_settings`, mismo patrón que `getCarouselSlides`, ISR 30s).
  - `src/app/page.tsx` (y donde aplique) — render condicional: en `coming_soon`
    mostrar "Avísame"; en `launched` el contenido normal (decidir si además banner
    "¡Ya disponible!").
- [ ] **Email de confirmación de alta en la newsletter**: diseñar y crear la plantilla
  (Listmonk) que se envía al darse de alta, confirmando la suscripción. Remitente
  `newsletter@`, enlace de baja nativo de Listmonk.
- [ ] **Email de notificación de lanzamiento**: diseñar y crear la plantilla/campaña
  (Listmonk) que se envía a la lista cuando el producto pasa a `launched` ("¡Ya
  disponible!"). Es la campaña que arranca el Directus Flow.
- [ ] **Paquito destacado / edición limitada**: diferenciar visualmente un paquito nuevo o por tiempo limitado del resto del catálogo.
  - **Directus**: añadir campos a `paquitos_data`: `is_new` (bool) y/o `is_limited` (bool) + opcionalmente `badge_label` (string, ej. "Nuevo", "Edición limitada").
  - **Frontend**: variante visual en `PacoCard.tsx` (desktop) y `PacoCardMobileAlt.tsx` (mobile) — puede ser un badge/ribbon, borde especial, animación sutil, etc.
  - **Tipos**: actualizar `src/types/paquitos.ts` con los nuevos campos.
  - **Query**: actualizar `getPaquitos()` en `src/lib/directus/queries.ts` para incluir los nuevos campos en el `fields[]`.
- [ ] **Diseñar imagen OG** (`public/img/PACOSJUNTOS.png`): imagen de 1200×630 px para la previsualización al compartir enlaces en redes sociales. Referenciada en `og:image` de `page.tsx` y `sabores/page.tsx`. Debe verse bien en proporción 1.91:1; evitar texto importante en los bordes.

## Próximos pasos

### CTA general hacia `/sabores` desde la home

En `src/components/layout/LandingPage/PaquitoGalery/paquitosGalery.tsx` — añadir
un `Link` (`next/link`) hacia `/sabores` como CTA general de la sección
(ubicación a decidir: bajo el carrusel o como botón al lado del título "Conoce cada uno").

Nota: considerar `scroll-margin-top` en los bloques destino de `/sabores` si el
scroll al anchor no compensa la altura de la barra fija (`header`).
