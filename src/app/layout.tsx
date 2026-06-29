import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
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
  return (
    <html
      lang="es"
      className={`${now.variable} ${chunko.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca que hay JS antes de pintar: habilita el estado inicial oculto
            del scroll-reveal sin FOUC. Sin JS, el contenido se ve siempre. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-ready')",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
