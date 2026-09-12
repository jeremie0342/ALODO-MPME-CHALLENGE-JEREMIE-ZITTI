"use client";

import { useTranslations } from "next-intl";

import { Contenu } from "@/components/mise-en-page/cadre";

/**
 * Affiché le temps que la session enregistrée soit relue.
 * Ce n'est pas un chargement décoratif : la page était auparavant vide pendant
 * l'hydratation, ce qui produisait un éclair blanc. Le squelette reprend la forme
 * du contenu réel pour que rien ne saute quand il le remplace.
 */
export function SqueletteQuestion() {
  const t = useTranslations("diagnostic");

  return (
    <main className="flex-1" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t("chargement")}</span>

      <Contenu className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
          <aside className="hidden lg:grid lg:gap-px">
            {[0, 1, 2].map((rang) => (
              <div key={rang} className="border-l-2 border-trait py-3 pl-4">
                <div className="h-2.5 w-28 animate-pulse rounded-full bg-papier-creux" />
                <div className="mt-2 h-2 w-36 animate-pulse rounded-full bg-papier-creux" />
              </div>
            ))}
          </aside>

          <div className="min-w-0">
            <div className="h-2.5 w-32 animate-pulse rounded-full bg-papier-creux" />
            <div className="mt-6 grid gap-3">
              <div className="h-7 w-full animate-pulse rounded-md bg-papier-creux" />
              <div className="h-7 w-3/5 animate-pulse rounded-md bg-papier-creux" />
            </div>

            <div className="mt-8 grid gap-2.5">
              {[0, 1, 2, 3].map((rang) => (
                <div
                  key={rang}
                  className="h-14 animate-pulse rounded-md border border-trait bg-papier-releve"
                />
              ))}
            </div>
          </div>
        </div>
      </Contenu>
    </main>
  );
}
