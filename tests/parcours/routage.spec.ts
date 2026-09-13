import { expect, test } from "@playwright/test";

/**
 * Le routage par langue repose entierement sur le middleware.
 * Il avait cesse de s'executer sans que rien d'autre ne le signale : ces tests
 * verifient les redirections et les pages d'erreur pour que cela se voie aussitot.
 */

test.describe("redirections", () => {
  test("redirige la racine vers une langue", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/(fr|en)$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("prefixe un chemin donne sans langue", async ({ page }) => {
    // Ce cas echappait au motif du middleware : /diagnostic renvoyait une page absente.
    await page.goto("/diagnostic");

    await expect(page).toHaveURL(/\/(fr|en)\/diagnostic$/);
    await expect(page.getByRole("progressbar")).toBeVisible();
  });

  test("prefixe aussi les chemins profonds", async ({ page }) => {
    await page.goto("/diagnostic/resultat");

    await expect(page).toHaveURL(/\/(fr|en)\/diagnostic/);
  });

  test("laisse passer les fichiers statiques", async ({ request }) => {
    const reponse = await request.get("/logo-alodo.png");

    expect(reponse.status()).toBe(200);
    expect(reponse.headers()["content-type"]).toContain("image");
  });
});

test.describe("page introuvable", () => {
  test("repond bien en 404", async ({ request }) => {
    const reponse = await request.get("/fr/adresse-inexistante");

    expect(reponse.status()).toBe(404);
  });

  test("s'affiche dans la mise en page du site", async ({ page }) => {
    await page.goto("/fr/adresse-inexistante");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("link", { name: /accueil/i })).toBeVisible();
  });

  test("parle la langue de l'adresse", async ({ page }) => {
    await page.goto("/fr/adresse-inexistante");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("introuvable");

    await page.goto("/en/missing-address");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("not found");
  });

  test("ramene vers l'accueil", async ({ page }) => {
    await page.goto("/fr/adresse-inexistante");
    await page.getByRole("link", { name: /accueil/i }).click();

    await expect(page).toHaveURL(/\/fr$/);
  });
});

test.describe("icone du site", () => {
  test("declare une icone et la sert", async ({ page, request }) => {
    await page.goto("/fr");

    const icone = page.locator('link[rel="icon"]');
    await expect(icone).toHaveCount(1);

    const source = await icone.getAttribute("href");
    expect(source).toBeTruthy();

    const reponse = await request.get(source!);
    expect(reponse.status()).toBe(200);
  });
});

test.describe("repli hors langue", () => {
  test("sert notre page et non celle de Next", async ({ page }) => {
    // Une adresse comportant un point echappe au middleware : aucune langue ne peut
    // lui etre associee, c'est le repli racine qui repond.
    await page.goto("/fichier-absent.txt");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("introuvable");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("not found");
  });

  test("propose une entree dans chaque langue", async ({ page }) => {
    await page.goto("/fichier-absent.txt");

    await expect(
      page.getByRole("link", { name: /Aller a l'accueil|Aller à l'accueil/ }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to home/ })).toBeVisible();
  });

  test("ramene vers le diagnostic", async ({ page }) => {
    await page.goto("/fichier-absent.txt");
    await page.getByRole("link", { name: /Go to home/ }).click();

    await expect(page).toHaveURL(/\/en$/);
  });
});
