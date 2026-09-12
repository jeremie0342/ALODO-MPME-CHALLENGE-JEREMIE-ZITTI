import { expect, test, type Page } from "@playwright/test";

/**
 * Parcours de bout en bout, joué sur bureau et sur mobile.
 * Ces tests cadrent ce que le PDF exige : un parcours complet, une progression
 * toujours lisible, et un résultat compréhensible.
 */

/** Répond à la question affichée en choisissant l'option dont le libellé est donné. */
async function repondre(page: Page, libelle: string | RegExp) {
  await page
    .getByText(libelle, { exact: typeof libelle === "string" })
    .first()
    .click();
}

async function continuer(page: Page) {
  await page.getByRole("button", { name: /Continuer|Voir mon résultat/ }).click();
}

/** Joue les dix questions en retenant toujours la première option proposée. */
async function parcoursComplet(page: Page) {
  await page.goto("/diagnostic");

  for (let rang = 0; rang < 10; rang += 1) {
    await page.locator("label").first().click();

    const sousQuestion = page.locator("section label").first();
    if (await sousQuestion.isVisible().catch(() => false)) {
      await sousQuestion.click();
    }

    await continuer(page);
  }

  await page.waitForURL("**/diagnostic/resultat");
}

test.describe("accueil", () => {
  test("présente l'objectif, la durée et le bouton de départ", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("10 questions")).toBeVisible();
    await expect(page.getByText("5 minutes")).toBeVisible();
    await expect(page.getByRole("link", { name: /Commencer le diagnostic/ })).toBeVisible();
  });

  test("annonce les trois dimensions évaluées", async ({ page }) => {
    await page.goto("/");

    for (const dimension of ["Formalisation", "Comptabilité", "Finance"]) {
      await expect(page.getByRole("heading", { name: dimension })).toBeVisible();
    }
  });

  test("mène au diagnostic", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Commencer le diagnostic/ }).click();

    await expect(page).toHaveURL(/\/diagnostic$/);
  });
});

test.describe("parcours de questions", () => {
  test("bloque l'avancement tant que la question n'a pas de réponse", async ({ page }) => {
    await page.goto("/diagnostic");

    const continuerBouton = page.getByRole("button", { name: "Continuer" });
    await expect(continuerBouton).toBeDisabled();

    await repondre(page, "J'ai un RCCM et un IFU");
    await expect(continuerBouton).toBeEnabled();
  });

  test("affiche en permanence la position dans le parcours", async ({ page }) => {
    await page.goto("/diagnostic");

    await expect(page.getByText("01 / 10")).toBeVisible();
    await expect(page.getByRole("progressbar")).toBeVisible();

    await repondre(page, "J'ai un RCCM et un IFU");
    await continuer(page);

    await expect(page.getByText("02 / 10")).toBeVisible();
  });

  test("permet de revenir en arrière sans perdre sa réponse", async ({ page }) => {
    await page.goto("/diagnostic");

    await repondre(page, "J'ai un RCCM et un IFU");
    await continuer(page);
    await page.getByRole("button", { name: "Retour" }).click();

    await expect(page.getByText("01 / 10")).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toBeVisible();
  });

  test("attend la sous-question avant de laisser continuer", async ({ page }) => {
    await page.goto("/diagnostic");

    // Les cinq premières questions mènent à la question du bénéfice.
    for (let rang = 0; rang < 5; rang += 1) {
      await page.locator("label").first().click();
      await continuer(page);
    }

    await expect(page.getByText(/combien votre entreprise a-t-elle gagné/)).toBeVisible();

    await page.locator("label").first().click();
    await expect(page.getByText("Ce chiffre, vous le tirez d'où ?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuer" })).toBeDisabled();

    await page.locator("section label").first().click();
    await expect(page.getByRole("button", { name: "Continuer" })).toBeEnabled();
  });

  test("conserve les réponses après un rechargement", async ({ page }) => {
    await page.goto("/diagnostic");

    await repondre(page, "J'ai un RCCM et un IFU");
    await continuer(page);
    await expect(page.getByText("02 / 10")).toBeVisible();

    await page.reload();

    await expect(page.getByText("02 / 10")).toBeVisible();
  });
});

test.describe("résultat", () => {
  test.beforeEach(async ({ page }) => {
    await parcoursComplet(page);
  });

  test("affiche un score, un point fort, un frein et une recommandation", async ({ page }) => {
    await expect(page.getByTestId("score-global")).toBeVisible();
    await expect(page.getByText("Votre point fort")).toBeVisible();
    await expect(page.getByText("Votre frein principal")).toBeVisible();
    await expect(page.getByText("À faire cette semaine")).toBeVisible();
  });

  test("détaille le score par dimension", async ({ page }) => {
    for (const dimension of ["Formalisation", "Comptabilité", "Finance"]) {
      await expect(page.getByText(dimension, { exact: true }).first()).toBeVisible();
    }
  });

  test("affiche un niveau de confiance à côté du score", async ({ page }) => {
    await expect(page.getByText(/Confiance (faible|moyenne|élevée)/)).toBeVisible();
  });

  test("permet de recommencer", async ({ page }) => {
    await page.getByRole("button", { name: /Refaire le diagnostic/ }).click();

    await expect(page).toHaveURL(/\/diagnostic$/);
    await expect(page.getByText("01 / 10")).toBeVisible();
  });
});

test.describe("sortie et reprise", () => {
  test("permet de quitter le questionnaire à tout moment", async ({ page }) => {
    await page.goto("/diagnostic");

    const sortie = page.getByRole("link", { name: /Reprendre plus tard|Quitter le diagnostic/ });
    await expect(sortie).toBeVisible();

    await sortie.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("propose de reprendre là où l'utilisateur s'est arrêté", async ({ page }) => {
    await page.goto("/diagnostic");
    await page.locator("label").first().click();
    await continuer(page);
    await page.getByRole("link", { name: /Reprendre plus tard|Quitter le diagnostic/ }).click();

    await expect(page.getByRole("link", { name: /Reprendre le diagnostic/ })).toBeVisible();
    await expect(page.getByText(/question 2 sur 10/)).toBeVisible();
  });

  test("reprend exactement à la question quittée", async ({ page }) => {
    await page.goto("/diagnostic");
    await page.locator("label").first().click();
    await continuer(page);
    await page.getByRole("link", { name: /Reprendre plus tard|Quitter le diagnostic/ }).click();
    await page.getByRole("link", { name: /Reprendre le diagnostic/ }).click();

    await expect(page.getByText("02 / 10")).toBeVisible();
  });

  test("permet de repartir de zéro depuis l'accueil", async ({ page }) => {
    await page.goto("/diagnostic");
    await page.locator("label").first().click();
    await continuer(page);
    await page.getByRole("link", { name: /Reprendre plus tard|Quitter le diagnostic/ }).click();

    await page.getByRole("button", { name: /Recommencer à zéro/ }).click();

    await expect(page).toHaveURL(/\/diagnostic$/);
    await expect(page.getByText("01 / 10")).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  });

  test("n'affiche aucune reprise avant le premier passage", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /Commencer le diagnostic/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Recommencer à zéro/ })).toHaveCount(0);
  });
});

test.describe("lisibilité", () => {
  test("ne provoque aucun débordement horizontal", async ({ page }) => {
    await page.goto("/diagnostic");

    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );

    expect(debordement).toBe(false);
  });

  test("expose un titre unique par écran", async ({ page }) => {
    await page.goto("/diagnostic");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});
