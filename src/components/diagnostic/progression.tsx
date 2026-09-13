"use client";

import { useTranslations } from "next-intl";
import { m } from "motion/react";
import { Check } from "lucide-react";

import { TRANSITION } from "@/animation/mouvement";
import { useMouvementReduit } from "@/animation/use-mouvement-reduit";

import { DIMENSIONS, QUESTIONS } from "@/domaine/questionnaire";
import { estRepondue } from "@/domaine/scoring";
import type { IdentifiantDimension, Reponses } from "@/domaine/types";
import { cn } from "@/lib/utils";

interface ProgressionProps {
  readonly indexCourant: number;
  readonly reponses: Reponses;
}

/**
 * L'utilisateur doit toujours savoir où il en est, sans avoir à compter.
 * Deux lectures complémentaires : l'avancement global en barre, et l'avancement
 * par dimension dans le rail, qui montre aussi ce qui reste à venir.
 */
export function BarreProgression({ indexCourant }: { readonly indexCourant: number }) {
  const t = useTranslations("diagnostic");
  const mouvementReduit = useMouvementReduit();
  const total = QUESTIONS.length;
  const rang = indexCourant + 1;
  // Calé sur le rang et non sur les questions achevées : une barre vide sur la première
  // question se lit comme une panne, pas comme un départ.
  const pourcentage = Math.round((rang / total) * 100);

  return (
    <div className="flex items-center gap-4">
      <span className="libelle-instrument shrink-0 text-encre-attenue" data-mesure>
        {t("position", { rang: String(rang).padStart(2, "0"), total })}
      </span>

      <div
        role="progressbar"
        aria-valuenow={rang}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t("progression")}
        className="h-1 flex-1 overflow-hidden rounded-full bg-papier-creux"
      >
        <m.div
          className="h-full bg-signal"
          initial={false}
          animate={{ width: `${pourcentage}%` }}
          transition={mouvementReduit ? { duration: 0 } : TRANSITION}
        />
      </div>
    </div>
  );
}

export function RailDimensions({ indexCourant, reponses }: ProgressionProps) {
  const t = useTranslations("diagnostic");
  const tDimensions = useTranslations("dimensions");
  const dimensionCourante = QUESTIONS[indexCourant]?.dimension;

  return (
    <nav aria-label={t("dimensions")} className="grid gap-px">
      {DIMENSIONS.map((dimension) => {
        const questions = QUESTIONS.filter((question) => question.dimension === dimension.id);
        const repondues = questions.filter((question) => estRepondue(question, reponses)).length;

        const courante = dimension.id === dimensionCourante;
        const achevee = repondues === questions.length;

        return (
          <div
            key={dimension.id}
            aria-current={courante ? "step" : undefined}
            className={cn(
              "border-l-2 border-trait py-3 pl-4 transition-colors",
              courante ? "border-l-signal" : "border-l-trait",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "libelle-instrument",
                  courante ? "text-encre" : "text-encre-discrete",
                )}
              >
                {tDimensions(`${dimension.id}.nom`)}
              </span>

              {achevee ? (
                <Check className="size-3.5 text-signal" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <span className="font-mono text-[0.6875rem] text-encre-discrete" data-mesure>
                  {repondues}/{questions.length}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs leading-snug text-encre-discrete">
              {tDimensions(`${dimension.id}.enjeu`)}
            </p>
          </div>
        );
      })}
    </nav>
  );
}

export function EtiquetteDimension({ dimension }: { readonly dimension: IdentifiantDimension }) {
  const t = useTranslations("dimensions");

  return <span className="libelle-instrument text-signal">{t(`${dimension}.nom`)}</span>;
}
