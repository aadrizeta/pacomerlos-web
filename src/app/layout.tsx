import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const now = localFont({
  src: [
    { path: "../../public/fonts/Now-Thin.woff2", weight: "100", style: "normal" },
    { path: "../../public/fonts/Now-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../../public/fonts/Now-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/Now-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Now-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Now-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Now-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Now-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../../public/fonts/Now-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-now",
  display: "swap",
});

const chunko = localFont({
  src: "../../public/fonts/Chunko Bold.woff2",
  variable: "--font-chunko",
  weight: "700",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#8C52FF",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pacomerlos.com"),
  title: {
    default: "Paco Merlos",
    template: "%s — Paco Merlos",
  },
  authors: [{ name: "Paco Merlos" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1",
  openGraph: {
    locale: "es_ES",
    siteName: "Paco Merlos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // El chrome del sitio y el gate de lanzamiento viven en los layouts de los route
  // groups `(site)` y `(legal)`, no aquí: así las páginas legales pueden quedar
  // fuera del gate (accesibles siempre). El root solo aporta html/body/fuentes.
  return (
    <html
      lang="es"
      className={`${now.variable} ${chunko.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="js-ready" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js-ready')`}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
