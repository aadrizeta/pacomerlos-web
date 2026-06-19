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

## Próximos pasos

### Página `/sabores`

Diseñar y construir una nueva ruta `/sabores` (App Router: `src/app/sabores/page.tsx`)
que sirva como vitrina completa del catálogo de paquitos.

Requisitos funcionales:

- Obtiene **todos** los paquitos desde `paquitos_data` vía `getPaquitos()`
  (ya disponible en `src/lib/directus/queries.ts`).
- Lista cada paquito mostrando su `image_main` y toda la información asociada:
  `name`, `tagline`, `general_description`, `interior_description`,
  `topping_description`. `primary_color` y `secondary_color` se usan para
  acentos visuales (títulos, fondos, separadores, etc.).
- Server Component con ISR (`revalidate: 30`) — mismo patrón que `src/app/page.tsx`.
- Cada paquito debe tener un **anchor estable** que permita el deep-linking
  desde el carrusel de la home: por ejemplo, envolver cada bloque con
  `id={`paquito-${paquito.id}`}` o un slug derivado del `name`.

### Enlaces desde la home

Dos puntos a actualizar en `src/components/ui/LangingPage/`:

1. **`paquitosGalery.tsx`** — añadir un `Link` (`next/link`) hacia `/sabores`
   como CTA general de la sección (ubicación a decidir: bajo el carrusel o
   como botón al lado del título "Conoce cada uno").

2. **`paquitoHint.tsx`** — envolver el contenido del hint con un `Link` que
   apunte a `/sabores#paquito-<id>` (o el slug que se elija). Así cada
   imagen del carrusel lleva al usuario directamente a la posición de ese
   paquito en la página `/sabores`, con scroll-into-view automático del
   anchor.

Notas de implementación:

- El `Link` dentro de `paquitoHint` debe respetar el comportamiento del
  carrusel: el área activa de clic solo aplica al slide en `data-state="active"`
  (los `prev/next` ya tienen `pointer-events: none` excepto en `active`).
- Para que el scroll al anchor funcione bien con la barra fija (`header`),
  considerar `scroll-margin-top` en cada bloque destino dentro de `/sabores`.
