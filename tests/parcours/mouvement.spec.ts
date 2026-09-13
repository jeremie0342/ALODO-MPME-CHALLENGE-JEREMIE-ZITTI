import { expect, test, type Page } from "@playwright/test";

/**
 * Le mouvement doit rester au service de la lecture et disparaître quand le système
 * le demande. Ce réglage est utilisé par les personnes sujettes au mal des transports :
 * l'ignorer n'est pas un defaut d'esthetique mais d'accessibilite.
 */

async function parcoursComplet(page: Page) {
  await page.goto("/fr/diagnostic");

  for (let rang = 0; rang < 10; rang += 1) {
    await page.locator("label").first().click();

    const sousQuestion = page.locator("section label").first();
    if (await sousQuestion.isVisible().catch(() => false)) await sousQuestion.click();

    await page.getByRole("button", { name: /Continuer|Voir mon résultat/ }).click();
  }

  await page.waitForURL("**/diagnostic/resultat");
}

const scoreAffiche = async (page: Page) =>
  (await page.getByTestId("score-global").innerText()).replace(/\s+/g, "");

test.describe("mouvement actif", () => {
  test.use({ reducedMotion: "no-preference" });

  test("fait monter le score jusqu'a sa valeur", async ({ page }) => {
    await parcoursComplet(page);

    const debut = await scoreAffiche(page);
    await page.waitForTimeout(1600);
    const fin = await scoreAffiche(page);

    // Le score part d'en dessous puis se stabilise : une mesure qui se releve,
    // pas un nombre assene.
    expect(debut).not.toBe(fin);
    expect(fin).toBe("100/100");
  });

  test("remplit les barres par dimension", async ({ page }) => {
    await parcoursComplet(page);
    await page.waitForTimeout(1200);

    const barres = page.locator("dl div[style*='width']");
    await expect(barres).toHaveCount(3);

    for (let rang = 0; rang < 3; rang += 1) {
      const largeur = await barres.nth(rang).evaluate((element) => element.clientWidth);
      expect(largeur, `barre ${rang}`).toBeGreaterThan(0);
    }
  });

  test("n'entrave pas la navigation entre questions", async ({ page }) => {
    await page.goto("/fr/diagnostic");

    await page.locator("label").first().click();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.getByText("02 / 10")).toBeVisible();

    await page.getByRole("button", { name: "Retour" }).click();
    await expect(page.getByText("01 / 10")).toBeVisible();
    await expect(page.getByRole("radio", { checked: true })).toBeVisible();
  });

  test("ne provoque aucun debordement pendant la transition", async ({ page }) => {
    await page.goto("/fr/diagnostic");
    await page.locator("label").first().click();
    await page.getByRole("button", { name: "Continuer" }).click();

    // Pendant le glissement, le contenu sortant et le contenu entrant coexistent.
    const deborde = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );

    expect(deborde).toBe(false);
  });
});

test.describe("mouvement reduit", () => {
  test.use({ reducedMotion: "reduce" });

  test("affiche le score sans decompte", async ({ page }) => {
    await parcoursComplet(page);

    expect(await scoreAffiche(page)).toBe("100/100");
  });

  test("laisse le parcours pleinement utilisable", async ({ page }) => {
    await parcoursComplet(page);

    await expect(page.getByText("Votre point fort")).toBeVisible();
    await expect(page.getByText("À faire cette semaine")).toBeVisible();
  });

  test("affiche les barres a leur valeur finale", async ({ page }) => {
    await parcoursComplet(page);

    const barres = page.locator("dl div[style*='width']");
    for (let rang = 0; rang < 3; rang += 1) {
      const largeur = await barres.nth(rang).evaluate((element) => element.clientWidth);
      expect(largeur, `barre ${rang}`).toBeGreaterThan(0);
    }
  });
});
