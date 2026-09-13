"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { instantaneTheme, instantaneThemeServeur, resoudre, souscrireTheme } from "@/etat/theme";

/**
 * Maintient l'attribut de thème sur la racine du document.
 *
 * Le script exécuté avant la peinture pose l'attribut au premier chargement, mais un
 * changement de langue re-rend la racine et le fait disparaitre : React ne connait pas
 * cet attribut, pose hors de son arbre. Le stockage, lui, reste juste, d'ou un affichage
 * en desaccord avec la preference enregistree.
 *
 * Ce composant reapplique l'attribut apres chaque navigation, la preference stockee
 * restant l'unique source de verite.
 */
export function SynchroniseurTheme() {
  const chemin = usePathname();
  const preference = useSyncExternalStore(souscrireTheme, instantaneTheme, instantaneThemeServeur);

  useEffect(() => {
    const attendu = resoudre(preference);

    if (document.documentElement.dataset.theme !== attendu) {
      document.documentElement.dataset.theme = attendu;
    }
  }, [preference, chemin]);

  return null;
}
