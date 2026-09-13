import Link from "next/link";

import { routing } from "@/i18n/routing";

import "./globals.css";

/**
 * Repli pour les adresses situees hors du segment de langue, que le middleware
 * n'a pas pu rattacher. Elle porte son propre document : la mise en page racine
 * du projet vit sous [locale], et une page sans langue ne peut pas l'emprunter.
 */
export default function PageIntrouvableRacine() {
  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning className="h-full">
      <body className="flex min-h-full flex-col items-start justify-center gap-6 px-6 py-20 sm:px-10">
        <p className="libelle-instrument text-encre-discrete">404</p>
        <h1 className="max-w-xl font-display text-3xl leading-tight text-encre sm:text-4xl">
          Page introuvable · Page not found
        </h1>
        <Link
          href={`/${routing.defaultLocale}`}
          className="libelle-instrument text-signal underline underline-offset-4"
        >
          Revenir à l&apos;accueil · Back to home
        </Link>
      </body>
    </html>
  );
}
