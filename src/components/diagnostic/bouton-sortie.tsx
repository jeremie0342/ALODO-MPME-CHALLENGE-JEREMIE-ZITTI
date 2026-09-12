"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Link } from "@/i18n/navigation";

/**
 * Sortie explicite du questionnaire. Le libellé annonce que le parcours est conservé :
 * un simple « Quitter » laisserait croire qu'on perd ses réponses, et dissuaderait
 * de s'interrompre alors que le diagnostic se remplit entre deux clients.
 */
export function BoutonSortie() {
  const t = useTranslations("diagnostic");

  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-sm px-1 py-1 text-encre-attenue transition-colors hover:text-encre focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
    >
      <span className="libelle-instrument hidden sm:inline">{t("sortir")}</span>
      <X className="size-4" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only sm:hidden">{t("sortirDetail")}</span>
    </Link>
  );
}
