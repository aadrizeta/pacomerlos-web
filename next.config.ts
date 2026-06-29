import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen mínima para Docker: Next copia un servidor standalone con solo las
  // dependencias necesarias (incluye los binarios nativos traceados, p. ej. sharp).
  output: "standalone",
  allowedDevOrigins: [
    "192.168.1.23",
    "192.168.1.24",
    "192.168.1.79",
    "192.168.1.14",
    "192.168.1.16",
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
