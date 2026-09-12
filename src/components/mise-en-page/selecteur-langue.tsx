"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { LANGUES } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Bascule de langue. Deux liens plutôt qu'un menu déroulant : avec seulement deux
 * langues, ouvrir un menu coûte un geste de plus pour rien, et les deux URL restent
 * visibles pour les moteurs de recherche.
 */
export function SelecteurLangue() {
  const t = useTranslations("commun");
  const langueCourante = useLocale();
  const chemin = usePathname();

  return (
    <nav aria-label={t("changerLangue")} className="flex items-center gap-1">
      {LANGUES.map((langue, index) => {
        const active = langue.code === langueCourante;

        return (
          <span key={langue.code} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-xs text-trait-appuye">
                /
              </span>
            )}
            <Link
              href={chemin}
              locale={langue.code}
              hrefLang={langue.code}
              aria-current={active ? "true" : undefined}
              className={cn(
                "libelle-instrument rounded-sm px-1 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
                active ? "text-encre" : "text-encre-discrete hover:text-encre",
              )}
            >
              {langue.code}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
