import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { SCRIPT_ANTI_CLIGNOTEMENT } from "@/etat/theme";
import { routing } from "@/i18n/routing";
import { MARQUE } from "@/lib/marque";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
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

/**
 * Repli pour les adresses que le middleware ne rattache a aucune langue, un fichier
 * inexistant par exemple. Elle porte son propre document et ses propres polices : la
 * mise en page racine du projet vit sous [locale], et une page sans langue connue ne
 * peut ni l'emprunter ni choisir entre les deux traductions, d'ou le bilinguisme.
 */
export default function PageIntrouvableRacine() {
  const accueil = `/${routing.defaultLocale}`;

  return (
    <html
      lang={routing.defaultLocale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_CLIGNOTEMENT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-trait">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-5 sm:px-8">
            <Link href={accueil} className="flex items-center gap-2.5">
              <Image
                src="/logo-alodo.png"
                alt={MARQUE.nom}
                width={31}
                height={26}
                priority
                className="dark:hidden"
              />
              <Image
                src="/logo-alodo-sombre.png"
                alt={MARQUE.nom}
                width={31}
                height={26}
                priority
                className="hidden dark:block"
              />
              <span className="libelle-instrument text-encre-attenue">{MARQUE.programme}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-20 sm:px-8 sm:py-28">
          <p className="font-display text-mesure leading-none text-encre-discrete">404</p>

          <h1 className="mt-8 max-w-2xl font-display text-3xl leading-tight text-encre sm:text-4xl">
            Page introuvable
            <span className="text-encre-discrete"> · </span>
            Page not found
          </h1>

          <p className="mt-4 max-w-lg leading-relaxed text-encre-attenue">
            Cette adresse ne correspond à aucun écran du diagnostic.
            <br />
            This address does not match any screen of the diagnostic.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {routing.locales.map((langue) => (
              <Link
                key={langue}
                href={`/${langue}`}
                className="libelle-instrument rounded-sm border border-trait px-4 py-3 text-encre transition-colors hover:border-signal hover:text-signal"
              >
                {langue === "fr" ? "Aller à l'accueil" : "Go to home"} · {langue}
              </Link>
            ))}
          </div>
        </main>

        <footer className="mt-auto border-t border-trait">
          <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8">
            <p className="libelle-instrument text-encre-discrete">{MARQUE.programme}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
