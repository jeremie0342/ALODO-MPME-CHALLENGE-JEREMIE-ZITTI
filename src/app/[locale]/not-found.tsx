import { useTranslations } from "next-intl";
import { ArrowRight, Home } from "lucide-react";

import { Entrelacs } from "@/components/marque/entrelacs";
import { Contenu, EnTete, PiedDePage } from "@/components/mise-en-page/cadre";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function PageIntrouvable() {
  const t = useTranslations("introuvable");
  const tAccueil = useTranslations("accueil");

  return (
    <>
      <EnTete />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <Entrelacs className="pointer-events-none absolute -top-24 -right-40 hidden h-[32rem] w-[32rem] lg:block" />

          <Contenu className="relative py-20 sm:py-28">
            <p className="font-display text-mesure leading-none text-encre-discrete" data-mesure>
              404
            </p>

            <h1 className="mt-8 max-w-2xl font-display text-3xl leading-tight text-balance text-encre sm:text-4xl">
              {t("titre")}
            </h1>

            <p className="mt-4 max-w-lg leading-relaxed text-encre-attenue">{t("texte")}</p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link href="/">
                  <Home className="size-4" strokeWidth={2} aria-hidden="true" />
                  {t("retour")}
                </Link>
              </Button>

              <Button asChild variant="ghost" size="lg" className="h-12 px-5 text-encre-attenue">
                <Link href="/diagnostic">
                  {tAccueil("commencer")}
                  <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Contenu>
        </section>
      </main>

      <PiedDePage />
    </>
  );
}
