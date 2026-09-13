"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { instantaneTheme, instantaneThemeServeur, resoudre, souscrireTheme } from "@/etat/theme";

/**
 * useLayoutEffect s'execute pendant le rendu serveur, ou il n'a pas de sens et declenche
 * un avertissement. On retombe alors sur useEffect, sans consequence puisque aucune
 * peinture n'a lieu sur le serveur.
 */
const useEffetAvantPeinture = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Maintient l'attribut de theme sur la racine du document.
 *
 * Le script execute avant la peinture pose l'attribut au premier chargement, mais un
 * changement de langue re-rend la racine et le fait disparaitre : React ne connait pas
 * cet attribut, pose hors de son arbre. Le stockage, lui, reste juste, d'ou un affichage
 * en desaccord avec la preference enregistree.
 *
 * La reapplication doit avoir lieu dans un effet de mise en page et non dans un effet
 * passif : un effet passif s'execute apres la peinture, si bien que le navigateur
 * affiche d'abord une trame au mauvais theme avant de la corriger.
 */
export function SynchroniseurTheme() {
  const chemin = usePathname();
  const preference = useSyncExternalStore(souscrireTheme, instantaneTheme, instantaneThemeServeur);

  useEffetAvantPeinture(() => {
    const attendu = resoudre(preference);

    if (document.documentElement.dataset.theme !== attendu) {
      document.documentElement.dataset.theme = attendu;
    }
  }, [preference, chemin]);

  return null;
}
