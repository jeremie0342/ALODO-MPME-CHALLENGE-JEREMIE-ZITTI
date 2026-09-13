import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { MARQUE } from "@/lib/marque";
import { URL_SITE } from "@/lib/site";
import { SCRIPT_ANTI_CLIGNOTEMENT } from "@/etat/theme";

import { FournisseurMouvement } from "@/animation/fournisseur";
import { DonneesStructurees } from "@/components/seo/donnees-structurees";
import { SynchroniseurTheme } from "@/components/mise-en-page/synchroniseur-theme";

import "../globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const titre = t("titre");
  const description = t("description");

  return {
    metadataBase: new URL(URL_SITE),
    title: { default: titre, template: `%s · ${MARQUE.programme}` },
    description,
    applicationName: MARQUE.programme,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((code) => [code, `/${code}`])),
    },
    /*
     * ALODO distribue par bot WhatsApp : un lien partagé y affiche une carte.
     * L'aperçu n'est donc pas un ornement, c'est la première vue du produit.
     */
    openGraph: {
      type: "website",
      siteName: MARQUE.programme,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `/${locale}`,
      title: titre,
      description,
      images: [{ url: `/partage-${locale}.png`, width: 1200, height: 630, alt: titre }],
    },
    twitter: {
      card: "summary_large_image",
      title: titre,
      description,
      images: [`/partage-${locale}.png`],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: MARQUE.signal,
  width: "device-width",
  initialScale: 1,
};

export default async function LayoutLangue({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    // Les extensions de navigateur (correcteurs, gestionnaires de mots de passe) ajoutent
    // leurs attributs sur <html> avant l'hydratation. La tolérance ne porte que sur cette
    // balise : un écart réel dans l'arbre reste signalé.
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <head>
        {/* Pose le thème avant la peinture : sans cela la page s'afficherait en clair
            puis basculerait, ce qui est pire que de ne pas proposer de thème sombre. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_CLIGNOTEMENT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <DonneesStructurees locale={locale} />
        <SynchroniseurTheme />
        <NextIntlClientProvider>
          <FournisseurMouvement>{children}</FournisseurMouvement>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
