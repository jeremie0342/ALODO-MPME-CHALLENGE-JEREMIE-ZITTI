"use client";

import { useSyncExternalStore } from "react";

import { QUESTIONS } from "@/domaine/questionnaire";

import { instantane, instantaneServeur, souscrire } from "./stockage-local";

const VRAI = () => true;
const FAUX = () => false;

export interface EtatSession {
  /** Faux pendant le rendu serveur et l'hydratation. */
  readonly pret: boolean;
  readonly commence: boolean;
  readonly termine: boolean;
  /** Rang de la question en cours, à partir de 1. */
  readonly rang: number;
  readonly nombreQuestions: number;
}

/**
 * Lecture seule de la session, utilisable hors du parcours.
 * L'accueil s'en sert pour proposer une reprise plutôt qu'un démarrage.
 */
export function useSession(): EtatSession {
  const session = useSyncExternalStore(souscrire, instantane, instantaneServeur);
  const pret = useSyncExternalStore(souscrire, VRAI, FAUX);

  return {
    pret,
    commence: Object.keys(session.reponses).length > 0,
    termine: session.termine,
    rang: Math.min(session.indexCourant, QUESTIONS.length - 1) + 1,
    nombreQuestions: QUESTIONS.length,
  };
}
