import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { FileText, ShieldCheck, Timer } from "lucide-react";

import { BoutonDemarrage } from "@/components/accueil/bouton-demarrage";
import { Entrelacs } from "@/components/marque/entrelacs";
import { Contenu, EnTete, PiedDePage } from "@/components/mise-en-page/cadre";
import { DIMENSIONS, NOMBRE_QUESTIONS } from "@/domaine/questionnaire";

const REPERES = [
  { cle: "questions", icone: FileText },
  { cle: "duree", icone: Timer },
  { cle: "documents", icone: ShieldCheck },
] as const;

export default async function PageAccueil({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Accueil />;
}

function Accueil() {
  const t = useTranslations("accueil");
  const tDimensions = useTranslations("dimensions");

  return (
    <>
      <EnTete />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <Entrelacs className="pointer-events-none absolute -top-16 -right-32 hidden h-[30rem] w-[30rem] lg:block" />

          <Contenu className="relative py-16 sm:py-24">
            <p className="libelle-instrument text-signal">{t("surtitre")}</p>

            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight text-balance text-encre sm:text-5xl lg:text-6xl">
              {t("titre")}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-encre-attenue">
              {t("chapeau")}
            </p>

            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {REPERES.map(({ cle, icone: Icone }) => (
                <li key={cle} className="flex items-center gap-2 text-encre-attenue">
                  <Icone className="size-4 text-signal" strokeWidth={1.75} aria-hidden="true" />
                  <span className="libelle-instrument">
                    {t(`reperes.${cle}`, { nombre: NOMBRE_QUESTIONS })}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <BoutonDemarrage />
            </div>
          </Contenu>
        </section>

        <section className="border-t border-trait">
          <Contenu className="py-14 sm:py-20">
            <h2 className="libelle-instrument text-encre-discrete">{t("examen")}</h2>

            <ol className="mt-8 grid gap-px sm:grid-cols-3">
              {DIMENSIONS.map((dimension, index) => (
                <li key={dimension.id} className="border border-trait bg-papier-releve p-6 sm:p-7">
                  <span className="font-mono text-xs text-encre-discrete" data-mesure>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-2xl text-encre">
                    {tDimensions(`${dimension.id}.nom`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-encre-attenue">
                    {tDimensions(`${dimension.id}.enjeu`)}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-encre-attenue">
              {t("note")}
            </p>
          </Contenu>
        </section>
      </main>

      <PiedDePage />
    </>
  );
}
