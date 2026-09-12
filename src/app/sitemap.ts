import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { URL_SITE } from "@/lib/site";

/** Les écrans du parcours, déclarés une fois et déclinés dans chaque langue. */
const CHEMINS = ["", "/diagnostic"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    CHEMINS.map((chemin) => ({
      url: `${URL_SITE}/${locale}${chemin}`,
      changeFrequency: "monthly" as const,
      priority: chemin === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((autre) => [autre, `${URL_SITE}/${autre}${chemin}`]),
        ),
      },
    })),
  );
}
