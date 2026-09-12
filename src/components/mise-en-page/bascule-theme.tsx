"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import {
  definirTheme,
  instantaneTheme,
  instantaneThemeServeur,
  preferenceSuivante,
  souscrireTheme,
  type PreferenceTheme,
} from "@/etat/theme";

const ICONES = { systeme: Monitor, clair: Sun, sombre: Moon } as const;

/**
 * Un seul bouton qui fait défiler système, clair et sombre.
 * Trois boutons alignés encombreraient un en-tête qui porte déjà la sortie du
 * questionnaire et le choix de langue, pour un réglage que l'on touche une fois.
 */
export function BasculeTheme() {
  const t = useTranslations("theme");
  const preference = useSyncExternalStore(souscrireTheme, instantaneTheme, instantaneThemeServeur);

  const Icone = ICONES[preference];
  const suivante: PreferenceTheme = preferenceSuivante(preference);

  return (
    <button
      type="button"
      onClick={() => definirTheme(suivante)}
      aria-label={t("basculer", { vers: t(suivante) })}
      title={t(preference)}
      className="flex size-8 items-center justify-center rounded-sm text-encre-attenue transition-colors hover:bg-survol hover:text-encre focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
    >
      <Icone className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
