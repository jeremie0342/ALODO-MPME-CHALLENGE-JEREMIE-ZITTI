"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reinitialiserSession } from "@/etat/stockage-local";
import { useSession } from "@/etat/use-session";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * Point d'entrée du parcours. Il s'adapte à la session en cours : proposer
 * « Commencer » à quelqu'un qui a déjà répondu à sept questions lui ferait craindre
 * de tout reprendre depuis le début.
 */
export function BoutonDemarrage() {
  const t = useTranslations("accueil");
  const router = useRouter();
  const { pret, commence, termine, rang, nombreQuestions } = useSession();

  const reprise = pret && commence && !termine;
  const acheve = pret && termine;

  function recommencer() {
    reinitialiserSession();
    router.push("/diagnostic");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button asChild size="lg" className="h-12 px-7 text-base">
          <Link href={acheve ? "/diagnostic/resultat" : "/diagnostic"}>
            {acheve ? t("voirResultat") : reprise ? t("reprendre") : t("commencer")}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {(reprise || acheve) && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-encre-attenue">
          {reprise && (
            <span data-mesure>{t("positionReprise", { rang, total: nombreQuestions })}</span>
          )}
          <button
            type="button"
            onClick={recommencer}
            className="rounded-sm text-encre-attenue underline underline-offset-4 transition-colors hover:text-encre focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
          >
            {t("recommencer")}
          </button>
        </p>
      )}
    </div>
  );
}
