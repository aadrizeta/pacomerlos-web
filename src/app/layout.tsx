import type { Metadata } from "next";
import Footer from "@/components/layout/Footer/Footer";
import Header from "@/components/layout/Header/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pacomerlos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
