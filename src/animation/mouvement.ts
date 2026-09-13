import type { Transition, Variants } from "motion/react";

/**
 * Jetons de mouvement, centralisés au même titre que les couleurs.
 *
 * La direction artistique est celle d'un instrument de mesure : le mouvement sert à
 * situer l'utilisateur et à donner au score le poids d'une mesure, jamais à décorer.
 * Le marché visé répond sur un téléphone d'entrée de gamme, donc on n'anime que
 * l'opacité et la translation, les deux propriétés que le compositeur traite sans
 * recalculer la mise en page.
 */

export const DUREES = {
  /** Retour immédiat sur une interaction. */
  reflexe: 0.18,
  /** Changement de contenu à l'écran. */
  transition: 0.34,
  /** Révélation d'un résultat. */
  revelation: 0.5,
  /** Décompte du score, assez long pour se lire comme une mesure. */
  mesure: 1.1,
} as const;

/** Courbe unique, sortie douce sans rebond : un instrument ne rebondit pas. */
export const COURBE = [0.16, 1, 0.3, 1] as const;

export const TRANSITION: Transition = {
  duration: DUREES.transition,
  ease: COURBE,
};

export const TRANSITION_REVELATION: Transition = {
  duration: DUREES.revelation,
  ease: COURBE,
};

/** Décalage entre deux éléments d'une même série. */
export const CASCADE = 0.07;

/**
 * Attente avant que les barres par dimension ne se remplissent, le temps que le score
 * ait commencé à monter. Les deux mouvements se liraient autrement comme concurrents.
 */
export const DELAI_REMPLISSAGE = 0.15;

/** Distance de translation, faible : le contenu glisse, il ne voyage pas. */
const GLISSEMENT = 14;

/**
 * Entrée et sortie d'une question. La direction suit la navigation, ce qui indique
 * qu'on avance ou qu'on revient sans avoir à le lire.
 */
export const VARIANTES_QUESTION: Variants = {
  entree: (versAvant: boolean) => ({
    opacity: 0,
    x: versAvant ? GLISSEMENT : -GLISSEMENT,
  }),
  presente: { opacity: 1, x: 0 },
  sortie: (versAvant: boolean) => ({
    opacity: 0,
    x: versAvant ? -GLISSEMENT : GLISSEMENT,
  }),
};

export const VARIANTES_REVELATION: Variants = {
  entree: { opacity: 0, y: GLISSEMENT },
  presente: { opacity: 1, y: 0 },
};

export const VARIANTES_SERIE: Variants = {
  presente: { transition: { staggerChildren: CASCADE } },
};
