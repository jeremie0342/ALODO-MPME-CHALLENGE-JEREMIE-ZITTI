"use client";

import { animate } from "motion/react";
import { useEffect, useState } from "react";

import { COURBE, DUREES } from "./mouvement";

/**
 * Fait monter un nombre jusqu'à sa valeur.
 *
 * C'est le seul endroit où le mouvement porte du sens plutôt que du confort : un score
 * qui s'installe progressivement se lit comme une mesure en train d'être relevée, là où
 * un nombre posé d'emblée se lit comme une affirmation.
 */
export function useDecompte(cible: number, anime: boolean): number {
  const [valeur, setValeur] = useState(0);

  useEffect(() => {
    if (!anime) return;

    const controle = animate(0, cible, {
      duration: DUREES.mesure,
      ease: COURBE,
      onUpdate: (courante) => setValeur(Math.round(courante)),
    });

    return () => controle.stop();
  }, [cible, anime]);

  return anime ? valeur : cible;
}
