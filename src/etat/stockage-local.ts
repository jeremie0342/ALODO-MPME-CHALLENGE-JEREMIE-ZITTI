import type { Reponses } from "@/domaine/types";

/**
 * Persistance du parcours côté navigateur, exposée comme un magasin externe.
 * Le marché visé répond depuis un téléphone d'entrée de gamme sur un réseau instable :
 * une session perdue est une MPME perdue pour la cohorte, pas seulement une gêne.
 *
 * Le magasin est lu via useSyncExternalStore plutôt que dans un effet, pour que le rendu
 * serveur et le rendu client restent cohérents sans rendu en cascade.
 */

const CLE = "alodo-mpme.diagnostic.v1";

export interface SessionDiagnostic {
  readonly reponses: Reponses;
  readonly indexCourant: number;
  readonly termine: boolean;
}

export const SESSION_VIDE: SessionDiagnostic = {
  reponses: {},
  indexCourant: 0,
  termine: false,
};

let cache: SessionDiagnostic | null = null;
const abonnes = new Set<() => void>();

function lireDepuisStockage(): SessionDiagnostic {
  if (typeof window === "undefined") return SESSION_VIDE;

  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return SESSION_VIDE;

    const session = JSON.parse(brut) as Partial<SessionDiagnostic>;

    return {
      reponses: session.reponses ?? {},
      indexCourant: session.indexCourant ?? 0,
      termine: session.termine ?? false,
    };
  } catch {
    // Stockage indisponible ou contenu corrompu : on repart d'une session vide
    // plutôt que de bloquer le parcours.
    return SESSION_VIDE;
  }
}

function ecrireDansStockage(session: SessionDiagnostic): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CLE, JSON.stringify(session));
  } catch {
    // Navigation privée ou quota atteint : le parcours continue en mémoire.
  }
}

export function souscrire(ecouteur: () => void): () => void {
  abonnes.add(ecouteur);

  return () => {
    abonnes.delete(ecouteur);
  };
}

/** Référence stable tant que la session n'a pas changé, comme l'exige useSyncExternalStore. */
export function instantane(): SessionDiagnostic {
  cache ??= lireDepuisStockage();

  return cache;
}

export function instantaneServeur(): SessionDiagnostic {
  return SESSION_VIDE;
}

export function majSession(transformer: (session: SessionDiagnostic) => SessionDiagnostic): void {
  cache = transformer(instantane());
  ecrireDansStockage(cache);

  for (const ecouteur of abonnes) ecouteur();
}

export function reinitialiserSession(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CLE);
    } catch {
      // Sans effet si le stockage est indisponible.
    }
  }

  cache = SESSION_VIDE;

  for (const ecouteur of abonnes) ecouteur();
}
