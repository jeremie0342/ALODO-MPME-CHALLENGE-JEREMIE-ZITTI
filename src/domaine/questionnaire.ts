import type { Dimension, Question } from "./types";

/**
 * Trois dimensions sur les huit du programme. Elles répondent ensemble à une seule
 * question : cette entreprise peut-elle décrocher un premier crédit formel ?
 * Les cinq autres sont soit observables par les outils de collecte ALODO,
 * soit sans objet à cette taille d'entreprise.
 */
export const DIMENSIONS: readonly Dimension[] = [
  {
    id: "formalisation",
    nom: "Formalisation",
    enjeu: "A-t-elle le droit d'emprunter ?",
    poids: 0.3,
  },
  {
    id: "comptabilite",
    nom: "Comptabilité",
    enjeu: "Peut-elle le prouver ?",
    poids: 0.3,
  },
  {
    id: "finance",
    nom: "Finance",
    enjeu: "En a-t-elle la capacité ?",
    poids: 0.4,
  },
];

/**
 * Les dix questions posées, dans l'ordre d'affichage.
 * Le questionnaire est de la donnée : ajouter une dimension ou une question
 * ne demande aucune modification du moteur de score ni des écrans.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: "q1-enregistrement",
    dimension: "formalisation",
    type: "choix-unique",
    intitule: "Votre entreprise est-elle enregistrée officiellement ?",
    pointsMax: 50,
    notee: true,
    options: [
      { id: "rccm-et-ifu", libelle: "J'ai un RCCM et un IFU", points: 50 },
      { id: "un-seul", libelle: "J'ai seulement l'un des deux", points: 30 },
      { id: "en-cours", libelle: "Non, mais j'ai commencé les démarches", points: 15 },
      { id: "aucun", libelle: "Non, pas du tout", points: 0 },
    ],
  },
  {
    id: "q2-separation",
    dimension: "formalisation",
    type: "choix-unique",
    intitule: "L'argent de l'entreprise et votre argent personnel, comment les gérez-vous ?",
    pointsMax: 30,
    notee: true,
    options: [
      { id: "separes", libelle: "Complètement séparés", points: 30 },
      { id: "poreux", libelle: "Séparés en général, mais je pioche parfois", points: 15 },
      { id: "melanges", libelle: "Tout est mélangé", points: 0 },
    ],
  },
  {
    id: "q3-encaissement",
    dimension: "formalisation",
    type: "choix-multiple",
    intitule: "Comment vos clients vous paient-ils ?",
    aide: "Plusieurs réponses possibles.",
    pointsMax: 20,
    notee: true,
    agregation: "meilleur-canal",
    options: [
      {
        id: "banque-entreprise",
        libelle: "Sur un compte bancaire au nom de l'entreprise",
        points: 20,
      },
      {
        id: "momo-entreprise",
        libelle: "Mobile Money, sur un numéro dédié à l'entreprise",
        points: 16,
      },
      { id: "banque-perso", libelle: "Sur un compte bancaire à mon nom", points: 8 },
      { id: "momo-perso", libelle: "Mobile Money, sur mon numéro personnel", points: 6 },
      { id: "especes", libelle: "En espèces", points: 0 },
    ],
  },
  {
    id: "q4-enregistrement-flux",
    dimension: "comptabilite",
    type: "choix-unique",
    intitule: "Comment notez-vous vos ventes et vos dépenses ?",
    pointsMax: 40,
    notee: true,
    options: [
      { id: "logiciel", libelle: "Avec un logiciel de gestion", points: 40 },
      { id: "telephone", libelle: "Sur mon téléphone (notes, WhatsApp, tableur)", points: 30 },
      { id: "cahier", libelle: "Dans un cahier", points: 20 },
      { id: "rien", libelle: "Je ne note pas", points: 0 },
    ],
  },
  {
    id: "q5-pieces",
    dimension: "comptabilite",
    type: "choix-unique",
    intitule: "Gardez-vous les factures et reçus de vos achats ?",
    pointsMax: 30,
    notee: true,
    options: [
      { id: "toujours", libelle: "Toujours", points: 30 },
      { id: "parfois", libelle: "Parfois, quand le fournisseur en donne", points: 15 },
      { id: "jamais", libelle: "Rarement ou jamais", points: 0 },
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
    intitule:
      "Le mois dernier, combien votre entreprise a-t-elle gagné une fois toutes les dépenses payées ?",
    pointsMax: 0,
    notee: false,
    options: [
      { id: "moins-50k", libelle: "Moins de 50 000 F", points: 0 },
      { id: "50k-150k", libelle: "50 000 à 150 000 F", points: 0 },
      { id: "150k-500k", libelle: "150 000 à 500 000 F", points: 0 },
      { id: "plus-500k", libelle: "Plus de 500 000 F", points: 0 },
      { id: "ne-sait-pas", libelle: "Je ne sais pas", points: 0, ignorance: true },
    ],
    sousQuestion: {
      id: "q6-origine",
      dimension: "comptabilite",
      type: "choix-unique",
      intitule: "Ce chiffre, vous le tirez d'où ?",
      pointsMax: 30,
      notee: true,
      options: [
        { id: "registres", libelle: "De mes registres écrits", points: 30 },
        { id: "estimation", libelle: "Je l'estime de tête", points: 12 },
        { id: "incertain", libelle: "Je ne sais pas vraiment", points: 0, ignorance: true },
      ],
    },
  },
  {
    id: "q7-dettes",
    dimension: "finance",
    type: "choix-multiple",
    intitule: "Avez-vous de l'argent à rembourser en ce moment ?",
    aide: "Plusieurs réponses possibles.",
    pointsMax: 25,
    notee: true,
    agregation: "cumul-dettes",
    options: [
      { id: "aucune", libelle: "Non, rien", points: 25, exclusive: true, nature: "aucune" },
      {
        id: "banque",
        libelle: "À une banque ou une microfinance",
        points: 0,
        nature: "formelle",
      },
      { id: "tontine", libelle: "Dans une tontine", points: 0, nature: "informelle" },
      { id: "fournisseur", libelle: "À un fournisseur", points: 0, nature: "informelle" },
      { id: "famille", libelle: "À la famille ou à des proches", points: 0, nature: "informelle" },
    ],
  },
  {
    id: "q8-creances",
    dimension: "finance",
    type: "choix-unique",
    intitule: "Vos clients vous achètent-ils à crédit ?",
    pointsMax: 20,
    notee: true,
    options: [
      { id: "jamais", libelle: "Jamais, tout le monde paie comptant", points: 20 },
      { id: "ponctuel", libelle: "Parfois, et ils paient dans les temps", points: 15 },
      { id: "difficile", libelle: "Souvent, et j'ai du mal à me faire payer", points: 5 },
      {
        id: "inconnu",
        libelle: "Je ne sais pas combien on me doit au total",
        points: 0,
        ignorance: true,
      },
    ],
  },
  {
    id: "q9-coussin",
    dimension: "finance",
    type: "choix-unique",
    intitule:
      "Si vos ventes s'arrêtaient demain, combien de temps pourriez-vous encore payer le loyer, les fournisseurs et les salaires ?",
    pointsMax: 35,
    notee: true,
    options: [
      { id: "plus-3-mois", libelle: "Plus de 3 mois", points: 35 },
      { id: "1-3-mois", libelle: "1 à 3 mois", points: 26 },
      { id: "1-4-semaines", libelle: "1 à 4 semaines", points: 14 },
      { id: "moins-semaine", libelle: "Moins d'une semaine", points: 4 },
      { id: "ne-sait-pas", libelle: "Je ne sais pas", points: 0, ignorance: true },
    ],
  },
  {
    id: "q10-usage",
    dimension: "finance",
    type: "choix-unique",
    intitule: "Si vous obteniez un financement demain, à quoi servirait-il en priorité ?",
    pointsMax: 20,
    notee: true,
    options: [
      { id: "stock", libelle: "Acheter plus de stock", points: 20 },
      { id: "materiel", libelle: "Acheter du matériel ou une machine", points: 18 },
      { id: "embauche", libelle: "Embaucher", points: 14 },
      { id: "dettes", libelle: "Rembourser des dettes existantes", points: 5 },
      { id: "indecis", libelle: "Je ne sais pas encore", points: 0, ignorance: true },
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
