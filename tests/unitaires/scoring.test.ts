import { describe, expect, it } from "vitest";

import { DIMENSIONS, QUESTIONS } from "@/domaine/questionnaire";
import {
  calculerResultat,
  coefficientConfiance,
  compterIgnorances,
  identifierFrein,
  niveauMaturite,
  plafondExistenceLegale,
  pointsQuestion,
  questionsNotees,
  scoreBrutDimension,
} from "@/domaine/scoring";
import type { Reponses } from "@/domaine/types";

/** Entreprise idéale : toutes les meilleures réponses. */
const PARFAIT: Reponses = {
  "q1-enregistrement": ["rccm-et-ifu"],
  "q2-separation": ["separes"],
  "q3-encaissement": ["banque-entreprise"],
  "q4-enregistrement-flux": ["logiciel"],
  "q5-pieces": ["toujours"],
  "q6-benefice": ["plus-500k"],
  "q6-origine": ["registres"],
  "q7-dettes": ["aucune"],
  "q8-creances": ["jamais"],
  "q9-coussin": ["plus-3-mois"],
  "q10-usage": ["stock"],
};

/** Cas de référence documenté dans docs/scoring.md. */
const COMMERCE_DETAIL: Reponses = {
  "q1-enregistrement": ["un-seul"],
  "q2-separation": ["poreux"],
  "q3-encaissement": ["momo-perso", "especes"],
  "q4-enregistrement-flux": ["cahier"],
  "q5-pieces": ["parfois"],
  "q6-benefice": ["50k-150k"],
  "q6-origine": ["estimation"],
  "q7-dettes": ["tontine", "fournisseur"],
  "q8-creances": ["difficile"],
  "q9-coussin": ["1-4-semaines"],
  "q10-usage": ["stock"],
};

describe("cohérence du barème", () => {
  it("chaque dimension totalise exactement 100 points", () => {
    for (const dimension of DIMENSIONS) {
      const total = questionsNotees()
        .filter((question) => question.dimension === dimension.id)
        .reduce((somme, question) => somme + question.pointsMax, 0);

      expect(total, `dimension ${dimension.id}`).toBe(100);
    }
  });

  it("les poids des dimensions totalisent 1", () => {
    const somme = DIMENSIONS.reduce((total, dimension) => total + dimension.poids, 0);

    expect(somme).toBeCloseTo(1, 10);
  });

  it("aucune option ne dépasse le maximum de sa question", () => {
    for (const question of questionsNotees()) {
      for (const option of question.options) {
        expect(option.points, `${question.id}/${option.id}`).toBeLessThanOrEqual(
          question.pointsMax,
        );
      }
    }
  });

  it("les identifiants de questions sont uniques", () => {
    const identifiants = QUESTIONS.flatMap((question) => [
      question.id,
      ...(question.sousQuestion ? [question.sousQuestion.id] : []),
    ]);

    expect(new Set(identifiants).size).toBe(identifiants.length);
  });

  it("pose dix questions à l'utilisateur", () => {
    expect(QUESTIONS).toHaveLength(10);
  });
});

describe("points par question", () => {
  it("retourne zéro sans réponse", () => {
    const question = QUESTIONS[0];

    expect(pointsQuestion(question, [])).toBe(0);
  });

  it("ne note pas la question de montant", () => {
    const montant = QUESTIONS.find((question) => question.id === "q6-benefice");

    expect(montant).toBeDefined();
    expect(pointsQuestion(montant!, ["plus-500k"])).toBe(0);
  });

  describe("stratégie meilleur-canal", () => {
    const encaissement = QUESTIONS.find((question) => question.id === "q3-encaissement")!;

    it("retient le meilleur canal et n'additionne pas les réponses", () => {
      const multiple = pointsQuestion(encaissement, ["especes", "momo-perso", "momo-entreprise"]);

      expect(multiple).toBe(16);
      expect(multiple).toBeLessThanOrEqual(encaissement.pointsMax);
    });

    it("ne récompense pas la multiplication des canaux informels", () => {
      const seul = pointsQuestion(encaissement, ["especes"]);
      const cumul = pointsQuestion(encaissement, ["especes", "especes"]);

      expect(cumul).toBe(seul);
    });
  });

  describe("stratégie cumul-dettes", () => {
    const dettes = QUESTIONS.find((question) => question.id === "q7-dettes")!;

    it("accorde le maximum en l'absence de dette", () => {
      expect(pointsQuestion(dettes, ["aucune"])).toBe(25);
    });

    it("pénalise davantage une dette informelle qu'une dette formelle", () => {
      expect(pointsQuestion(dettes, ["banque"])).toBe(18);
      expect(pointsQuestion(dettes, ["tontine"])).toBe(12);
    });

    it("décroît avec le cumul des sources", () => {
      const une = pointsQuestion(dettes, ["banque"]);
      const deux = pointsQuestion(dettes, ["banque", "tontine"]);
      const trois = pointsQuestion(dettes, ["banque", "tontine", "famille"]);

      expect(une).toBeGreaterThan(deux);
      expect(deux).toBeGreaterThan(trois);
      expect(trois).toBe(0);
    });
  });
});

describe("décote de confiance", () => {
  it("applique le coefficient plein sur des registres écrits", () => {
    expect(coefficientConfiance({ "q6-origine": ["registres"] })).toBe(1);
  });

  it("décote une estimation de tête", () => {
    expect(coefficientConfiance({ "q6-origine": ["estimation"] })).toBe(0.85);
  });

  it("décote sans annuler quand le dirigeant ignore ses chiffres", () => {
    const coefficient = coefficientConfiance({ "q6-origine": ["incertain"] });

    expect(coefficient).toBe(0.7);
    expect(coefficient).toBeGreaterThan(0);
  });

  it("retombe sur le plancher en l'absence de réponse", () => {
    expect(coefficientConfiance({})).toBe(0.7);
  });

  it("n'affecte que la dimension finance", () => {
    const resultat = calculerResultat({ ...PARFAIT, "q6-origine": ["incertain"] });
    const finance = resultat.dimensions.find((entree) => entree.dimension === "finance")!;
    const formalisation = resultat.dimensions.find(
      (entree) => entree.dimension === "formalisation",
    )!;

    expect(finance.ajuste).toBeLessThan(finance.brut);
    expect(formalisation.ajuste).toBe(formalisation.brut);
  });
});

describe("plafond d'existence légale", () => {
  it("ne contraint pas une entreprise pleinement enregistrée", () => {
    expect(plafondExistenceLegale({ "q1-enregistrement": ["rccm-et-ifu"] })).toBe(100);
  });

  it("plafonne une entreprise non enregistrée", () => {
    expect(plafondExistenceLegale({ "q1-enregistrement": ["aucun"] })).toBe(45);
  });

  it("écrase un score par ailleurs excellent", () => {
    const resultat = calculerResultat({ ...PARFAIT, "q1-enregistrement": ["aucun"] });

    expect(resultat.score).toBe(45);
    expect(resultat.plafondAtteint).toBe(true);
  });

  it("laisse passer le score quand il est déjà sous le plafond", () => {
    const resultat = calculerResultat(COMMERCE_DETAIL);

    expect(resultat.plafondAtteint).toBe(false);
    expect(resultat.score).toBeLessThan(resultat.plafond);
  });
});

describe("ignorance et confiance", () => {
  it("compte les réponses d'ignorance plutôt que de les ignorer", () => {
    const reponses: Reponses = {
      ...PARFAIT,
      "q6-benefice": ["ne-sait-pas"],
      "q8-creances": ["inconnu"],
      "q9-coussin": ["ne-sait-pas"],
    };

    expect(compterIgnorances(reponses)).toBe(3);
  });

  it("refuse une confiance élevée quand le chiffre est estimé de mémoire", () => {
    const resultat = calculerResultat({ ...PARFAIT, "q6-origine": ["estimation"] });

    expect(compterIgnorances({ ...PARFAIT, "q6-origine": ["estimation"] })).toBe(0);
    expect(resultat.confiance).toBe("moyenne");
  });

  it("descend la confiance à mesure que les ignorances s'accumulent", () => {
    expect(calculerResultat(PARFAIT).confiance).toBe("elevee");
    expect(calculerResultat({ ...PARFAIT, "q9-coussin": ["ne-sait-pas"] }).confiance).toBe(
      "moyenne",
    );
    expect(
      calculerResultat({
        ...PARFAIT,
        "q6-benefice": ["ne-sait-pas"],
        "q8-creances": ["inconnu"],
        "q9-coussin": ["ne-sait-pas"],
      }).confiance,
    ).toBe("faible");
  });
});

describe("frein principal", () => {
  it("désigne une question et non une dimension", () => {
    const frein = identifierFrein(COMMERCE_DETAIL);

    expect(QUESTIONS.some((question) => question.id === frein.questionId)).toBe(true);
  });

  it("donne toujours la priorité à l'existence légale quand elle manque", () => {
    const frein = identifierFrein({ ...PARFAIT, "q1-enregistrement": ["aucun"] });

    expect(frein.questionId).toBe("q1-enregistrement");
  });

  it("retient l'écart pondéré le plus grand sinon", () => {
    const frein = identifierFrein({ ...PARFAIT, "q9-coussin": ["moins-semaine"] });

    expect(frein.questionId).toBe("q9-coussin");
  });

  it("designe une recommandation par sa cle", () => {
    const { recommandation, frein } = calculerResultat(COMMERCE_DETAIL);

    expect(recommandation).toBe(`${frein.questionId}.defaut`);
  });

  it("choisit la variante propre a une reponse quand elle existe", () => {
    const { recommandation } = calculerResultat({ ...PARFAIT, "q1-enregistrement": ["aucun"] });

    expect(recommandation).toBe("q1-enregistrement.aucun");
  });
});

describe("niveaux de maturité", () => {
  it.each([
    [0, "critique"],
    [34, "critique"],
    [35, "fragile"],
    [54, "fragile"],
    [55, "engage"],
    [74, "engage"],
    [75, "solide"],
    [100, "solide"],
  ])("classe un score de %i en %s", (score, attendu) => {
    expect(niveauMaturite(score)).toBe(attendu);
  });
});

describe("résultat global", () => {
  it("borne le score entre 0 et 100", () => {
    expect(calculerResultat({}).score).toBeGreaterThanOrEqual(0);
    expect(calculerResultat(PARFAIT).score).toBeLessThanOrEqual(100);
  });

  it("attribue 100 à une entreprise irréprochable", () => {
    const resultat = calculerResultat(PARFAIT);

    expect(resultat.score).toBe(100);
    expect(resultat.niveau).toBe("solide");
    expect(resultat.confiance).toBe("elevee");
  });

  it("reste calculable sur un questionnaire vide", () => {
    const resultat = calculerResultat({});

    expect(resultat.score).toBe(0);
    expect(resultat.niveau).toBe("critique");
    // Sans aucune réponse, le chiffre financier n'est pas prouvé : la confiance est décotée.
    expect(resultat.confiance).toBe("moyenne");
  });

  it("reproduit le cas de référence du commerce de détail", () => {
    const resultat = calculerResultat(COMMERCE_DETAIL);
    const parDimension = Object.fromEntries(
      resultat.dimensions.map((entree) => [entree.dimension, entree]),
    );

    expect(parDimension.formalisation.brut).toBe(51);
    expect(parDimension.comptabilite.brut).toBe(47);
    expect(parDimension.finance.brut).toBe(45);
    expect(parDimension.finance.ajuste).toBe(38);
    expect(resultat.score).toBe(45);
    expect(resultat.niveau).toBe("fragile");
    expect(resultat.confiance).toBe("moyenne");
  });

  it("est déterministe", () => {
    expect(calculerResultat(COMMERCE_DETAIL)).toEqual(calculerResultat(COMMERCE_DETAIL));
  });

  it("ne régresse jamais quand une réponse s'améliore", () => {
    const avant = calculerResultat(COMMERCE_DETAIL).score;
    const apres = calculerResultat({
      ...COMMERCE_DETAIL,
      "q4-enregistrement-flux": ["logiciel"],
    }).score;

    expect(apres).toBeGreaterThan(avant);
  });
});

describe("score par dimension", () => {
  it("ramène chaque dimension sur 100", () => {
    for (const dimension of DIMENSIONS) {
      const score = scoreBrutDimension(dimension.id, PARFAIT);

      expect(score, `dimension ${dimension.id}`).toBe(100);
    }
  });
});
