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
| `direction` | `up` \| `down` \| `left` \| `right` | `up` | Sentido del desplazamiento al revelarse (convención tipo AOS) |
| `distance` | `number` \| `string` | `'1.75rem'` | Distancia recorrida. Número → px; string → valor CSS tal cual |
| `duration` | `number` \| `string` | `'0.7s'` | Duración del reveal. Número → segundos; string → valor CSS |
| `delay` | `1` \| `2` \| `3` | — | Stagger: 0.1 / 0.2 / 0.35 s |
| `repeat` | `boolean` | `false` | Re-anima cada vez que reentra en viewport |
| `as` | `ElementType` | `div` | Etiqueta a renderizar (no romper layout) |
| `className` | `string` | `''` | Clases de estilo, se combinan con la animación |

### Dirección (`direction` → desplazamiento inicial)

El efecto es siempre **translate + fade-in**: el elemento parte desplazado
`distance` desde el lado opuesto y viaja hacia `direction` mientras aparece.

| `direction` | Parte desde | Viaja hacia |
|-------------|-------------|-------------|
| `up`    | abajo    | arriba     |
| `down`  | arriba   | abajo      |
| `left`  | derecha  | izquierda  |
| `right` | izquierda| derecha    |

Implementación: `<Reveal>` traduce `direction`/`distance`/`duration` a CSS custom
properties inline (`--sr-tx`, `--sr-ty`, `--sr-duration`); la clase `.sr` de
`globals.css` las lee con fallback al comportamiento clásico (sube `1.75rem` en
`0.7s`). El reveal (`.revealed`) lleva el `transform` a `none`. Easing común:
`cubic-bezier(.16,1,.3,1)`.

Modificadores de retraso (independientes): `.sr-delay-1` (0.1s), `.sr-delay-2`
(0.2s), `.sr-delay-3` (0.35s).

### Uso

```tsx
import Reveal from '@/components/ui/Reveal';

// Básico (fade + sube 1.75rem en 0.7s)
<Reveal><h2>Título</h2></Reveal>

// Dirección + distancia + duración + stagger, conservando etiqueta y clases
<Reveal as="h2" direction="left" distance={40} duration={0.9} delay={1} className="font-chunko text-4xl">
  Nuestros sabores
</Reveal>

// Re-anima en cada pasada de scroll
<Reveal direction="right" repeat>…</Reveal>
```

Nota: para elementos que ya son Client Components y no quieren wrapper extra, se
puede exponer un hook `useScrollReveal()` que devuelva un `ref` (no implementado
aún; `observeReveal` ya está listo para ello).

## Despliegue (Coolify en el VPS)

El frontend Next.js se despliega con **Coolify** en el VPS (PaaS self-hosted),
junto a Directus, MariaDB y Listmonk. Coolify construye desde el repo de GitHub y
publica cada entorno en su propia aplicación.

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

## Newsletter y lanzamiento (Listmonk + Directus) — IMPLEMENTADO

Captura de emails para avisar del lanzamiento del producto y disparo del propio
lanzamiento. Probado end-to-end: las altas llegan a Listmonk, se envía el correo
de bienvenida transaccional, y el flip de `launch_status` revela la web y arranca
la campaña.

### El interruptor único: `launch_status`

El lanzamiento son **dos efectos que cuelgan de un mismo interruptor**, el campo
`launch_status` del singleton `site_settings` de Directus:

1. **Revelar la web** — el gate de `src/app/(site)/layout.tsx` lee `launch_status`
   en cada revalidación ISR (30 s). Sin redeploy, sin downtime.
2. **Enviar el correo** — un Directus Flow arranca la campaña en Listmonk.

> ⚠️ `NEXT_PUBLIC_CONTENT_ENV` **NO interviene** en el lanzamiento. Sus valores son
> `production` / `development` y solo deciden si se ven los drafts de Directus. No
> tocarla el día del lanzamiento: ponerla a `development` en producción expondría
> contenido sin aprobar.

### Gate de lanzamiento y route groups

Mientras `launch_status = coming_soon`, **todo el sitio queda oculto** tras una
holding page. Se implementa con dos route groups (carpetas entre paréntesis: no
aparecen en la URL, solo sirven para dar un `layout.tsx` propio a cada grupo):

```
app/layout.tsx              root: <html>, <body>, fuentes. Sin chrome, sin gate.
├── (site)/layout.tsx       GATE. Si no está revelado NO renderiza children
│   ├── page.tsx                /
│   ├── sabores/                /sabores
│   ├── pacommunity/            /pacommunity
│   └── sobre-nosotros/         /sobre-nosotros
└── (legal)/layout.tsx      SIN gate: accesibles siempre
    ├── privacidad/             /privacidad
    ├── aviso-legal/            /aviso-legal
    └── politica-de-cookies/    /politica-de-cookies
```

Condición del gate, un OR de dos palancas:

```ts
const revealed =
  contentEnv() === "development" ||                        // dev: web completa siempre
  (await getLaunchSettings()).launch_status === "launched"; // prod: manda Directus
```

- **No renderizar `children`** cuando está gateado evita que las páginas ejecuten
  sus fetches a Directus.
- Las **legales quedan fuera del gate a propósito**: el formulario de captación pide
  consentimiento RGPD y enlaza a `/privacidad`. Si esa página estuviera tras el gate
  se estarían recogiendo datos personales con el enlace de privacidad roto.
- `getLaunchSettings()` degrada a `coming_soon` si Directus falla: un error de red
  nunca revela la web antes de tiempo.
- Hay un **segundo gate más fino** en `(site)/page.tsx` con la misma condición:
  `coming_soon` → renderiza `<CuentaAtras />`; `launched` → renderiza `<Encuentralos />`.
- El root layout está deliberadamente vacío (solo `<html>`/`<body>`/fuentes): si el
  chrome o el gate vivieran ahí, no habría forma de exceptuar las páginas legales.

> Deuda conocida: `(legal)` usa siempre `HoldingLayout` (chrome minimalista), así que
> tras el lanzamiento las legales seguirán sin Header/Footer completos. El comentario
> de `SiteChrome.tsx` que afirma que `(legal)` lo comparte es **falso**.

### Arquitectura del flujo

```
Usuario → ① POST /api/notify { email, website(honeypot) }
       → Next.js Route Handler (valida email + honeypot + rate-limit por IP)
       → Listmonk POST /api/subscribers: alta en lista 3 (creds server-only)
       → Listmonk POST /api/tx: correo de bienvenida (plantilla 6), best-effort

Cron   → ② Directus Flow programado (10-sep 07:00 UTC = 09:00 Madrid)
       → launch_status = "launched" en site_settings
       → PUT /api/campaigns/4/status {"status":"running"} en Listmonk
       → campaign_sent = true (guarda anti-reenvío)
       ├→ Listmonk envía la campaña 4 a la lista 3
       └→ Next.js revalida (≤30 s) → cae la holding page, se ve la web
```

### Funciones / archivos implementados (Next.js)

- `src/lib/listmonk/client.ts` — `subscribeToLaunchList(email)`: helper
  server-side de la Admin API de Listmonk. Auth `Authorization: token <user>:<token>`.
  `POST /api/subscribers` con `status:"enabled"`, `lists:[LIST_ID]` y
  `preconfirm_subscriptions:true` (necesario para single opt-in). Trata el 409 /
  "already exists" como éxito (`alreadySubscribed:true`). Lanza si faltan las
  variables `LISTMONK_*`.
- `src/lib/listmonk/client.ts` — `sendConfirmationEmail(email)`: correo de bienvenida
  vía `POST /api/tx` con `template_id = LISTMONK_TX_TEMPLATE_ID` (plantilla **tx**,
  no campaña). Best-effort: si falla no rompe el alta. Sin la env, se omite en
  silencio. ⚠️ Las plantillas `tx` de Listmonk **no** soportan `{{ UnsubscribeURL }}`
  (es exclusiva de campañas): en el correo de bienvenida la baja va por `mailto`.
  ⚠️ El engine parsea las dobles llaves **incluso dentro de comentarios HTML**.
- `src/app/api/notify/route.ts` — Route Handler `POST` (`runtime:'nodejs'`,
  `dynamic:'force-dynamic'`). Rate-limit en memoria (5 peticiones/60s por IP vía
  `x-forwarded-for`), honeypot (campo `website`: si trae valor responde `ok`
  silencioso sin dar pistas), validación de email (regex + máx 254 chars,
  normaliza a minúsculas), delega en `subscribeToLaunchList` y, solo para altas
  NUEVAS (no `alreadySubscribed`), llama a `sendConfirmationEmail` dentro de su
  propio try/catch. Devuelve `{ ok, alreadySubscribed }` o error con código adecuado.
- `src/components/layout/Footer/NewsLetterForm.tsx` — **Server Component** async: lee
  `getLaunchSettings()` y renderiza el copy según `launch_status` (coming_soon ↔ launched);
  pasa `launched` a `EmailInput`.
- `src/components/ui/Footer/EmailInput.tsx` — client component con input email + honeypot
  oculto + checkbox de consentimiento RGPD (enlace a `/privacidad`) + estados
  `idle|loading|success|error`. Mensaje de éxito según `launched`.
- `src/components/layout/Footer/Footer.tsx` — renderiza `<NotifyForm />`.
- `emails/lanzamiento.html` y `emails/confirmacion.html` — HTML versionado de la
  campaña de lanzamiento y del correo de bienvenida. **Son la fuente de verdad del
  diseño**: si se edita en el panel de Listmonk, hay que volcar el cambio aquí (hoy
  hay deriva; ver plan de lanzamiento).

### Variables de entorno (server-only, sin `NEXT_PUBLIC_`)

| Variable | Valor en prod | Uso |
|---|---|---|
| `LISTMONK_API_URL` | `https://lists.pacomerlos.com` | Base de la Admin API. Puede ser interna (`http://listmonk:9000`) al estar en la misma red Docker |
| `LISTMONK_API_USER` | `notify_api` | Usuario de API (`users.type='api'`) |
| `LISTMONK_API_TOKEN` | *(secreto)* | Token en claro; auth `token <user>:<token>` |
| `LISTMONK_LIST_ID` | `3` | Lista donde da de alta el formulario |
| `LISTMONK_TX_TEMPLATE_ID` | `6` | Plantilla del correo de bienvenida |

`LISTMONK_CAMPAIGN_ID` **no lo usa el repo**: el id de campaña vive en la config del
Directus Flow. En `.env` local puede haber valores de test (lista 4) — no confundirlos
con los de producción.

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

### Estado del flujo de lanzamiento (verificado contra el VPS 2026-09-03)

**Decisiones vigentes:**

- **Una sola lista** en Listmonk: "Newsletter Paco Merlos" (**id 3**, single opt-in).
  El formulario da de alta SIEMPRE en esta lista, antes y después del lanzamiento. La
  campaña de Lanzamiento es su primer envío; después, newsletters periódicas.
- **`launch_status` es la única fuente de verdad**: revela la web (ISR) y dispara el
  envío (Flow).
- **Disparo por Directus Flow con trigger `schedule` (cron)**, NO por la programación
  nativa de Listmonk. Un solo reloj evita el doble envío y que el correo salga
  desincronizado de la revelación de la web.

**Estado real verificado:**

| Pieza | Valor |
|---|---|
| `site_settings` | `launch_status=coming_soon`, `campaign_sent=0` |
| Lista real | id **3** "Newsletter Paco Merlos", 5 suscriptores `confirmed` |
| Lista de pruebas | id **4** "TEST - Lanzamiento Paco Merlos", 0 suscriptores |
| Campaña de lanzamiento | id **4** "Lanzamiento Paco Merlos", `draft`, `send_at` vacío, → lista 3, plantilla 5 (passthrough), `{{ UnsubscribeURL }}` presente |
| Plantilla tx de bienvenida | id **6** "Confirmación alta Paco Merlos" |
| SMTP | relay Brevo (`smtp-relay.brevo.com:587`, STARTTLS), From `Paco Merlos <newsletter@pacomerlos.com>` |
| `app.root_url` | `https://lists.pacomerlos.com` |
| Env app prod (Coolify) | `LISTMONK_LIST_ID=3`, `LISTMONK_TX_TEMPLATE_ID=6`, `NEXT_PUBLIC_CONTENT_ENV=production` |
| Directus | v12.0.1 (soporta trigger `schedule`) |

> ⚠️ **Los ids cambian.** Las campañas 2 y 3 que citaban versiones anteriores de este
> documento **fueron borradas**; la campaña real es la **4**. Ojo también con la
> colisión de números: la **lista 4 es la de TEST**, la campaña 4 es la buena.
> Verificar siempre contra la BD antes de tocar nada.

**⚠️ Zonas horarias — los tres servicios corren en husos distintos:**

| Servicio | TZ |
|---|---|
| Host VPS | Europe/Berlin (CEST, UTC+2) |
| Contenedor Directus | **UTC** |
| Contenedor Listmonk | Europe/Madrid |

El cron de un Directus Flow se evalúa **en UTC**. Lanzamiento acordado:
**10-sep-2026, 09:00 hora de Madrid = 07:00 UTC**.

### Comandos de verificación (VPS)

Acceso: `ssh vps-ofi`.

```bash
# Estado del interruptor
curl -s 'https://cms.pacomerlos.com/items/site_settings?fields=launch_status,campaign_sent'

# Listmonk: campañas, listas y suscriptores
ssh vps-ofi 'docker exec listmonk-listmonk_db-1 psql -U listmonk -d listmonk \
  -c "SELECT id,name,status,send_at FROM campaigns ORDER BY id;" \
  -c "SELECT campaign_id,list_id,list_name FROM campaign_lists;" \
  -c "SELECT l.id,l.name,count(sl.subscriber_id) FROM lists l \
      LEFT JOIN subscriber_lists sl ON sl.list_id=l.id GROUP BY 1,2 ORDER BY 1;"'

# Directus: flows y operaciones. `trigger` y `key` son palabras reservadas en
# MariaDB, así que hay que ir por fichero .sql (el quoting por -e se rompe).
ssh vps-ofi 'cat > /tmp/q.sql <<"SQL"
SELECT id,name,status,`trigger`,options FROM directus_flows\G
SELECT id,flow,`key`,type,resolve,options FROM directus_operations\G
SQL
docker cp /tmp/q.sql directus-database-1:/tmp/q.sql
docker exec directus-database-1 sh -c "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" directus < /tmp/q.sql"'
```

### Infra VPS (configurada aparte; no se aplica desde este repo)

- Servicios `listmonk` + `listmonk_db` (Postgres) en el `docker-compose` del VPS, red
  interna de Directus. vhost Apache `lists.pacomerlos.com` (Certbot) → proxy a
  `listmonk:9000` (proteger `/admin`). Cloudflare: subdominio `lists` con bypass.
- Remitente `From: Paco Merlos <newsletter@pacomerlos.com>`,
  `Reply-To: info@pacomerlos.com`. Entregabilidad: SPF, DKIM y DMARC para
  `pacomerlos.com`.
- Directus: singleton `site_settings` con `launch_status` (enum) + `campaign_sent`
  (bool). Lectura pública.
- ⚠️ **Deuda de seguridad**: el usuario de API `notify_api` tiene rol **Super Admin**
  (`users:manage`, `settings:manage`, `roles:manage`…) y su token viaja en claro en la
  config del Directus Flow y en los `.env`. Solo necesita `campaigns:send`,
  `campaigns:manage`, `subscribers:manage` y `tx:send`. Rotar y restringir.

## ToDo

- [x] ~~**Email de confirmación de alta**~~ — hecho: plantilla tx id 6
  (`emails/confirmacion.html`), enviada desde `sendConfirmationEmail()`.
- [ ] **Cerrar el lanzamiento del 10-sep** — ver "Plan de lanzamiento" más abajo.
- [ ] **Paquito destacado / edición limitada**: diferenciar visualmente un paquito nuevo o por tiempo limitado del resto del catálogo.
  - **Directus**: añadir campos a `paquitos_data`: `is_new` (bool) y/o `is_limited` (bool) + opcionalmente `badge_label` (string, ej. "Nuevo", "Edición limitada").
  - **Frontend**: variante visual en `PacoCard.tsx` (desktop) y `PacoCardMobileAlt.tsx` (mobile) — puede ser un badge/ribbon, borde especial, animación sutil, etc.
  - **Tipos**: actualizar `src/types/paquitos.ts` con los nuevos campos.
  - **Query**: actualizar `getPaquitos()` en `src/lib/directus/queries.ts` para incluir los nuevos campos en el `fields[]`.
- [ ] **Diseñar imagen OG** (`public/img/PACOSJUNTOS.png`): imagen de 1200×630 px para la previsualización al compartir enlaces en redes sociales. Referenciada en `og:image` de `page.tsx` y `sabores/page.tsx`. Debe verse bien en proporción 1.91:1; evitar texto importante en los bordes.

## Plan de lanzamiento — 10-sep-2026, 09:00 Madrid (07:00 UTC)

Objetivo: que a las 09:00 hora de Madrid, **sin intervención manual**, la web se
revele y salga la campaña 4 a la lista 3.

> **Propiedad clave del diseño elegido**: al pasar el Flow de trigger `event` a
> trigger `schedule`, cambiar `launch_status` a mano **deja de enviar correos**.
> El envío solo lo hace el cron. Eso permite ensayar el flip de la web sin riesgo
> de disparar la campaña — antes no era así.

### Fase 0 — Higiene previa

1. `git push origin main` (2 commits que están en `prod` pero no en `main`; el
   entorno de desarrollo corre código más viejo que producción).
2. **Resolver la deriva de `emails/lanzamiento.html`**: el HTML del repo y el body
   de la campaña 4 difieren en dos párrafos (el repo menciona "masa madre fermentada
   48 horas, hechos a mano en Madrid"; la campaña en vivo no). Decidir cuál es el
   texto bueno y dejar ambos idénticos.
3. **Alinear la cuenta atrás**: `src/components/layout/LandingPage/CuentaAtras/Countdown.tsx`
   tiene `LAUNCH_DATE = 2026-09-10T00:00:00+02:00` (medianoche). Con lanzamiento a
   las 09:00 el contador marcaría cero durante 9 horas sobre una página que aún dice
   "Muy pronto". Cambiar a `T09:00:00+02:00` y actualizar el copy de `ComingSoon.tsx`
   si se quiere indicar la hora.

### Fase 1 — Reescribir el Directus Flow

El flow actual (`Lanzamiento → Listmonk (TEST)`, id `99307936-…`) está **activo y
apunta a la campaña 3, que ya no existe** → el día D fallaría en silencio: la web no
se revelaría (trigger `event`) y no saldría ningún correo.

Sustituirlo por **un único flow programado**:

- **Nombre**: `Lanzamiento Paco Merlos` (quitar el "(TEST)", que confunde).
- **Trigger**: `Schedule (CRON)`, expresión **`0 0 7 10 9 *`**
  (seg min hora día mes dow — 6 campos). Se evalúa en **UTC** porque el contenedor
  de Directus corre en UTC → dispara el 10-sep a las 07:00 UTC = 09:00 Madrid.
- **Operaciones**, en este orden (la web primero, el correo después: así nadie
  recibe un email que apunte a una holding page):

  | # | key | Tipo | Config |
  |---|---|---|---|
  | 1 | `get_settings` | Read Data | colección `site_settings`, permisos `$full` |
  | 2 | `gate` | Run Script | aborta si `launch_status === 'launched'` o `campaign_sent === true` |
  | 3 | `reveal` | Update Data | `site_settings` key `1`, payload `{launch_status:"launched"}`, `emitEvents:false` |
  | 4 | `start_campaign` | Webhook / Request URL | `PUT https://lists.pacomerlos.com/api/campaigns/4/status`, header `Authorization: token <user>:<token>`, body `{"status":"running"}` |
  | 5 | `mark_sent` | Update Data | `site_settings` key `1`, payload `{campaign_sent:true}`, `emitEvents:false` |

  El script del `gate` puede reutilizarse tal cual del flow actual (lanza una
  excepción si no procede, lo que corta la cadena sin efectos).

- ⚠️ `emitEvents:false` en las dos escrituras es obligatorio: evita bucles si en el
  futuro alguien vuelve a añadir un flow con trigger `event` sobre `site_settings`.
- ⚠️ El cron se repetiría **cada año** el 10-sep. El `gate` lo hace inofensivo
  (`campaign_sent` ya será `true`), pero conviene **desactivar el flow** tras el
  lanzamiento.

### Fase 2 — Ensayo (imprescindible: el envío no se puede deshacer)

Ensayar en **dos mitades independientes**, para no revelar la web de producción ni
gastar la campaña real.

**A. Mitad "correo"** — verifica cron, TZ, auth y la llamada a Listmonk:

1. Duplicar la campaña 4 en Listmonk → campaña de prueba dirigida a la **lista 4
   ("TEST", 0 suscriptores)**; añadir 1–2 emails propios a esa lista.
2. Clonar el flow apuntando a esa campaña de prueba, **sin las operaciones 3 y 5**
   (no tocar `site_settings`), con cron a 5 minutos vista *en UTC*.
3. Verificar: llega el correo, la campaña queda `finished`, el log del flow no tiene
   errores. Esto valida justo lo que falló la última vez (el id de campaña) y la
   conversión de husos.
4. Borrar el flow de prueba y dejar la campaña de prueba fuera de juego.

**B. Mitad "web"** — verifica el gate y el ISR:

1. Poner `launch_status = launched` a mano en Directus (seguro: con trigger cron ya
   no dispara ningún envío).
2. Comprobar en ≤30 s que `pacomerlos.com` muestra la web completa, que
   `/sabores` y `/pacommunity` responden, y que `/privacidad` sigue accesible.
3. Revertir a `coming_soon` y confirmar que vuelve la holding page.

Hacerlo en franja de bajo tráfico.

### Fase 3 — Armado (D-1, 9-sep)

Checklist de estado, verificable con los comandos de "Comandos de verificación":

- [ ] `launch_status = coming_soon` y `campaign_sent = false`
- [ ] Campaña **4** en `draft`, `send_at` **vacío** (sin programación nativa: el
      disparo es del Flow, dos relojes serían doble envío)
- [ ] Campaña 4 → lista **3**; body idéntico a `emails/lanzamiento.html`
- [ ] Lista 3 con los suscriptores esperados, todos `confirmed`
- [ ] Flow `Lanzamiento Paco Merlos` **activo**, cron `0 0 7 10 9 *`, campaña **4**
- [ ] No queda ningún otro flow activo sobre `site_settings`
- [ ] App prod: `NEXT_PUBLIC_CONTENT_ENV=production`, `LISTMONK_LIST_ID=3`
- [ ] `main` mergeado a `prod` y desplegado (congelar cambios)

### Fase 4 — Día D (10-sep, 09:00)

Estar delante entre 08:55 y 09:15.

- 09:00 → el cron dispara. 09:00–09:01 → `launch_status=launched`.
- ≤09:01 → la web debe estar revelada (ISR 30 s).
- 09:01+ → campaña `running` → `finished`. Con 5 suscriptores y `concurrency 10`,
  el envío es prácticamente instantáneo.
- Verificar `campaign_sent = true`.

**Plan B manual** si a las 09:03 no ha pasado nada:

```bash
# 1. Revelar la web (Directus: poner launch_status = launched en el panel)
# 2. Arrancar la campaña a mano
curl -X PUT https://lists.pacomerlos.com/api/campaigns/4/status \
  -H 'Authorization: token <user>:<token>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"running"}'
# 3. Marcar campaign_sent = true en Directus
```

### Fase 5 — Post-lanzamiento

- Desactivar el Flow de lanzamiento (ya cumplió; el cron se repetiría cada año).
- **Rotar el token de `notify_api`** y crear un rol restringido
  (`campaigns:send`, `campaigns:manage`, `subscribers:manage`, `tx:send`) en lugar
  de Super Admin. Actualizar el token en Coolify (prod y dev), `.env` local y la
  config del Flow.
- Arreglar el chrome de `(legal)`: tras el lanzamiento las páginas legales deberían
  usar `SiteChrome`, no `HoldingLayout`. Corregir también el comentario falso de
  `SiteChrome.tsx`.
- Retirar o reutilizar `CuentaAtras`/`Countdown` y `ComingSoon` (quedan como código
  muerto en el camino `launched`).

## Próximos pasos

### CTA general hacia `/sabores` desde la home

En `src/components/layout/LandingPage/PaquitoGalery/paquitosGalery.tsx` — añadir
un `Link` (`next/link`) hacia `/sabores` como CTA general de la sección
(ubicación a decidir: bajo el carrusel o como botón al lado del título "Conoce cada uno").

Nota: considerar `scroll-margin-top` en los bloques destino de `/sabores` si el
scroll al anchor no compensa la altura de la barra fija (`header`).
