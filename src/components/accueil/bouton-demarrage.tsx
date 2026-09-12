"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reinitialiserSession } from "@/etat/stockage-local";
import { useSession } from "@/etat/use-session";

/**
 * Point d'entrée du parcours. Il s'adapte à la session en cours : proposer
 * « Commencer » à quelqu'un qui a déjà répondu à sept questions lui ferait craindre
 * de tout reprendre depuis le début.
 */
export function BoutonDemarrage() {
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
            {acheve
              ? "Voir mon résultat"
              : reprise
                ? "Reprendre le diagnostic"
                : "Commencer le diagnostic"}
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {(reprise || acheve) && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-encre-attenue">
          {reprise && (
            <span data-mesure>
              Vous en étiez à la question {rang} sur {nombreQuestions}.
            </span>
          )}
          <button
            type="button"
            onClick={recommencer}
            className="cursor-pointer rounded-sm text-encre-attenue underline underline-offset-4 transition-colors hover:text-encre focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
          >
            Recommencer à zéro
          </button>
        </p>
      )}
    </div>
  );
}
