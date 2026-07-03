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
  allowedDevOrigins: [
    "192.168.1.23",
    "192.168.1.24",
    "192.168.1.79",
    "192.168.1.14",
    "192.168.1.16",
    "192.168.1.22"
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
