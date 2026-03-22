import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SABESP - Mapa do Saneamento | Estado de São Paulo",
  description:
    "Painel geoespacial do saneamento básico no Estado de São Paulo. ETAs, ETEs, reservatórios, redes de água e esgoto, consumo e previsões.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
