import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { MARQUE } from "@/lib/marque";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagnostic ALODO MPME",
  description:
    "Évaluez en cinq minutes la capacité de votre entreprise à accéder à un premier crédit formel.",
};

export const viewport: Viewport = {
  themeColor: MARQUE.signal,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Les extensions de navigateur (correcteurs, gestionnaires de mots de passe) ajoutent
    // leurs attributs sur <html> avant l'hydratation. La tolérance ne porte que sur cette
    // balise : un écart réel dans l'arbre reste signalé.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
