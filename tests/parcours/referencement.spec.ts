import { expect, test } from "@playwright/test";

/**
 * Le référencement se vérifie sur le HTML réellement servi, pas sur l'intention du code.
 * L'aperçu de lien compte particulièrement : ALODO distribue par bot WhatsApp, où un
 * lien partagé s'affiche sous forme de carte.
 */

const LANGUES = ["fr", "en"] as const;

test.describe("aperçu de lien", () => {
  for (const langue of LANGUES) {
    test(`expose une carte de partage complète en ${langue}`, async ({ page }) => {
      await page.goto(`/${langue}`);

      const attendus = [
        "og:title",
        "og:description",
        "og:image",
        "og:url",
        "og:type",
        "og:site_name",
        "og:locale",
      ];

      for (const propriete of attendus) {
        const balise = page.locator(`meta[property="${propriete}"]`);
        await expect(balise, propriete).toHaveCount(1);
        await expect(balise).not.toHaveAttribute("content", "");
      }

      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
    });

    test(`sert réellement l'image de partage en ${langue}`, async ({ page, request }) => {
      await page.goto(`/${langue}`);

      const source = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(source).toBeTruthy();

      // og:image est absolue, comme l'exigent les robots d'aperçu. On ne teste que le
      // chemin, sinon la suite interrogerait la production au lieu du site sous test.
      const chemin = new URL(source!).pathname;

      // Une carte dont l'image renvoie une erreur est pire qu'une absence de carte.
      const reponse = await request.get(chemin);
      expect(reponse.status()).toBe(200);
      expect(reponse.headers()["content-type"]).toContain("image");
    });
  }
});

test.describe("indexation", () => {
  test("donne une adresse canonique propre à chaque langue", async ({ page }) => {
    const canoniques: string[] = [];

    for (const langue of LANGUES) {
      await page.goto(`/${langue}`);
      const valeur = await page.locator('link[rel="canonical"]').getAttribute("href");

      expect(valeur, langue).toContain(`/${langue}`);
      canoniques.push(valeur!);
    }

    expect(new Set(canoniques).size).toBe(LANGUES.length);
  });

  test("déclare chaque langue en alternative", async ({ page }) => {
    await page.goto("/fr");

    for (const langue of LANGUES) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${langue}"]`), langue).toHaveCount(
        1,
      );
    }
  });

  test("publie robots.txt et le sitemap", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);

    const contenu = await sitemap.text();
    for (const langue of LANGUES) {
      expect(contenu, langue).toContain(`/${langue}`);
    }
  });

  test("décrit l'application en données structurées valides", async ({ page }) => {
    await page.goto("/fr");

    const brut = await page.locator('script[type="application/ld+json"]').innerText();
    const donnees = JSON.parse(brut);

    expect(donnees["@type"]).toBe("WebApplication");
    expect(donnees.inLanguage).toBe("fr");
    expect(donnees.isAccessibleForFree).toBe(true);
    expect(donnees.url).toContain("/fr");
  });

  test("renseigne un titre et une description dans chaque langue", async ({ page }) => {
    const descriptions: string[] = [];

    for (const langue of LANGUES) {
      await page.goto(`/${langue}`);

      expect(await page.title()).not.toBe("");
      const description = await page.locator('meta[name="description"]').getAttribute("content");

      expect(description?.length ?? 0).toBeGreaterThan(50);
      descriptions.push(description!);
    }

    // Une description identique dans les deux langues signalerait une traduction oubliée.
    expect(new Set(descriptions).size).toBe(LANGUES.length);
  });
});
