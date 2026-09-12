"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowUpRight, TrendingUp } from "lucide-react";

import { DIMENSIONS } from "@/domaine/questionnaire";
import { niveauMaturite } from "@/domaine/scoring";
import type { NiveauMaturite, Resultat, ScoreDimension } from "@/domaine/types";
import { cn } from "@/lib/utils";

/**
 * Correspondance niveau vers jeton de couleur. La teinte pivote avec la maturité :
 * elle est déclarée dans globals.css, jamais reproduite ici.
 */
const TEINTE_NIVEAU: Readonly<Record<NiveauMaturite, string>> = {
  critique: "text-niveau-critique",
  fragile: "text-niveau-fragile",
  engage: "text-niveau-engage",
  solide: "text-niveau-solide",
};

const FOND_NIVEAU: Readonly<Record<NiveauMaturite, string>> = {
  critique: "bg-niveau-critique",
  fragile: "bg-niveau-fragile",
  engage: "bg-niveau-engage",
  solide: "bg-niveau-solide",
};

export function MesureScore({ resultat }: { readonly resultat: Resultat }) {
  const t = useTranslations("resultat");
  const tMaturite = useTranslations("maturite");
  const tConfiance = useTranslations("confiance");

  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
      <p className="flex items-baseline gap-1.5" data-mesure data-testid="score-global">
        <span
          className={cn(
            "font-display text-mesure leading-none sm:text-mesure-xl",
            TEINTE_NIVEAU[resultat.niveau],
          )}
        >
          {resultat.score}
        </span>
        <span className="font-display text-3xl leading-none text-encre-discrete sm:text-4xl">
          {t("surCent")}
        </span>
      </p>

      <div className="mb-2 flex flex-col gap-1.5">
        <span className={cn("libelle-instrument", TEINTE_NIVEAU[resultat.niveau])}>
          {tMaturite(resultat.niveau)}
        </span>
        <span className="libelle-instrument text-encre-discrete" data-testid="confiance">
          {tConfiance(resultat.confiance)}
        </span>
      </div>
    </div>
  );
}

/**
 * Chaque dimension porte sa propre teinte, calculée sur son score : deux dimensions
 * éloignées ne peuvent pas s'afficher de la même couleur sous prétexte que la moyenne
 * les rassemble.
 */
export function DetailDimensions({
  dimensions,
}: {
  readonly dimensions: readonly ScoreDimension[];
}) {
  const t = useTranslations("dimensions");

  return (
    <dl className="grid gap-5">
      {dimensions.map((entree) => {
        const decotee = entree.ajuste !== entree.brut;
        const niveau = niveauMaturite(entree.ajuste);

        return (
          <div key={entree.dimension}>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="libelle-instrument text-encre">{t(`${entree.dimension}.nom`)}</dt>
              <dd className="flex items-baseline gap-2" data-mesure>
                {decotee && (
                  <span className="font-mono text-xs text-encre-discrete line-through">
                    {entree.brut}
                  </span>
                )}
                <span className="font-mono text-sm text-encre">{entree.ajuste}</span>
              </dd>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-papier-creux">
              <div
                className={cn("h-full rounded-full", FOND_NIVEAU[niveau])}
                style={{ width: `${entree.ajuste}%` }}
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}

export function BlocPointFort({ resultat }: { readonly resultat: Resultat }) {
  const t = useTranslations("resultat");
  const tDimensions = useTranslations("dimensions");
  const dimension = DIMENSIONS.find((item) => item.id === resultat.pointFort);

  return (
    <section className="border border-trait bg-papier-releve p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-4 text-niveau-solide" strokeWidth={2} aria-hidden="true" />
        <h2 className="libelle-instrument text-encre-attenue">{t("pointFort")}</h2>
      </div>

      <p className="mt-3 font-display text-2xl text-encre">
        {dimension && tDimensions(`${dimension.id}.nom`)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-encre-attenue">{t("pointFortNote")}</p>
    </section>
  );
}

export function BlocFrein({ resultat }: { readonly resultat: Resultat }) {
  const t = useTranslations("resultat");
  const tQuestions = useTranslations("questions");

  return (
    <section className="border border-trait bg-papier-releve p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-niveau-fragile" strokeWidth={2} aria-hidden="true" />
        <h2 className="libelle-instrument text-encre-attenue">{t("frein")}</h2>
      </div>

      <p className="mt-3 text-base leading-snug text-encre">
        {tQuestions(`${resultat.frein.questionId}.intitule`)}
      </p>
    </section>
  );
}

export function BlocRecommandation({ resultat }: { readonly resultat: Resultat }) {
  const t = useTranslations("resultat");
  const tRecommandations = useTranslations("recommandations");

  return (
    <section className="border border-signal bg-signal-sourd p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <ArrowUpRight className="size-4 text-signal-profond" strokeWidth={2} aria-hidden="true" />
        <h2 className="libelle-instrument text-signal-profond">{t("action")}</h2>
      </div>

      <p className="mt-4 font-display text-2xl text-encre sm:text-3xl">
        {tRecommandations(`${resultat.recommandation}.titre`)}
      </p>
      <p className="mt-3 leading-relaxed text-encre">
        {tRecommandations(`${resultat.recommandation}.action`)}
      </p>
      <p className="mt-5 border-t border-signal/30 pt-4 text-sm leading-relaxed text-encre-attenue">
        {tRecommandations(`${resultat.recommandation}.justification`)}
      </p>
    </section>
  );
}

export function AvertissementPlafond({ resultat }: { readonly resultat: Resultat }) {
  const t = useTranslations("resultat");

  if (!resultat.plafondAtteint) return null;

  return (
    <p className="border-l-2 border-niveau-critique py-1 pl-4 text-sm leading-relaxed text-encre">
      {t("plafond", { plafond: resultat.plafond })}
    </p>
  );
}
