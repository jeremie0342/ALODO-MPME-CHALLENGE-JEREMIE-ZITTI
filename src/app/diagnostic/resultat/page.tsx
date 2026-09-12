"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Contenu, EnTete, PiedDePage } from "@/components/mise-en-page/cadre";
import {
  AvertissementPlafond,
  BlocFrein,
  BlocPointFort,
  BlocRecommandation,
  DetailDimensions,
  MesureScore,
} from "@/components/resultat/affichage";
import { Button } from "@/components/ui/button";
import { useDiagnostic } from "@/etat/contexte-diagnostic";

export default function PageResultat() {
  const router = useRouter();
  const { resultat, reponses, pret, recommencer } = useDiagnostic();

  const aucuneReponse = pret && Object.keys(reponses).length === 0;

  useEffect(() => {
    if (aucuneReponse) router.replace("/diagnostic");
  }, [aucuneReponse, router]);

  if (!pret || aucuneReponse) {
    return (
      <>
        <EnTete />
        <main className="flex-1" aria-busy="true" />
      </>
    );
  }

  return (
    <>
      <EnTete />

      <main className="flex-1">
        <Contenu className="py-12 sm:py-16">
          <p className="libelle-instrument text-encre-discrete">Résultat du diagnostic</p>

          <div className="mt-8">
            <MesureScore resultat={resultat} />
          </div>

          <div className="mt-10 max-w-xl">
            <AvertissementPlafond resultat={resultat} />
          </div>

          <div className="mt-12 grid gap-12 border-t border-trait pt-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <section>
              <h2 className="libelle-instrument mb-6 text-encre-discrete">Par dimension</h2>
              <DetailDimensions dimensions={resultat.dimensions} />

              {resultat.coefficientConfiance < 1 && (
                <p className="mt-8 text-sm leading-relaxed text-encre-attenue">
                  Votre note financière est ajustée parce que vos chiffres ne s&apos;appuient pas
                  sur des écrits. Le même résultat, tiré de registres, compterait pour sa valeur
                  pleine.
                </p>
              )}
            </section>

            <div className="grid gap-4">
              <BlocPointFort resultat={resultat} />
              <BlocFrein resultat={resultat} />
            </div>
          </div>

          <div className="mt-12">
            <BlocRecommandation resultat={resultat} />
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-trait pt-8">
            <Button variant="outline" onClick={recommencer} asChild={false}>
              <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
              Refaire le diagnostic
            </Button>

            <Button variant="ghost" asChild className="text-encre-attenue">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </Contenu>
      </main>

      <PiedDePage />
    </>
  );
}
