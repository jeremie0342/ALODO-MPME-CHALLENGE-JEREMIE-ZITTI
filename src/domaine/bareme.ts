import type { NatureDette, NiveauConfiance, NiveauMaturite } from "./types";

/**
 * Politique de notation, isolée du questionnaire.
 * Ajuster la sévérité du diagnostic se fait ici, sans toucher aux questions ni au moteur.
 */

/**
 * Décote appliquée à la dimension finance selon l'origine déclarée du chiffre (q6-origine).
 * Un chiffre non prouvable reste une information : on le décote, on ne l'annule pas.
 * Le plancher à 0,70 évite de sanctionner une population qui, par construction,
 * ne tient pas de comptabilité écrite.
 */
export const COEFFICIENTS_CONFIANCE: Readonly<Record<string, number>> = {
  registres: 1,
  estimation: 0.85,
  incertain: 0.7,
};

export const COEFFICIENT_CONFIANCE_DEFAUT = 0.7;

/**
 * Plafond du score global imposé par la seule question de l'existence légale.
 * Ce n'est pas une note mais une réalité juridique : sans entité enregistrée,
 * aucun crédit formel, quels que soient les chiffres par ailleurs.
 * Le plafond vient d'une question et non de toute la dimension, pour ne pas
 * sanctionner deux fois la même faiblesse.
 */
export const PLAFONDS_EXISTENCE_LEGALE: Readonly<Record<string, number>> = {
  "rccm-et-ifu": 100,
  "un-seul": 75,
  "en-cours": 60,
  aucun: 45,
};

export const PLAFOND_DEFAUT = 45;

export const QUESTION_EXISTENCE_LEGALE = "q1-enregistrement";
export const QUESTION_ORIGINE_CHIFFRE = "q6-origine";
export const DIMENSION_DECOTEE = "finance";

/**
 * Points accordés sur la question des dettes.
 *
 * Le risque tient au cumul des sources de remboursement, pas à leur nature prise
 * isolément. Une source informelle pèse plus lourd qu'une source formelle : elle est
 * invisible de tout autre système et échappe à l'encadrement.
 *
 * L'absence de dette n'y figure pas : elle vaut le maximum de la question, lu sur la
 * question elle-même pour ne pas dupliquer la valeur.
 */
export const BAREME_ENDETTEMENT = {
  /** Une seule source : la nature décide. */
  sourceUnique: { formelle: 18, informelle: 12 } as Readonly<
    Record<Exclude<NatureDette, "aucune">, number>
  >,
  /** Au-delà d'une source, le cumul prime sur la nature. Lu du plus grave au moins grave. */
  cumul: [
    { minimumSources: 3, points: 0 },
    { minimumSources: 2, points: 6 },
  ] as readonly { readonly minimumSources: number; readonly points: number }[],
} as const;

/** Bornes basses de chaque niveau de maturité, lues de la plus haute à la plus basse. */
export const SEUILS_MATURITE: readonly {
  readonly minimum: number;
  readonly niveau: NiveauMaturite;
}[] = [
  { minimum: 75, niveau: "solide" },
  { minimum: 55, niveau: "engage" },
  { minimum: 35, niveau: "fragile" },
  { minimum: 0, niveau: "critique" },
];

/** Nombre maximal de réponses d'ignorance toléré pour chaque niveau de confiance. */
export const SEUILS_CONFIANCE: readonly {
  readonly maximumIgnorances: number;
  readonly niveau: NiveauConfiance;
}[] = [
  { maximumIgnorances: 0, niveau: "elevee" },
  { maximumIgnorances: 2, niveau: "moyenne" },
  { maximumIgnorances: Number.POSITIVE_INFINITY, niveau: "faible" },
];
