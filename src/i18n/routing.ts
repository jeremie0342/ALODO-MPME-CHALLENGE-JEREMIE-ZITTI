import { defineRouting } from "next-intl/routing";

/**
 * Le français reste la langue par défaut : le programme démarre au Bénin.
 * L'anglais ouvre le diagnostic aux marchés anglophones que vise déjà ALODO.
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Langue = (typeof routing.locales)[number];

export const LANGUES: readonly { readonly code: Langue; readonly nom: string }[] = [
  { code: "fr", nom: "Français" },
  { code: "en", nom: "English" },
];
