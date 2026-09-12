import {
  COEFFICIENTS_CONFIANCE,
  COEFFICIENT_CONFIANCE_DEFAUT,
  DIMENSION_DECOTEE,
  PLAFONDS_EXISTENCE_LEGALE,
  PLAFOND_DEFAUT,
  QUESTION_EXISTENCE_LEGALE,
  QUESTION_ORIGINE_CHIFFRE,
  SEUILS_CONFIANCE,
  SEUILS_MATURITE,
} from "./bareme";
import { DIMENSIONS, QUESTIONS } from "./questionnaire";
import { recommander } from "./recommandations";
import type {
  Frein,
  IdentifiantDimension,
  NiveauConfiance,
  NiveauMaturite,
  Question,
  Reponses,
  Resultat,
  ScoreDimension,
} from "./types";

/** Aplatit les questions et leurs sous-questions en une seule liste notable. */
export function questionsNotees(): readonly Question[] {
  return QUESTIONS.flatMap((question) => [
    ...(question.notee ? [question] : []),
    ...(question.sousQuestion?.notee ? [question.sousQuestion] : []),
  ]);
}

/** Toutes les questions, sous-questions comprises, notées ou non. */
export function toutesLesQuestions(): readonly Question[] {
  return QUESTIONS.flatMap((question) => [
    question,
    ...(question.sousQuestion ? [question.sousQuestion] : []),
  ]);
}

/**
 * Points obtenus sur une question.
 * Les questions à choix multiple délèguent à leur stratégie d'agrégation :
 * sommer les options gonflerait le score en multipliant les réponses.
 */
export function pointsQuestion(question: Question, selection: readonly string[]): number {
  if (!question.notee || selection.length === 0) return 0;

  const choisies = question.options.filter((option) => selection.includes(option.id));
  if (choisies.length === 0) return 0;

  switch (question.agregation) {
    case "meilleur-canal":
      return Math.max(...choisies.map((option) => option.points));

    case "cumul-dettes":
      return pointsEndettement(
        question,
        choisies.map((option) => option.nature),
      );

    default:
      return choisies[0].points;
  }
}

/**
 * Le risque tient au cumul des sources de remboursement, pas à leur nature prise isolément.
 * L'endettement informel pèse plus lourd que le formel : il est invisible de tout
 * autre système et échappe à l'encadrement.
 */
function pointsEndettement(question: Question, natures: readonly (string | undefined)[]): number {
  if (natures.includes("aucune")) return question.pointsMax;

  const sources = natures.filter((nature) => nature === "formelle" || nature === "informelle");

  if (sources.length === 0) return question.pointsMax;
  if (sources.length >= 3) return 0;
  if (sources.length === 2) return 6;

  return sources[0] === "formelle" ? 18 : 12;
}

/**
 * Une question est acquise quand elle et sa sous-question éventuelle portent une sélection.
 * Partagée par le parcours et par le rail de progression, pour qu'ils ne divergent jamais.
 */
export function estRepondue(question: Question, reponses: Reponses): boolean {
  const principale = (reponses[question.id] ?? []).length > 0;
  if (!question.sousQuestion) return principale;

  return principale && (reponses[question.sousQuestion.id] ?? []).length > 0;
}

/** Score d'une dimension ramené sur 100. */
export function scoreBrutDimension(dimension: IdentifiantDimension, reponses: Reponses): number {
  const questions = questionsNotees().filter((question) => question.dimension === dimension);

  const obtenus = questions.reduce(
    (total, question) => total + pointsQuestion(question, reponses[question.id] ?? []),
    0,
  );
  const maximum = questions.reduce((total, question) => total + question.pointsMax, 0);

  return maximum === 0 ? 0 : arrondir((obtenus / maximum) * 100);
}

/** Coefficient de décote, lu sur l'origine déclarée du chiffre. */
export function coefficientConfiance(reponses: Reponses): number {
  const origine = reponses[QUESTION_ORIGINE_CHIFFRE]?.[0];
  if (!origine) return COEFFICIENT_CONFIANCE_DEFAUT;

  return COEFFICIENTS_CONFIANCE[origine] ?? COEFFICIENT_CONFIANCE_DEFAUT;
}

/** Plafond global imposé par l'existence légale. */
export function plafondExistenceLegale(reponses: Reponses): number {
  const statut = reponses[QUESTION_EXISTENCE_LEGALE]?.[0];
  if (!statut) return PLAFOND_DEFAUT;

  return PLAFONDS_EXISTENCE_LEGALE[statut] ?? PLAFOND_DEFAUT;
}

/**
 * Une réponse d'ignorance n'est pas une donnée manquante : c'est un résultat.
 * Leur nombre détermine la confiance accordée au score, affichée à côté de lui.
 */
export function compterIgnorances(reponses: Reponses): number {
  return toutesLesQuestions().reduce((total, question) => {
    const selection = reponses[question.id] ?? [];
    const ignorees = question.options.filter(
      (option) => option.ignorance && selection.includes(option.id),
    );

    return total + ignorees.length;
  }, 0);
}

/**
 * La confiance tient à deux choses : le nombre d'ignorances assumées, et la provenance
 * du chiffre financier. Un score dont la donnée centrale est estimée de mémoire ne peut
 * pas être présenté comme fiable, même si le dirigeant a répondu à tout.
 */
export function niveauConfiance(reponses: Reponses): NiveauConfiance {
  const ignorances = compterIgnorances(reponses);
  const parIgnorance =
    SEUILS_CONFIANCE.find((seuil) => ignorances <= seuil.maximumIgnorances)?.niveau ?? "faible";

  const chiffreProuve = coefficientConfiance(reponses) === 1;
  if (!chiffreProuve && parIgnorance === "elevee") return "moyenne";

  return parIgnorance;
}

export function niveauMaturite(score: number): NiveauMaturite {
  return SEUILS_MATURITE.find((seuil) => score >= seuil.minimum)?.niveau ?? "critique";
}

/**
 * Frein principal : la question au plus grand écart au maximum, pondéré par le poids
 * de sa dimension. On cible une question et non une dimension, parce qu'une question
 * se traduit en une action alors qu'une dimension ne donne qu'un reproche vague.
 * L'existence légale prime toujours : rien d'autre ne débloque un crédit formel.
 */
export function identifierFrein(reponses: Reponses): Frein {
  const poids = new Map(DIMENSIONS.map((dimension) => [dimension.id, dimension.poids]));

  const ecarts = questionsNotees()
    .map((question) => ({
      questionId: question.id,
      dimension: question.dimension,
      ecartPondere:
        (question.pointsMax - pointsQuestion(question, reponses[question.id] ?? [])) *
        (poids.get(question.dimension) ?? 0),
    }))
    .sort((a, b) => b.ecartPondere - a.ecartPondere);

  const existenceLegale = ecarts.find((ecart) => ecart.questionId === QUESTION_EXISTENCE_LEGALE);
  const sansExistenceLegale = reponses[QUESTION_EXISTENCE_LEGALE]?.[0] === "aucun";

  if (sansExistenceLegale && existenceLegale) return existenceLegale;

  return ecarts[0];
}

export function pointFort(dimensions: readonly ScoreDimension[]): IdentifiantDimension {
  return dimensions.reduce((meilleure, courante) =>
    courante.ajuste > meilleure.ajuste ? courante : meilleure,
  ).dimension;
}

/** Calcule le résultat complet. Fonction pure : mêmes réponses, même résultat. */
export function calculerResultat(reponses: Reponses): Resultat {
  const coefficient = coefficientConfiance(reponses);

  const dimensions: readonly ScoreDimension[] = DIMENSIONS.map((dimension) => {
    const brut = scoreBrutDimension(dimension.id, reponses);
    const ajuste = dimension.id === DIMENSION_DECOTEE ? arrondir(brut * coefficient) : brut;

    return { dimension: dimension.id, brut, ajuste };
  });

  const base = DIMENSIONS.reduce((total, dimension) => {
    const score = dimensions.find((entree) => entree.dimension === dimension.id);

    return total + (score?.ajuste ?? 0) * dimension.poids;
  }, 0);

  const plafond = plafondExistenceLegale(reponses);
  const score = Math.min(arrondir(base), plafond);
  const frein = identifierFrein(reponses);

  return {
    score,
    niveau: niveauMaturite(score),
    confiance: niveauConfiance(reponses),
    dimensions,
    coefficientConfiance: coefficient,
    plafond,
    plafondAtteint: arrondir(base) > plafond,
    pointFort: pointFort(dimensions),
    frein,
    recommandation: recommander(frein, reponses),
  };
}

function arrondir(valeur: number): number {
  return Math.round(valeur);
}
