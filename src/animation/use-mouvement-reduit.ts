"use client";

import { useReducedMotion } from "motion/react";

/**
 * Vrai quand le système demande à limiter les animations.
 *
 * Ce réglage n'est pas un détail de confort : il est utilisé par les personnes
 * sujettes au mal des transports et aux troubles vestibulaires. Quand il est actif,
 * les éléments apparaissent à leur état final plutôt que de bouger.
 */
export function useMouvementReduit(): boolean {
  return useReducedMotion() ?? false;
}
