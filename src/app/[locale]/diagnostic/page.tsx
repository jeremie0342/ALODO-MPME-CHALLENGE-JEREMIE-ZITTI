"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { TRANSITION, VARIANTES_QUESTION } from "@/animation/mouvement";
import { useMouvementReduit } from "@/animation/use-mouvement-reduit";

import { BoutonSortie } from "@/components/diagnostic/bouton-sortie";
import { ChampQuestion } from "@/components/diagnostic/champ-question";
import {
  BarreProgression,
  EtiquetteDimension,
  RailDimensions,
} from "@/components/diagnostic/progression";
import { SqueletteQuestion } from "@/components/diagnostic/squelette";
import { Contenu, EnTete } from "@/components/mise-en-page/cadre";
import { Button } from "@/components/ui/button";
import { useDiagnostic } from "@/etat/contexte-diagnostic";
import { useRouter } from "@/i18n/navigation";

export default function PageDiagnostic() {
  const t = useTranslations("diagnostic");
  const tQuestions = useTranslations("questions");
  const router = useRouter();
  const {
    question,
    indexCourant,
    nombreQuestions,
    reponses,
    pret,
    repondu,
    termine,
    versAvant,
    repondre,
    basculer,
    suivante,
    precedente,
  } = useDiagnostic();

  const derniere = indexCourant === nombreQuestions - 1;
  const mouvementReduit = useMouvementReduit();

  useEffect(() => {
    if (termine) router.push("/diagnostic/resultat");
  }, [termine, router]);

  if (!pret) {
    return (
      <>
        <EnTete>
          <BoutonSortie />
        </EnTete>
        <SqueletteQuestion />
      </>
    );
  }

  const sousQuestion = question.sousQuestion;
  const principaleRepondue = (reponses[question.id] ?? []).length > 0;

  return (
    <>
      <EnTete>
        <BoutonSortie />
      </EnTete>

      <main className="flex-1">
        <Contenu className="py-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
            <aside className="hidden lg:block">
              <RailDimensions indexCourant={indexCourant} reponses={reponses} />
            </aside>

            <div className="min-w-0">
              <AnimatePresence mode="wait" custom={versAvant} initial={false}>
                <m.div
                  key={question.id}
                  custom={versAvant}
                  variants={mouvementReduit ? undefined : VARIANTES_QUESTION}
                  initial="entree"
                  animate="presente"
                  exit="sortie"
                  transition={TRANSITION}
                >
                  <EtiquetteDimension dimension={question.dimension} />

                  <h1 className="mt-4 font-display text-2xl leading-[1.15] text-balance text-encre sm:text-3xl lg:text-4xl">
                    {tQuestions(`${question.id}.intitule`)}
                  </h1>

                  {question.avecAide && (
                    <p className="mt-3 text-sm text-encre-attenue">
                      {tQuestions(`${question.id}.aide`)}
                    </p>
                  )}

                  <div className="mt-8">
                    <ChampQuestion
                      question={question}
                      selection={reponses[question.id] ?? []}
                      onChoisir={(selection) => repondre(question.id, selection)}
                      onBasculer={(optionId, exclusive) =>
                        basculer(question.id, optionId, exclusive)
                      }
                    />
                  </div>
                </m.div>
              </AnimatePresence>

              {sousQuestion && principaleRepondue && (
                <section className="mt-10 border-t border-trait pt-8">
                  <h2 className="font-display text-xl text-encre sm:text-2xl">
                    {tQuestions(`${sousQuestion.id}.intitule`)}
                  </h2>

                  <div className="mt-6">
                    <ChampQuestion
                      question={sousQuestion}
                      selection={reponses[sousQuestion.id] ?? []}
                      onChoisir={(selection) => repondre(sousQuestion.id, selection)}
                      onBasculer={(optionId, exclusive) =>
                        basculer(sousQuestion.id, optionId, exclusive)
                      }
                    />
                  </div>
                </section>
              )}

              <div className="mt-10">
                <BarreProgression indexCourant={indexCourant} />
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={precedente}
                  disabled={indexCourant === 0}
                  className="text-encre-attenue"
                >
                  <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
                  {t("retour")}
                </Button>

                <Button onClick={suivante} disabled={!repondu} size="lg" className="h-12 px-6">
                  {derniere ? t("terminer") : t("continuer")}
                  <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </Contenu>
      </main>
    </>
  );
}
