import type { Dimension, Question } from "./types";

/**
 * Structure du diagnostic : identifiants, points et règles d'agrégation.
 * Aucune formulation ici, elles vivent dans messages/<langue>.json sous la même
 * arborescence d'identifiants.
 *
 * Trois dimensions sur les huit du programme. Elles répondent ensemble à une seule
 * question : cette entreprise peut-elle décrocher un premier crédit formel ?
 */
export const DIMENSIONS: readonly Dimension[] = [
  { id: "formalisation", poids: 0.3 },
  { id: "comptabilite", poids: 0.3 },
  { id: "finance", poids: 0.4 },
];

export const QUESTIONS: readonly Question[] = [
  {
    id: "q1-enregistrement",
    dimension: "formalisation",
    type: "choix-unique",
    pointsMax: 50,
    notee: true,
    options: [
      { id: "rccm-et-ifu", points: 50 },
      { id: "un-seul", points: 30 },
      { id: "en-cours", points: 15 },
      { id: "aucun", points: 0 },
    ],
  },
  {
    id: "q2-separation",
    dimension: "formalisation",
    type: "choix-unique",
    pointsMax: 30,
    notee: true,
    options: [
      { id: "separes", points: 30 },
      { id: "poreux", points: 15 },
      { id: "melanges", points: 0 },
    ],
  },
  {
    id: "q3-encaissement",
    dimension: "formalisation",
    type: "choix-multiple",
    avecAide: true,
    pointsMax: 20,
    notee: true,
    agregation: "meilleur-canal",
    options: [
      { id: "banque-entreprise", points: 20 },
      { id: "momo-entreprise", points: 16 },
      { id: "banque-perso", points: 8 },
      { id: "momo-perso", points: 6 },
      { id: "especes", points: 0 },
    ],
  },
  {
    id: "q4-enregistrement-flux",
    dimension: "comptabilite",
    type: "choix-unique",
    pointsMax: 40,
    notee: true,
    options: [
      { id: "logiciel", points: 40 },
      { id: "telephone", points: 30 },
      { id: "cahier", points: 20 },
      { id: "rien", points: 0 },
    ],
  },
  {
    id: "q5-pieces",
    dimension: "comptabilite",
    type: "choix-unique",
    pointsMax: 30,
    notee: true,
    options: [
      { id: "toujours", points: 30 },
      { id: "parfois", points: 15 },
      { id: "jamais", points: 0 },
    ],
  },
  {
    /**
     * Question centrale du diagnostic. Le montant n'est pas noté : on ne mesure pas
     * combien l'entreprise gagne, on mesure si le dirigeant le sait. Le montant est
     * conservé comme ligne de base, la sous-question porte toute la note.
     */
    id: "q6-benefice",
    dimension: "comptabilite",
    type: "tranche",
    pointsMax: 0,
    notee: false,
    options: [
      { id: "moins-50k", points: 0 },
      { id: "50k-150k", points: 0 },
      { id: "150k-500k", points: 0 },
      { id: "plus-500k", points: 0 },
      { id: "ne-sait-pas", points: 0, ignorance: true },
    ],
    sousQuestion: {
      id: "q6-origine",
      dimension: "comptabilite",
      type: "choix-unique",
      pointsMax: 30,
      notee: true,
      options: [
        { id: "registres", points: 30 },
        { id: "estimation", points: 12 },
        { id: "incertain", points: 0, ignorance: true },
      ],
    },
  },
  {
    id: "q7-dettes",
    dimension: "finance",
    type: "choix-multiple",
    avecAide: true,
    pointsMax: 25,
    notee: true,
    agregation: "cumul-dettes",
    options: [
      { id: "aucune", points: 25, exclusive: true, nature: "aucune" },
      { id: "banque", points: 0, nature: "formelle" },
      { id: "tontine", points: 0, nature: "informelle" },
      { id: "fournisseur", points: 0, nature: "informelle" },
      { id: "famille", points: 0, nature: "informelle" },
    ],
  },
  {
    id: "q8-creances",
    dimension: "finance",
    type: "choix-unique",
    pointsMax: 20,
    notee: true,
    options: [
      { id: "jamais", points: 20 },
      { id: "ponctuel", points: 15 },
      { id: "difficile", points: 5 },
      { id: "inconnu", points: 0, ignorance: true },
    ],
  },
  {
    id: "q9-coussin",
    dimension: "finance",
    type: "choix-unique",
    pointsMax: 35,
    notee: true,
    options: [
      { id: "plus-3-mois", points: 35 },
      { id: "1-3-mois", points: 26 },
      { id: "1-4-semaines", points: 14 },
      { id: "moins-semaine", points: 4 },
      { id: "ne-sait-pas", points: 0, ignorance: true },
    ],
  },
  {
    id: "q10-usage",
    dimension: "finance",
    type: "choix-unique",
    pointsMax: 20,
    notee: true,
    options: [
      { id: "stock", points: 20 },
      { id: "materiel", points: 18 },
      { id: "embauche", points: 14 },
      { id: "dettes", points: 5 },
      { id: "indecis", points: 0, ignorance: true },
    ],
  },
];

export const NOMBRE_QUESTIONS = QUESTIONS.length;

export function trouverQuestion(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

export function trouverDimension(id: string): Dimension | undefined {
  return DIMENSIONS.find((dimension) => dimension.id === id);
}

export function questionsDeDimension(dimension: string): readonly Question[] {
  return QUESTIONS.filter((question) => question.dimension === dimension);
}
