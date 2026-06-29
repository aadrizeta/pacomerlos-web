# Proyecto: Web Paco Merlos (Next.js + Directus)

## Backend / CMS

- Directus corriendo en Docker en VPS, con MariaDB propia.
- Expuesto vía Apache (reverse proxy) con SSL (Certbot).
- URL base API: <https://cms.pacomerlos.com>

## Colecciones principales

### carousel_slides

Slides del banner hero. Campos relevantes:

- id, sort, status (draft|published), is_featured (bool)
- target (enum: dev | prod | both, default dev) — entorno donde se muestra. Ver
  "Targeting por entorno" más abajo.
- title, description, button_function
- img_mobile, img_tablet, img_desktop (UUIDs de assets de Directus)
- **Color de escritorio (≥1024px)** — nombres originales:
  - title_color_preset (hex predefinido), title_color_custom (hex personalizado validado)
  - description_color_preset (hex predefinido), description_color_custom (hex personalizado validado)
- **Override opcional tablet/móvil (<1024px)** — sufijo `_mobile`:
  - title_color_preset_mobile, title_color_custom_mobile
  - description_color_preset_mobile, description_color_custom_mobile

Reglas de color (a aplicar en el adaptador del frontend):

Hay **dos colores por elemento**: uno de escritorio (≥1024px) y un override
opcional para tablet/móvil (<1024px). El corte es en `lg` (1024px), igual que la
`<source media>` de las imágenes.

- Escritorio (prioridad custom > preset > fallback):
  - title_desktop:       title_color_custom       ?? title_color_preset       ?? "#0F0F0F"
  - description_desktop:  description_color_custom ?? description_color_preset ?? "#0F0F0F"
- Móvil/tablet (prioridad custom_mobile > preset_mobile > **color de escritorio**):
  - title_mobile:       title_color_custom_mobile       ?? title_color_preset_mobile       ?? title_desktop
  - description_mobile:  description_color_custom_mobile ?? description_color_preset_mobile ?? description_desktop
- El override móvil es **opcional**: si va vacío, hereda el color de escritorio
  (retrocompatible — los slides existentes siguen funcionando igual).
- El componente nunca recibe null — el fallback garantiza siempre un valor válido.

Render (`CarouselSlide.tsx`): el `toCarouselSlide` resuelve
`title_color_desktop`/`title_color_mobile` (y description). El componente aplica la
clase `.bp-text-color` y pasa ambos colores como CSS vars inline
(`--bp-color-desktop` / `--bp-color-mobile`); el CSS elige según el breakpoint.

> ⚠️ **Orden de despliegue**: crear los 4 campos `_mobile` en Directus **antes** de
> desplegar este frontend. Como se piden en `fields[]`, si no existen, Directus
> responde error y `getCarouselSlides` devuelve `[]`.

#### Disposición recomendada en Directus (UX del editor)

El modelo es de **override opcional con herencia**: el editor SIEMPRE define el
color de escritorio; el de móvil/tablet es opcional y, si se deja vacío, hereda el
de escritorio. Para que esto quede intuitivo en el panel:

1. **Grupo "Color de texto — Escritorio"** (siempre visible): `title_color_preset`,
   `title_color_custom`, `description_color_preset`, `description_color_custom`.
2. **Grupo "Override móvil/tablet (opcional)"** (tipo *Detail Group*, colapsable y
   plegado por defecto): los 4 campos `_mobile`. Añadir una **nota** al grupo:
   *"Déjalo vacío para usar el mismo color que en escritorio. Rellénalo solo si
   quieres un color distinto en pantallas <1024px."*

Esto cubre ambos casos sin lógica extra: **vacío = mismo color**, **relleno =
diferenciado**.

Alternativa (más explícita, opcional): añadir un booleano `color_movil_distinto`
y mostrar los campos `_mobile` solo cuando esté activado (campos condicionales de
Directus). Más visual, pero añade un campo; con grupo colapsable + nota suele
bastar. Si se adopta el booleano, el adaptador del frontend **no** necesita
cambios (la cascada `?? desktop` ya hace lo correcto cuando los `_mobile` van vacíos).

### paquitos_data

Catálogo de productos. Campos:

- id, name, tagline, image_main (UUID)
- target (enum: dev | prod | both, default dev) — entorno donde se muestra. Ver
  "Targeting por entorno" más abajo.
- general_description, interior_description, topping_description
- primary_color, secondary_color (string, código hex — pueden ser null)

## Flujo de aprobación de contenido (draft → published)

1. Equipo crea/edita slide → status = draft
2. Frontend DESARROLLO: filter[status][_in]=draft,published
3. Equipo aprueba → status = published
4. Frontend PRODUCCIÓN: filter[status][_eq]=published

## Targeting por entorno (campo `target`)

Permite decidir **por registro** en qué entorno se visualiza un slide o paquito,
de forma **independiente** del despliegue de Coolify (rama prod vs main).

### Campo en Directus (crear en ambas colecciones)

- Nombre: `target`
- Tipo: enum (dropdown) con valores `dev`, `prod`, `both`
- Default: `dev` (un registro nuevo se ve primero solo en desarrollo; luego se
  promociona a `both` o `prod`)
- Aplicar a: `carousel_slides` **y** `paquitos_data`

> ⚠️ **Orden de despliegue**: crear el campo `target` (con default y backfill de
> los registros existentes) **antes** de desplegar el frontend con el filtro. Si el
> campo no existe, el fetch a Directus falla y `getCarouselSlides`/`getPaquitos`
> devuelven `[]` (degradación controlada, pero la sección sale vacía).

### Semántica del filtro (frontend)

- DESARROLLO (`NEXT_PUBLIC_CONTENT_ENV=development`): `target ∈ (dev, both)`
- PRODUCCIÓN (`NEXT_PUBLIC_CONTENT_ENV=production`): `target ∈ (prod, both)`

| `target` | Se ve en dev | Se ve en prod |
|----------|:---:|:---:|
| `dev`  | ✅ | ❌ |
| `prod` | ❌ | ✅ |
| `both` | ✅ | ✅ |

### Relación con `status` (ortogonal, solo carrusel)

`status` (draft/published) es el **flujo de aprobación**; `target` es el **destino
de entorno**. Se combinan con AND:

- Carrusel en PROD: `status = published` **AND** `target ∈ (prod, both)`
- Carrusel en DEV:  `status ∈ (draft, published)` **AND** `target ∈ (dev, both)`
- Paquitos (sin status): solo `target ∈ (…)` según entorno

### Implementación frontend

- `src/lib/directus/status.ts` — `targetFilter()` devuelve
  `filter[target][_in]=dev,both` (dev) o `prod,both` (prod), según `contentEnv()`.
- `src/lib/directus/queries.ts` — `getCarouselSlides` fusiona
  `{ ...statusFilter(), ...targetFilter() }`; `getPaquitos` aplica `targetFilter()`.
  En Directus, varios `filter[campo]` distintos en la misma query se combinan con AND.

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

### Vídeos de fondo del acordeón (`PanelAcordeon`) — servidos desde Directus

Los vídeos de fondo de los paneles del acordeón (`Panel.tsx`, prop `bgVideo`) se
suben a **Directus** y se referencian como `https://cms.pacomerlos.com/assets/<uuid>`,
**no** se commitean a `public/`. Motivo: son binarios pesados; servirlos desde el
edge de Cloudflare (no desde el servidor Next) evita saturar el ancho de banda del
VPS y mantiene el repo ligero. Se tratan como asset de diseño aunque vivan en el CMS.

#### Por qué no se saturó el origen (palancas, en orden de impacto)

1. **Lazy load en el componente** (la mayor): `Panel.tsx` usa `preload="none"` y solo
   reproduce al abrir (móvil) / hover (desktop). La mayoría de visitantes **nunca
   descargan el vídeo**; solo se pinta el `poster` (.webp, sí transformado por Directus).
2. **Cache Rule de `/assets/` ya los cubre**: la regla existente (Edge TTL 1 mes,
   Browser TTL 1 día, UUID inmutable) matchea `URI Path starts_with /assets/`, así que
   los vídeos heredan la caché de edge **sin regla nueva**.
3. **Tiered Cache (Argo) activado** (Caching → Tiered Cache → ON): sin él, cada PoP de
   Cloudflare hace su propio MISS contra el VPS con tráfico simultáneo global. Con
   Tiered Cache los PoPs tiran de un PoP superior y **el origen sirve ~1 copia por
   vídeo**, no N. Para vídeo es prácticamente obligatorio.
4. **Range requests**: el `<video>` pide por rangos de bytes (`206 Partial Content`).
   Directus/Apache deben devolver `Accept-Ranges: bytes` y `206`; Cloudflare cachea el
   objeto y sirve los rangos desde el edge tras el primer MISS.

#### Verificación

```bash
# Cacheable + acepta rangos
curl -I https://cms.pacomerlos.com/assets/<UUID-video>
#   → Accept-Ranges: bytes · Cache-Control: public, max-age=2592000, immutable

# Petición por rango: 206, y en 2ª llamada cf-cache-status: HIT (no BYPASS/DYNAMIC)
curl -s -D - -o /dev/null -r 0-1023 https://cms.pacomerlos.com/assets/<UUID-video>
```

> ⚠️ **ToS de Cloudflare**: servir *mucho* vídeo cacheado en planes self-serve
> (Free/Pro/Business) puede chocar con la cláusula 2.8 (contenido no-HTML
> desproporcionado); el camino sancionado a volumen es **Cloudflare Stream**. Para los
> clips cortos y lazy-loaded del acordeón es despreciable, pero tenerlo en el radar.

#### Compresión y aligerado de los `.mp4` (Directus NO transforma vídeo)

Directus solo transforma imágenes (`?width=&format=webp`); el vídeo se sirve **tal
cual se sube**, así que hay que optimizarlo **antes** de subirlo. Buenas prácticas:

- **Sin pista de audio**: el vídeo es decorativo y va `muted`. Quitar el audio recorta
  peso y evita problemas de autoplay. `ffmpeg -an`.
- **Resolución ajustada al panel**, no a la fuente: un panel de acordeón rara vez
  necesita >720p (incluso 480–540p basta en móvil). Escalar con `-vf scale=-2:720`
  (alto 720, ancho automático par).
- **Duración corta + loop**: 3–8 s en bucle. Recortar con `-t` / `-ss`.
- **H.264 (`libx264`) con CRF**: `-crf 28..32` (más alto = más comprimido; 28 buen punto
  para fondo). `-preset veryslow` comprime mejor a igualdad de calidad (solo afecta a la
  codificación, no a la reproducción).
- **`-pix_fmt yuv420p`**: compatibilidad universal de reproducción (Safari/iOS incluidos).
- **`-movflags +faststart`**: mueve el `moov atom` al inicio → empieza a reproducir sin
  descargar todo el archivo (clave con range requests).
- **Framerate**: bajar a 24–30 fps si la fuente trae más; `-r 30`.
- **Doble formato opcional**: añadir un `.webm` (VP9/AV1) suele pesar menos que H.264;
  servir ambos y dejar que el navegador elija (requiere ampliar `Panel.tsx` a múltiples
  `<source>`; hoy usa un único `src`).
- **Objetivo de peso**: apuntar a **< 1–2 MB por clip**. Si no baja de ahí, recortar
  duración/resolución antes que subir CRF hasta romper la calidad.

Receta base (sin audio, 720p, H.264, faststart):

```bash
ffmpeg -i fuente.mov \
  -an \
  -vf "scale=-2:720,fps=30" \
  -c:v libx264 -crf 30 -preset veryslow -pix_fmt yuv420p \
  -movflags +faststart \
  panel-fondo.mp4
```

Variante `.webm` (VP9) si se quiere doble formato:

```bash
ffmpeg -i fuente.mov -an -vf "scale=-2:720,fps=30" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 panel-fondo.webm
```

Y genera el **poster** (primer frame) en `.webp` para la prop `poster` de `Panel.tsx`
(o súbelo a Directus y usa la transformación `?format=webp`):

```bash
ffmpeg -i panel-fondo.mp4 -frames:v 1 -q:v 80 panel-poster.webp
```

## Animaciones de scroll (Scroll Reveal) — REUTILIZABLE

Sistema reutilizable para animar la entrada de elementos al hacer scroll
(fade in + translate), portado del proyecto HTML original. Pensado para
aplicarse a cualquier componente nuevo sin recablear lógica.

### Piezas

- **`src/app/globals.css`** (sección `SCROLL REVEAL`, dentro de `@layer components`):
  clases `.sr*` con el estado inicial oculto + `transition`, y `.revealed` que lo
  resetea. El estado oculto está gateado por `.js-ready` → **sin JS el contenido se
  ve siempre** (accesibilidad/SEO). Incluye `@media (prefers-reduced-motion: reduce)`.
- **`src/app/layout.tsx`**: script inline en `<head>` que añade `js-ready` a
  `<html>` **antes de pintar** → evita FOUC (parpadeo del estado oculto).
- **`src/lib/scroll-reveal.ts`**: `observeReveal(el, repeat?)`. Mantiene **un solo
  IntersectionObserver por modo** (one-shot / repeat) reutilizado por todos los
  elementos (más eficiente que uno por elemento). Devuelve función de limpieza.
  - one-shot (`threshold 0.08`): añade `.revealed` al entrar y deja de observar.
  - repeat (`threshold 0.15`): re-anima cada pasada; al salir por abajo (`top > 0`)
    quita `.revealed` para resetear.
- **`src/components/ui/Reveal.tsx`**: componente cliente `<Reveal>`. Los `children`
  se pasan como prop, por lo que **puede envolver Server Components** sin volverlos
  cliente.

### API de `<Reveal>`

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `up` \| `wipe` \| `tilt` \| `tilt-neg` \| `left` \| `right` | `up` | Tipo de efecto |
| `delay` | `1` \| `2` \| `3` | — | Stagger: 0.1 / 0.2 / 0.35 s |
| `repeat` | `boolean` | `false` | Re-anima cada vez que reentra en viewport |
| `as` | `ElementType` | `div` | Etiqueta a renderizar (no romper layout) |
| `className` | `string` | `''` | Clases de estilo, se combinan con la animación |

### Variantes (clase CSS → efecto)

| `variant` | Clase | Efecto | Transición |
|-----------|-------|--------|------------|
| `up` | `.sr` | fade + sube `1.75rem` | opacity/transform 0.7s |
| `wipe` | `.sr-wipe` | fade + entra desde la izquierda `2rem` | opacity 0.6s / transform 0.9s |
| `tilt` | `.sr-tilt` | fade + sube `1.75rem` + rota `+2.5°` | 0.7s |
| `tilt-neg` | `.sr-tilt-neg` | fade + sube `1.75rem` + rota `-2.5°` | 0.7s |
| `left` | `.sr-left` | fade + entra lateral desde la izquierda `2.5rem` | 0.8s |
| `right` | `.sr-right` | fade + entra lateral desde la derecha `2.5rem` | 0.8s |

Modificadores de retraso (independientes): `.sr-delay-1` (0.1s), `.sr-delay-2`
(0.2s), `.sr-delay-3` (0.35s). Easing común: `cubic-bezier(.16,1,.3,1)`.

### Uso

```tsx
import Reveal from '@/components/ui/Reveal';

// Básico (fade + sube)
<Reveal><h2>Título</h2></Reveal>

// Variante + stagger conservando etiqueta semántica y clases de estilo
<Reveal as="h2" variant="left" delay={1} className="font-chunko text-4xl">
  Nuestros sabores
</Reveal>

// Re-anima en cada pasada de scroll
<Reveal variant="wipe" repeat>…</Reveal>
```

Nota: para elementos que ya son Client Components y no quieren wrapper extra, se
puede exponer un hook `useScrollReveal()` que devuelva un `ref` (no implementado
aún; `observeReveal` ya está listo para ello).

## Despliegue (Coolify en el VPS)

El frontend Next.js se despliega con **Coolify** en el VPS (entorno tipo Vercel,
self-hosted), junto a Directus, MariaDB y Listmonk. Coolify construye desde el
repo de GitHub y publica cada entorno en su propia aplicación.

### Estructura de ramas y entornos

Dos aplicaciones en Coolify, una por entorno, cada una atada a su rama:

| Entorno | Rama | Domains | `NEXT_PUBLIC_CONTENT_ENV` |
|---------|------|---------|---------------------------|
| **Producción** | `prod` | `pacomerlos.com`, `www.pacomerlos.com` | `production` (solo published) |
| **Desarrollo** | `main` | URL de preview diferenciada (subdominio Coolify) | `development` (drafts + published) |

- **`main` = rama de desarrollo**: el día a día se trabaja y se mergea aquí. Cada
  push redeploya el entorno de desarrollo (preview).
- **`prod` = rama de producción**: se despliega en los dominios públicos. Se
  promociona contenido a producción haciendo merge/fast-forward de `main` → `prod`
  y push de `prod`.

### Flujo de promoción a producción

```bash
git checkout prod
git merge --ff-only main   # o merge normal si prod ha divergido
git push origin prod        # Coolify detecta el push y redeploya producción
git checkout main
```

### Variables de entorno (por aplicación en Coolify)

Comunes a ambos entornos salvo `NEXT_PUBLIC_CONTENT_ENV`:

- `NEXT_PUBLIC_DIRECTUS_URL=https://cms.pacomerlos.com`
- `NEXT_PUBLIC_CONTENT_ENV`: `production` (app prod) / `development` (app dev)
- Listmonk (server-only, sin `NEXT_PUBLIC_`): `LISTMONK_API_URL`,
  `LISTMONK_API_USER`, `LISTMONK_API_TOKEN`, `LISTMONK_LIST_ID`. En el VPS
  `LISTMONK_API_URL` puede ser la URL interna de la red de Coolify
  (`http://listmonk:9000`).

### Notas

- **SSL / dominios**: Coolify gestiona los certificados (Let's Encrypt) y el
  enrutado de `pacomerlos.com` + `www.pacomerlos.com` a la app de producción.
- **Cloudflare** sigue delante (proxy naranja): aplica aquí la Rate Limiting Rule
  de `/api/notify` documentada en la sección de Newsletter.
- **Build**: Coolify usa Nixpacks/Docker; si se opta por imagen mínima, añadir
  `output: 'standalone'` en `next.config.ts`.
- **Legacy Vercel**: el proyecto estuvo conectado a Vercel solo para preview. Con
  Coolify, Vercel queda obsoleto; `vercel.json` puede eliminarse cuando se confirme
  que no se usa.

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

Estado actual del singleton (verificado vía API 2026-06-25):
`site_settings` = `{ launch_status: "coming_soon", campaign_sent: true }`.
⚠️ `campaign_sent` debe resetearse a `false` antes del lanzamiento real (el `true` es
residuo del test) o el Flow no volverá a disparar.

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
- `src/components/layout/Footer/NewsLetterForm.tsx` — **Server Component** async: lee
  `getLaunchSettings()` y renderiza el copy según `launch_status` (coming_soon ↔ launched);
  pasa `launched` a `EmailInput`.
- `src/components/ui/Footer/EmailInput.tsx` — client component con input email + honeypot
  oculto + checkbox de consentimiento RGPD (enlace a `/privacidad`) + estados
  `idle|loading|success|error`. Mensaje de éxito según `launched`.
- `src/components/layout/Footer/Footer.tsx` — renderiza `<NotifyForm />`.

### Variables de entorno (server-only, sin `NEXT_PUBLIC_`)

`LISTMONK_API_URL`, `LISTMONK_API_USER`, `LISTMONK_API_TOKEN`, `LISTMONK_LIST_ID`.
En prod (VPS) `LISTMONK_API_URL` puede ser interno (`http://listmonk:9000`); en
preview, la URL pública. (`LISTMONK_CAMPAIGN_ID` lo usa el Directus Flow, no el repo.)

### Protección de `/api/notify` ante tráfico elevado (Cloudflare Rate Limiting)

#### Problema que se pretende resolver

A diferencia de los assets de Directus (que se resuelven **cacheando en el edge**),
`/api/notify` es un **POST de escritura** (da de alta en Listmonk → escribe en
Postgres). **No es cacheable**, así que Cloudflare no puede "absorberlo" sirviendo
una copia. El lever aquí no es caché, sino **rate-limiting en el edge**.

El riesgo no son 200 altas legítimas simultáneas (Node + Listmonk + Postgres las
manejan sobradamente), sino un **flood de bots** martilleando el endpoint: cada hit
dispara una escritura en BD (y potencialmente correo). Las defensas in-repo son
solo segunda línea:

- El honeypot (`website`) frena bots tontos, no a uno decidido.
- El rate-limit en memoria de `route.ts` es **por-instancia y por-IP** (5/60s):
  200 IPs distintas pasan todas; en serverless el `Map` es por instancia, así que
  ni siquiera es consistente. Es best-effort, no una barrera real.

La barrera real debe estar **antes del origen**, en Cloudflare — mismo principio
que aplicamos con el proxy frente a `cms.pacomerlos.com`, pero con una **Rate
Limiting Rule** en vez de una Cache Rule.

#### Regla configurada

> Zona: la del **frontend** (`pacomerlos.com`), NO la de `cms.` — el endpoint vive
> en el servidor Next.js, no en Directus.

- **Match**: `http.request.uri.path eq "/api/notify"` AND `http.request.method eq "POST"`
- **Characteristics (contador por)**: IP de origen (`ip.src`).
- **Rate**: 5 peticiones / 60 s (alineado con el limiter in-app, que queda de respaldo).
- **Acción**: `Managed Challenge` (preferido sobre `Block`: deja pasar a humanos
  reales que reintentan, corta automatización). Duración de mitigación: 60 s.
- **Response**: 429 para los bloqueos directos.

#### Aplicación (panel de Cloudflare)

1. Zona `pacomerlos.com` → **Security → WAF → Rate limiting rules → Create rule**.
2. Field `URI Path` equals `/api/notify`, y `Request Method` equals `POST`.
3. **When rate exceeds**: 5 requests / 1 minute, contador *por IP*.
4. **Then**: Managed Challenge (o Block con respuesta 429), mitigación 1 min.
5. Deploy. La IP real la ve Cloudflare directamente (no depende de
   `x-forwarded-for`, que sí usa el limiter de `route.ts`).

#### Verificación rápida

```bash
# A la 6ª petición en <60s desde la misma IP debe responder 429 / challenge.
for i in $(seq 1 7); do \
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://pacomerlos.com/api/notify \
    -H 'Content-Type: application/json' --data '{"email":"x@x.com"}'; \
done
```

> Nota de capacidad: para picos de escritura aún mayores, la siguiente palanca
> in-repo es un **semáforo de concurrencia** hacia Listmonk en
> `src/lib/listmonk/client.ts` (limitar peticiones en vuelo), y para multi-instancia,
> un store compartido (Redis/Upstash) para el rate-limit. Defensa anti-bots
> definitiva: **Cloudflare Turnstile** en el form (pendiente de keys).

### Estado actual del flujo de lanzamiento (2026-06-25)

**Decisiones:**

- **Una sola lista** en Listmonk: "Newsletter Paco Merlos" (id 3). El formulario da de
  alta SIEMPRE en esta lista (pre y post lanzamiento). La campaña de Lanzamiento es su
  primer envío; después, newsletters periódicas a la misma lista.
- **Lanzamiento dirigido por `launch_status`** (única fuente de verdad): el flip
  `coming_soon → launched` dispara el Flow (envía la campaña) **y** cambia el copy del
  frontend (ISR). NO se usa la programación nativa de Listmonk (evita doble envío).

**Hecho:**

- **Listmonk**: lista 3 renombrada a "Newsletter Paco Merlos". Campaña REAL = **id 2**
  ("Lanzamiento Paco Merlos", draft, → lista 3) con el diseño HTML implantado: asunto
  "Ya es oficial: los paquitos ya están aquí 🎉", logo desde Directus
  (`assets/f30168ce-75cd-4a8b-81f9-f74069284345`), plantilla **passthrough** (id 5) para
  no anidar `<html>`. La plantilla del correo está versionada en `emails/lanzamiento.html`.
  `app.root_url` corregido a `https://lists.pacomerlos.com` (antes `localhost:9000` →
  enlaces de baja/tracking rotos).
- **Frontend**: render condicional por `launch_status` implementado — `src/types/launch.ts`,
  `getLaunchSettings()` (`queries.ts`, ISR 30s, fallback seguro a `coming_soon`),
  `NewsLetterForm.tsx` (copy condicional coming_soon ↔ launched), `EmailInput.tsx`
  (prop `launched` + checkbox de consentimiento RGPD + enlace a `/privacidad` ya presentes).

**Pendiente para dejar el lanzamiento armado:**

- **Directus Flow**: debe arrancar la **campaña 2** (⚠️ NO la 3, que era el TEST ya
  finalizado). Condición `launch_status==launched AND campaign_sent==false` →
  `PUT /api/campaigns/2/status {status:"running"}` → poner `campaign_sent=true`.
- **`campaign_sent` → `false`** en `site_settings` (ahora `true`, residuo del test).
- **Coolify (app prod)**: `LISTMONK_LIST_ID=3`; en dev puede quedar la 4 (lista de test).
- **Día del lanzamiento (18-jul)**: poner `launch_status=launched` (manual o flow programado).
- **Email de confirmación de alta**: aún sin diseñar (ver ToDo).

### Infra VPS (configurada aparte; no se aplica desde este repo)

- Servicios `listmonk` + `listmonk_db` (Postgres) en el `docker-compose` del VPS,
  red interna de Directus. vhost Apache `lists.pacomerlos.com` (Certbot) → proxy a
  `listmonk:9000` (proteger `/admin`). Cloudflare: subdominio `lists` con bypass.
- Remitente `From: Paco Merlos <newsletter@pacomerlos.com>`, `Reply-To: info@pacomerlos.com`.
- Listmonk: lista "Newsletter Paco Merlos" (id 3, single opt-in), SMTP `newsletter@`,
  campaña de lanzamiento (id 2). Entregabilidad: SPF, DKIM y DMARC para `pacomerlos.com`.
- Directus: singleton `site_settings` con `launch_status` (enum) + `campaign_sent`
  (bool). Lectura pública. Flow: trigger update + condición `launch_status==launched`
  → Request a Listmonk para arrancar la campaña.

## ToDo

- [ ] **Probar funcionalidad del formulario con el backend**: verificar el flujo
  completo de suscripción end-to-end — envío desde `EmailInput.tsx` → Route Handler
  `/api/notify` → Listmonk Admin API → alta en lista. Comprobar también los casos
  edge: email ya suscrito (respuesta `alreadySubscribed`), rate-limit (429), honeypot
  y validación de email inválido.
- [ ] **Email de confirmación de alta en la newsletter**: diseñar y crear la plantilla
  (Listmonk) que se envía al darse de alta, confirmando la suscripción. Remitente
  `newsletter@`, enlace de baja nativo de Listmonk.
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
