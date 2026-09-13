import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

/**
 * Enregistre une demonstration du parcours.
 *
 * Playwright ne filme pas le curseur et ne commente rien : sans reperes, une video
 * muette est difficile a suivre. On injecte donc un pointeur visible et de courtes
 * legendes, dans la typographie de la marque.
 *
 * Le site doit tourner sur le port indique :
 *   npm run build
 *   npx next start --port 3200
 *   node outils/enregistrer-demonstration.mjs
 */

const BASE = process.env.URL_CIBLE ?? "http://127.0.0.1:3200";
const DOSSIER = "demonstration";

/** Injecte le pointeur et la bande de legende avant tout rendu de page. */
const PREPARATION = `
  const pointeur = document.createElement("div");
  pointeur.style.cssText = [
    "position:fixed", "z-index:2147483647", "pointer-events:none",
    "width:22px", "height:22px", "border-radius:50%",
    "border:2px solid var(--signal)",
    "background:color-mix(in oklch, var(--signal), transparent 78%)",
    "transform:translate(-50%,-50%)", "left:50%", "top:50%",
    "transition:left .5s cubic-bezier(.16,1,.3,1), top .5s cubic-bezier(.16,1,.3,1), transform .12s ease"
  ].join(";");

  const legende = document.createElement("div");
  legende.style.cssText = [
    "position:fixed", "z-index:2147483646", "pointer-events:none",
    "left:24px", "bottom:24px", "max-width:60ch",
    "padding:10px 16px", "border:1px solid var(--trait)",
    "background:var(--papier-releve)", "color:var(--encre)",
    "font-family:var(--font-geist-mono),ui-monospace,monospace",
    "font-size:12px", "letter-spacing:.08em", "text-transform:uppercase",
    "border-radius:4px", "opacity:0", "transition:opacity .35s ease"
  ].join(";");

  const poser = () => {
    document.body.appendChild(pointeur);
    document.body.appendChild(legende);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", poser);
  } else {
    poser();
  }

  window.__demo = {
    pointeur(x, y) {
      pointeur.style.left = x + "px";
      pointeur.style.top = y + "px";
    },
    clic() {
      pointeur.style.transform = "translate(-50%,-50%) scale(.62)";
      setTimeout(function () {
        pointeur.style.transform = "translate(-50%,-50%) scale(1)";
      }, 130);
    },
    legende(texte) {
      legende.textContent = texte;
      legende.style.opacity = texte ? "1" : "0";
    },
  };
`;

async function legende(page, texte, duree = 2200) {
  await page.evaluate((t) => window.__demo && window.__demo.legende(t), texte);
  await page.waitForTimeout(duree);
}

/** Deplace le pointeur visible sur la cible avant de cliquer, pour que le geste se lise. */
async function cliquer(page, cible, pause = 700) {
  const boite = await cible.boundingBox();

  if (boite) {
    await page.evaluate(
      ([x, y]) => window.__demo && window.__demo.pointeur(x, y),
      [boite.x + boite.width / 2, boite.y + boite.height / 2],
    );
    await page.waitForTimeout(560);
    await page.evaluate(() => window.__demo && window.__demo.clic());
  }

  await cible.click();
  await page.waitForTimeout(pause);
}

async function scenarioBureau(page) {
  await page.goto(`${BASE}/fr`);
  await page.waitForTimeout(1200);
  await legende(page, "Diagnostic ALODO MPME, ecran d'introduction", 2600);
  await legende(page, "Dix questions, cinq minutes, aucun document a fournir", 2600);

  await cliquer(page, page.getByRole("link", { name: /Commencer le diagnostic/ }), 1300);
  await legende(page, "Le rail de gauche suit l'avancement par dimension", 2600);

  await cliquer(page, page.locator("label").first());
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "Une question a la fois, ligne entiere cliquable", 2200);
  await cliquer(page, page.locator("label").nth(1));
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "Choix multiple : seul le meilleur canal est retenu", 2400);
  await cliquer(page, page.locator("label").nth(1));
  await cliquer(page, page.locator("label").nth(4));
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "", 200);
  for (let rang = 0; rang < 2; rang += 1) {
    await cliquer(page, page.locator("label").nth(1), 400);
    await cliquer(page, page.getByRole("button", { name: "Continuer" }), 700);
  }

  await legende(page, "Question centrale : le benefice du mois dernier", 2600);
  await cliquer(page, page.locator("label").nth(1), 900);
  await legende(page, "La sous-question mesure d'ou vient le chiffre, pas sa valeur", 3000);
  await cliquer(page, page.locator("section label").nth(1), 900);
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "Les dettes informelles, tontine comprise, sont comptees", 2600);
  await cliquer(page, page.locator("label").nth(2));
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "Je ne sais pas est une reponse notee, pas une absence", 2800);
  await cliquer(page, page.locator("label").last());
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 900);

  await legende(page, "", 200);
  await cliquer(page, page.locator("label").nth(1), 400);
  await cliquer(page, page.getByRole("button", { name: "Continuer" }), 700);
  await cliquer(page, page.locator("label").first(), 400);
  await cliquer(page, page.getByRole("button", { name: /Voir mon r/ }), 1500);

  await page.waitForURL("**/resultat");
  await legende(page, "Le score monte jusqu'a sa valeur, comme une mesure relevee", 3200);
  await legende(page, "Indice de confiance affiche a cote du score", 2800);

  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(900);
  await legende(page, "Detail par dimension, decote visible sur la finance", 3000);

  await page.mouse.wheel(0, 460);
  await page.waitForTimeout(900);
  await legende(page, "Une action concrete a mener dans la semaine", 3200);

  await page.mouse.wheel(0, -900);
  await page.waitForTimeout(700);

  await legende(page, "Bascule en anglais, les reponses sont conservees", 2400);
  await cliquer(page, page.getByRole("link", { name: "en", exact: true }), 1700);
  await legende(page, "Localisation reelle : RCCM glose, tontine devient susu", 3200);

  await legende(page, "Theme sombre, aucun composant ne connait de couleur", 2400);
  const theme = page.getByRole("button", { name: /theme|thème/i });
  await cliquer(page, theme, 500);
  await cliquer(page, theme, 2000);
  await legende(page, "", 1600);
}

async function scenarioMobile(page) {
  await page.goto(`${BASE}/fr`);
  await page.waitForTimeout(1000);
  await legende(page, "Rendu mobile", 2200);

  await cliquer(page, page.getByRole("link", { name: /Commencer le diagnostic/ }), 1300);
  await legende(page, "Cibles tactiles pleine largeur", 2400);

  for (let rang = 0; rang < 10; rang += 1) {
    await cliquer(page, page.locator("label").first(), 260);

    const sous = page.locator("section label").first();
    if (await sous.isVisible().catch(() => false)) await cliquer(page, sous, 260);

    if (rang === 4) await legende(page, "Progression toujours visible", 2000);

    await cliquer(page, page.getByRole("button", { name: /Continuer|Voir mon r/ }), 520);
  }

  await page.waitForURL("**/resultat");
  await legende(page, "Resultat lisible sans defilement horizontal", 3000);
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(1500);
  await legende(page, "", 1200);
}

async function enregistrer(nom, options, scenario) {
  const provisoire = join(DOSSIER, nom);
  rmSync(provisoire, { recursive: true, force: true });
  mkdirSync(provisoire, { recursive: true });

  const navigateur = await chromium.launch();
  const contexte = await navigateur.newContext({
    ...options,
    recordVideo: { dir: provisoire, size: options.viewport },
  });

  const page = await contexte.newPage();
  await page.addInitScript(PREPARATION);
  await scenario(page);

  await contexte.close();
  await navigateur.close();

  const brut = readdirSync(provisoire).find((fichier) => fichier.endsWith(".webm"));
  const final = join(DOSSIER, `${nom}.webm`);
  rmSync(final, { force: true });
  renameSync(join(provisoire, brut), final);
  rmSync(provisoire, { recursive: true, force: true });

  return final;
}

mkdirSync(DOSSIER, { recursive: true });

console.log(
  await enregistrer(
    "bureau",
    {
      viewport: { width: 1280, height: 720 },
      colorScheme: "light",
      reducedMotion: "no-preference",
    },
    scenarioBureau,
  ),
);

console.log(
  await enregistrer(
    "mobile",
    { viewport: { width: 390, height: 844 }, colorScheme: "light", isMobile: true, hasTouch: true },
    scenarioMobile,
  ),
);
