import type { CleRecommandation, Frein, Reponses } from "./types";

/**
 * Le dernier kilomètre du diagnostic. « Renforcez votre structuration financière »
 * n'est pas une recommandation mais un constat reformulé : chaque frein est traduit
 * en une action unique, locale et exécutable dans la semaine.
 *
 * Ce module ne choisit que la clé. Les textes correspondants vivent dans les messages,
 * sous `recommandations.<questionId>.<variante>`.
 */

/**
 * Réponses qui appellent une formulation différente de la variante par défaut.
 * Une entreprise sans aucun document n'a pas la même première action qu'une
 * entreprise à qui il manque une pièce.
 */
const VARIANTES: Readonly<Record<string, readonly string[]>> = {
  "q1-enregistrement": ["aucun"],
};

export const CLE_PAR_DEFAUT: CleRecommandation = "defaut";

export function recommander(frein: Frein, reponses: Reponses): CleRecommandation {
  const reponse = reponses[frein.questionId]?.[0];
  const variantes = VARIANTES[frein.questionId] ?? [];

  if (reponse && variantes.includes(reponse)) return `${frein.questionId}.${reponse}`;

  return `${frein.questionId}.defaut`;
}
