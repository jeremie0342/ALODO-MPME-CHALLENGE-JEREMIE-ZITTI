import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import { DIMENSIONS, QUESTIONS } from "@/domaine/questionnaire";
import { toutesLesQuestions } from "@/domaine/scoring";

/**
 * Le domaine ne contient aucun libellé : chaque identifiant doit trouver sa formulation
 * dans chaque langue. Une clé oubliée est le défaut classique d'une traduction, et il ne
 * se voit qu'à l'exécution, sur l'écran concerné. Ces tests le font échouer à la vérification.
 */

const DICTIONNAIRES = [
  ["fr", fr],
  ["en", en],
] as const;

type Noeud = Record<string, unknown>;

function lire(source: unknown, chemin: string): unknown {
  return chemin.split(".").reduce<unknown>((courant, segment) => {
    if (courant && typeof courant === "object") return (courant as Noeud)[segment];

    return undefined;
  }, source);
}

/** Aplatit un dictionnaire en liste de chemins, pour comparer deux langues. */
function chemins(source: unknown, prefixe = ""): string[] {
  if (!source || typeof source !== "object") return [prefixe];

  return Object.entries(source as Noeud).flatMap(([cle, valeur]) =>
    chemins(valeur, prefixe ? `${prefixe}.${cle}` : cle),
  );
}

describe.each(DICTIONNAIRES)("dictionnaire %s", (langue, messages) => {
  it("traduit chaque question et chacune de ses options", () => {
    const manquantes: string[] = [];

    for (const question of toutesLesQuestions()) {
      if (!lire(messages, `questions.${question.id}.intitule`)) {
        manquantes.push(`questions.${question.id}.intitule`);
      }

      if (question.avecAide && !lire(messages, `questions.${question.id}.aide`)) {
        manquantes.push(`questions.${question.id}.aide`);
      }

      for (const option of question.options) {
        const chemin = `questions.${question.id}.options.${option.id}`;
        if (!lire(messages, chemin)) manquantes.push(chemin);
      }
    }

    expect(manquantes, `langue ${langue}`).toEqual([]);
  });

  it("traduit une recommandation par question notee", () => {
    const manquantes: string[] = [];

    for (const question of QUESTIONS) {
      const cible = question.sousQuestion?.notee ? question.sousQuestion.id : question.id;
      if (!question.notee && !question.sousQuestion?.notee) continue;

      for (const champ of ["titre", "action", "justification"]) {
        const chemin = `recommandations.${cible}.defaut.${champ}`;
        if (!lire(messages, chemin)) manquantes.push(chemin);
      }
    }

    expect(manquantes, `langue ${langue}`).toEqual([]);
  });

  it("traduit chaque dimension", () => {
    for (const dimension of DIMENSIONS) {
      expect(lire(messages, `dimensions.${dimension.id}.nom`), dimension.id).toBeTruthy();
      expect(lire(messages, `dimensions.${dimension.id}.enjeu`), dimension.id).toBeTruthy();
    }
  });

  it("traduit chaque niveau de maturite et de confiance", () => {
    for (const niveau of ["critique", "fragile", "engage", "solide"]) {
      expect(lire(messages, `maturite.${niveau}`), niveau).toBeTruthy();
    }

    for (const niveau of ["faible", "moyenne", "elevee"]) {
      expect(lire(messages, `confiance.${niveau}`), niveau).toBeTruthy();
    }
  });
});

describe("parite entre les langues", () => {
  it("expose exactement les memes cles en francais et en anglais", () => {
    const cheminsFr = new Set(chemins(fr));
    const cheminsEn = new Set(chemins(en));

    const absentesEnAnglais = [...cheminsFr].filter((cle) => !cheminsEn.has(cle));
    const absentesEnFrancais = [...cheminsEn].filter((cle) => !cheminsFr.has(cle));

    expect(absentesEnAnglais).toEqual([]);
    expect(absentesEnFrancais).toEqual([]);
  });

  it("ne laisse aucune valeur vide", () => {
    for (const [langue, messages] of DICTIONNAIRES) {
      const vides = chemins(messages).filter((cle) => {
        const valeur = lire(messages, cle);

        return typeof valeur !== "string" || valeur.trim().length === 0;
      });

      expect(vides, `langue ${langue}`).toEqual([]);
    }
  });
});
