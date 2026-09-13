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

/**
 * Le theme est pose sur la racine du document, hors de l'arbre React. Une navigation
 * entre langues re-rend cette racine et faisait disparaitre l'attribut : l'affichage
 * repassait en clair alors que la preference enregistree disait l'inverse.
 */
test.describe("persistance du theme", () => {
  test.use({ colorScheme: "light" });

  async function passerEnSombre(page: import("@playwright/test").Page) {
    const bouton = page.getByRole("button", { name: /thème|theme/i });

    while ((await page.locator("html").getAttribute("data-theme")) !== "sombre") {
      await bouton.click();
      await page.waitForTimeout(120);
    }
  }

  const fond = (page: import("@playwright/test").Page) =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  test("survit a un changement de langue", async ({ page }) => {
    await page.goto("/fr");
    await passerEnSombre(page);
    const attendu = await fond(page);

    await page.getByRole("link", { name: "en", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
    expect(await fond(page)).toBe(attendu);
  });

  test("survit a un aller-retour entre langues", async ({ page }) => {
    await page.goto("/fr");
    await passerEnSombre(page);

    await page.getByRole("link", { name: "en", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await page.getByRole("link", { name: "fr", exact: true }).click();
    await expect(page).toHaveURL(/\/fr$/);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });

  test("reste coherent entre l'affichage et la preference enregistree", async ({ page }) => {
    await page.goto("/fr");
    await passerEnSombre(page);

    await page.getByRole("link", { name: "en", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);

    const enregistree = await page.evaluate(() => localStorage.getItem("alodo-mpme.theme.v1"));
    const affichee = await page.locator("html").getAttribute("data-theme");

    expect(affichee).toBe(enregistree);
  });

  test("survit a un rechargement puis a un changement de langue", async ({ page }) => {
    await page.goto("/fr");
    await passerEnSombre(page);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");

    await page.getByRole("link", { name: "en", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });

  test("s'applique aussi a la page introuvable", async ({ page }) => {
    await page.goto("/fr");
    await passerEnSombre(page);

    await page.goto("/fr/adresse-inexistante");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "sombre");
  });
});

/**
 * Reappliquer l'attribut ne suffit pas : dans un effet passif, la correction arrive
 * apres la peinture et le navigateur affiche une trame au mauvais theme. Ce test
 * echantillonne la couleur reellement peinte a chaque trame pendant la bascule.
 */
test.describe("absence de scintillement", () => {
  for (const { systeme, cible } of [
    { systeme: "light", cible: "sombre" },
    { systeme: "dark", cible: "clair" },
  ] as const) {
    test.describe(`systeme ${systeme}`, () => {
      test.use({ colorScheme: systeme });

      test(`ne peint aucune trame hors du theme ${cible}`, async ({ page }) => {
        await page.goto("/fr");

        const bouton = page.getByRole("button", { name: /thème|theme/i });
        for (let essai = 0; essai < 3; essai += 1) {
          if ((await page.locator("html").getAttribute("data-theme")) === cible) break;
          await bouton.click();
        }
        await expect(page.locator("html")).toHaveAttribute("data-theme", cible);

        const attendu = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

        await page.evaluate(() => {
          const echantillons: string[] = [];
          let rang = 0;
          const relever = () => {
            echantillons.push(getComputedStyle(document.body).backgroundColor);
            if (rang++ < 40) requestAnimationFrame(relever);
          };
          requestAnimationFrame(relever);
          Object.assign(window, { __echantillons: echantillons });
        });

        await page.getByRole("link", { name: "en", exact: true }).click();
        await expect(page).toHaveURL(/\/en$/);
        await page.waitForTimeout(900);

        const echantillons = await page.evaluate(
          () => (window as unknown as { __echantillons: string[] }).__echantillons,
        );

        expect(echantillons.length).toBeGreaterThan(10);
        expect(echantillons.filter((fond) => fond !== attendu)).toEqual([]);
      });
    });
  }
});
