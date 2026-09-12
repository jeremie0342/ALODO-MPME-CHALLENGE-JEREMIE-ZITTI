/** Les trois dimensions retenues parmi les huit du programme ALODO MPME. */
export type IdentifiantDimension = "formalisation" | "comptabilite" | "finance";

export type TypeQuestion = "choix-unique" | "choix-multiple" | "tranche";

/**
 * Stratégie de calcul des points quand plusieurs options sont sélectionnables.
 * Le nom vit dans la donnée, l'implémentation dans le moteur : ajouter une question
 * à choix multiple ne demande pas de toucher au moteur tant qu'une stratégie existante suffit.
 */
export type StrategieAgregation = "meilleur-canal" | "cumul-dettes";

/** Nature d'une dette, utilisée par la stratégie cumul-dettes. */
export type NatureDette = "aucune" | "formelle" | "informelle";

export interface Option {
  readonly id: string;
  readonly libelle: string;
  readonly points: number;
  /** Marque une réponse d'ignorance : elle est notée, et elle abaisse l'indice de confiance. */
  readonly ignorance?: boolean;
  /** Réponse qui vide toute autre sélection sur une question à choix multiple. */
  readonly exclusive?: boolean;
  readonly nature?: NatureDette;
}

export interface Question {
  readonly id: string;
  readonly dimension: IdentifiantDimension;
  readonly type: TypeQuestion;
  readonly intitule: string;
  /** Précision affichée sous l'intitulé, pour lever une ambiguïté sans allonger la question. */
  readonly aide?: string;
  readonly options: readonly Option[];
  readonly pointsMax: number;
  /**
   * Une question non notée est enregistrée sans entrer dans le score.
   * Q6a est dans ce cas : on relève le montant comme ligne de base, sans lui faire confiance.
   */
  readonly notee: boolean;
  readonly agregation?: StrategieAgregation;
  /** Question posée sur le même écran que sa parente. */
  readonly sousQuestion?: Question;
}

export interface Dimension {
  readonly id: IdentifiantDimension;
  readonly nom: string;
  /** Ce que la dimension établit, formulé côté accès au crédit. */
  readonly enjeu: string;
  /** Poids dans le score global. La somme des poids vaut 1. */
  readonly poids: number;
}

/** Réponses saisies, indexées par identifiant de question. */
export type Reponses = Readonly<Record<string, readonly string[]>>;

export type NiveauMaturite = "critique" | "fragile" | "engage" | "solide";

export type NiveauConfiance = "faible" | "moyenne" | "elevee";

export interface ScoreDimension {
  readonly dimension: IdentifiantDimension;
  readonly brut: number;
  /** Score après décote de confiance. Identique au brut hors dimension finance. */
  readonly ajuste: number;
}

export interface Frein {
  readonly questionId: string;
  readonly intitule: string;
  readonly dimension: IdentifiantDimension;
  /** Points manqués sur la question, pondérés par le poids de sa dimension. */
  readonly ecartPondere: number;
}

export interface Resultat {
  readonly score: number;
  readonly niveau: NiveauMaturite;
  readonly confiance: NiveauConfiance;
  readonly dimensions: readonly ScoreDimension[];
  /** Coefficient appliqué à la dimension finance, issu de l'origine déclarée du chiffre. */
  readonly coefficientConfiance: number;
  /** Plafond imposé par l'existence légale. Vaut 100 quand il ne contraint pas. */
  readonly plafond: number;
  readonly plafondAtteint: boolean;
  readonly pointFort: IdentifiantDimension;
  readonly frein: Frein;
  readonly recommandation: Recommandation;
}

export interface Recommandation {
  readonly titre: string;
  readonly action: string;
  /** Pourquoi cette action précède les autres. */
  readonly justification: string;
}
