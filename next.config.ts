import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen mínima para Docker: Next copia un servidor standalone con solo las
  // dependencias necesarias (incluye los binarios nativos traceados, p. ej. sharp).
  output: "standalone",
  // Límite de workers en `next build`. Por defecto Next usa (nº de cores − 1)
  // procesos en paralelo para "Generating static pages". En el VPS de Coolify eso
  // dispara varios workers que cargan cada uno el bundle (sharp, leaflet, etc.) y
  // satura la RAM disponible → el kernel mata un worker y el build sale con
  // exit 255 ("Deployment failed" justo al empezar la generación estática, en 0/11).
  // Capar a 2 reduce el pico de memoria del build sin penalizar apenas (solo hay
  // ~11 páginas estáticas). Subir este número si el VPS tiene RAM de sobra.
  experimental: {
    cpus: 2,
  },
  // Autoriza las subredes locales en desarrollo (HMR / _next). Al desarrollar desde
  // varias máquinas, cada una coge una IP distinta por DHCP; el comodín evita tener
  // que añadir cada IP a mano. Solo afecta a `next dev`, nunca a producción.
  // OJO: cada `*` casa UN solo octeto (Next separa el host por puntos), por eso hay
  // que poner un `*` por octeto variable — "10.*" NO casaría "10.0.0.5".
  allowedDevOrigins: [
    "192.168.*.*", // redes domésticas típicas (192.168.0.0/16: cubre .0.x y .1.x)
    "10.*.*.*",    // redes de oficina / VPN (10.0.0.0/8)
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.pacomerlos.com",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
