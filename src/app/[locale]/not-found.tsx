import { useTranslations } from "next-intl";

import { Contenu, EnTete, PiedDePage } from "@/components/mise-en-page/cadre";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function PageIntrouvable() {
  const t = useTranslations("introuvable");

  return (
    <>
      <EnTete />

      <main className="flex-1">
        <Contenu className="py-20 sm:py-28">
          <p className="libelle-instrument text-encre-discrete" data-mesure>
            404
          </p>

          <h1 className="mt-6 max-w-2xl font-display text-3xl leading-tight text-balance text-encre sm:text-4xl">
            {t("titre")}
          </h1>

          <p className="mt-4 max-w-lg leading-relaxed text-encre-attenue">{t("texte")}</p>

          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/">{t("retour")}</Link>
            </Button>
          </div>
        </Contenu>
      </main>

      <PiedDePage />
    </>
  );
}
