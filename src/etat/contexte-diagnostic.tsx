"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { QUESTIONS } from "@/domaine/questionnaire";
import { calculerResultat, estRepondue } from "@/domaine/scoring";
import type { Question, Reponses, Resultat } from "@/domaine/types";

import {
  instantane,
  instantaneServeur,
  majSession,
  reinitialiserSession,
  souscrire,
} from "./stockage-local";

interface ValeurContexte {
  readonly reponses: Reponses;
  readonly indexCourant: number;
  readonly question: Question;
  readonly nombreQuestions: number;
  /** Faux pendant le rendu serveur et l'hydratation, pour ne pas afficher une session vide. */
  readonly pret: boolean;
  readonly repondu: boolean;
  readonly termine: boolean;
  readonly resultat: Resultat;
  repondre: (questionId: string, selection: readonly string[]) => void;
  basculer: (questionId: string, optionId: string, exclusive: boolean) => void;
  suivante: () => void;
  precedente: () => void;
  recommencer: () => void;
}

const ContexteDiagnostic = createContext<ValeurContexte | null>(null);

const VRAI = () => true;
const FAUX = () => false;

export function FournisseurDiagnostic({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(souscrire, instantane, instantaneServeur);
  const pret = useSyncExternalStore(souscrire, VRAI, FAUX);

  const repondre = useCallback((questionId: string, selection: readonly string[]) => {
    majSession((courante) => ({
      ...courante,
      reponses: { ...courante.reponses, [questionId]: selection },
    }));
  }, []);

  /** Ajoute ou retire une option d'une question à choix multiple. */
  const basculer = useCallback((questionId: string, optionId: string, exclusive: boolean) => {
    majSession((courante) => {
      const actuelles = courante.reponses[questionId] ?? [];

      const suivantes = exclusive
        ? actuelles.includes(optionId)
          ? []
          : [optionId]
        : basculerNonExclusive(questionId, actuelles, optionId);

      return { ...courante, reponses: { ...courante.reponses, [questionId]: suivantes } };
    });
  }, []);

  const suivante = useCallback(() => {
    majSession((courante) =>
      courante.indexCourant >= QUESTIONS.length - 1
        ? { ...courante, termine: true }
        : { ...courante, indexCourant: courante.indexCourant + 1 },
    );
  }, []);

  const precedente = useCallback(() => {
    majSession((courante) => ({
      ...courante,
      indexCourant: Math.max(0, courante.indexCourant - 1),
    }));
  }, []);

  const recommencer = useCallback(() => {
    reinitialiserSession();
  }, []);

  const indexCourant = Math.min(session.indexCourant, QUESTIONS.length - 1);
  const question = QUESTIONS[indexCourant];
  const resultat = useMemo(() => calculerResultat(session.reponses), [session.reponses]);

  const valeur = useMemo<ValeurContexte>(
    () => ({
      reponses: session.reponses,
      indexCourant,
      question,
      nombreQuestions: QUESTIONS.length,
      pret,
      repondu: estRepondue(question, session.reponses),
      termine: session.termine,
      resultat,
      repondre,
      basculer,
      suivante,
      precedente,
      recommencer,
    }),
    [
      session,
      indexCourant,
      question,
      pret,
      resultat,
      repondre,
      basculer,
      suivante,
      precedente,
      recommencer,
    ],
  );

  return <ContexteDiagnostic.Provider value={valeur}>{children}</ContexteDiagnostic.Provider>;
}

export function useDiagnostic(): ValeurContexte {
  const contexte = useContext(ContexteDiagnostic);

  if (!contexte) {
    throw new Error("useDiagnostic doit être appelé dans un FournisseurDiagnostic.");
  }

  return contexte;
}

/** Cocher une option ordinaire retire au passage une éventuelle option exclusive. */
function basculerNonExclusive(
  questionId: string,
  actuelles: readonly string[],
  optionId: string,
): string[] {
  const sansExclusives = actuelles.filter((id) => !estExclusive(questionId, id));

  return sansExclusives.includes(optionId)
    ? sansExclusives.filter((id) => id !== optionId)
    : [...sansExclusives, optionId];
}

function estExclusive(questionId: string, optionId: string): boolean {
  const question = QUESTIONS.find((entree) => entree.id === questionId);

  return Boolean(question?.options.find((option) => option.id === optionId)?.exclusive);
}
