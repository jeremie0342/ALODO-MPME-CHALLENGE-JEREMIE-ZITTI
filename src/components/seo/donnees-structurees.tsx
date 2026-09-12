import { getTranslations } from "next-intl/server";

import { MARQUE } from "@/lib/marque";
import { URL_SITE } from "@/lib/site";

/**
 * Description lisible par les moteurs de recherche et les assistants.
 * Le diagnostic est décrit comme une application gratuite et sans compte, ce qui est
 * exactement ce qu'une MPME cherche à savoir avant de cliquer.
 */
export async function DonneesStructurees({ locale }: { readonly locale: string }) {
  const t = await getTranslations({ locale, namespace: "meta" });

  const donnees = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("titre"),
    description: t("description"),
    url: `${URL_SITE}/${locale}`,
    inLanguage: locale,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "XOF" },
    publisher: { "@type": "Organization", name: MARQUE.nom, url: "https://alodotech.com" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
    />
  );
}
