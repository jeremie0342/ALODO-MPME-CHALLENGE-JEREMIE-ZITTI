import { expect, test } from "@playwright/test";

/**
 * Le thème est porté par un attribut sur <html> et par des jetons CSS.
 * Aucun composant ne connaît de couleur : ces tests vérifient que la bascule
 * suffit à tout repeindre, ce qui est la raison d'être de la centralisation.
 */

const FOND = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("preference systeme", () => {
  test.describe("systeme clair", () => {
    test.use({ colorScheme: "light" });

    test("ouvre le theme clair", async ({ page }) => {
      await page.goto("/fr");

      await expect(page.locator("html")).toHaveAttribute("data-theme", "clair");
    });
  });

  test.describe("systeme sombre", () => {
    test.use({ colorScheme: "dark" });

    test("ouvre le theme sombre", async ({ page }) => {
      await page.goto("/fr");

      await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
    });

    test("pose le theme des le premier rendu", async ({ page }) => {
      // Sans script avant peinture, la page s'afficherait en clair puis basculerait.
      await page.goto("/fr", { waitUntil: "commit" });

      await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
    });

    test("repeint reellement la page", async ({ page }) => {
      await page.goto("/fr");
      const sombre = await FOND(page);

      await page.emulateMedia({ colorScheme: "light" });
      await page.reload();
      const clair = await FOND(page);

      expect(sombre).not.toBe(clair);
    });
  });
});

test.describe("bascule manuelle", () => {
  test.use({ colorScheme: "light" });

  test("fait defiler systeme, clair puis sombre", async ({ page }) => {
    await page.goto("/fr");
    const bouton = page.getByRole("button", { name: /thème|theme/i });

    await expect(page.locator("html")).toHaveAttribute("data-theme", "clair");

    await bouton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "clair");

    await bouton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });

  test("conserve le choix apres rechargement", async ({ page }) => {
    await page.goto("/fr");
    const bouton = page.getByRole("button", { name: /thème|theme/i });

    await bouton.click();
    await bouton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");

    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });

  test("suit le choix sur tout le parcours", async ({ page }) => {
    await page.goto("/fr");
    const bouton = page.getByRole("button", { name: /thème|theme/i });
    await bouton.click();
    await bouton.click();

    await page.goto("/fr/diagnostic");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });
});

test.describe("lisibilite du logo", () => {
  test("echange la variante du logo selon le theme", async ({ page }) => {
    // La boucle sombre du logo disparaitrait sur fond sombre sans variante dediee.
    await page.goto("/fr");

    const clair = page.locator('header img[src*="logo-alodo.png"]');
    const sombre = page.locator('header img[src*="logo-alodo-sombre.png"]');

    await expect(clair).toHaveCount(1);
    await expect(sombre).toHaveCount(1);

    const bouton = page.getByRole("button", { name: /thème|theme/i });
    await bouton.click();
    await bouton.click();

    await expect(sombre).toBeVisible();
    await expect(clair).toBeHidden();
  });
});
