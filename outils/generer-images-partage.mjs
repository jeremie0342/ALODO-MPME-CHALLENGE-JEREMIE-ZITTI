import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

/**
 * Génère les images de partage à partir des jetons de marque et des vraies polices.
 * Elles sont figées en fichiers statiques plutôt que rendues à la volée : un robot
 * d'aperçu doit les recevoir vite, et une route dynamique qui échoue casse la carte.
 *
 * Relancer après toute modification du titre ou de la palette :
 *   node outils/generer-images-partage.mjs
 */

const TEXTES = {
  fr: {
    surtitre: "Diagnostic de préparation au crédit",
    titre: "Votre entreprise est-elle prête à obtenir son premier crédit formel ?",
    pied: "10 questions · 5 minutes · aucun document",
  },
  en: {
    surtitre: "Credit readiness diagnostic",
    titre: "Is your business ready for its first formal loan?",
    pied: "10 questions · 5 minutes · no documents",
  },
};

const gabarit = ({ surtitre, titre, pied }) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&family=Instrument+Serif&display=block" rel="stylesheet">
<style>
  :root {
    --papier: oklch(0.9834 0.0033 78);
    --encre: oklch(0.1774 0.0089 55);
    --signal: oklch(0.6687 0.1748 38.06);
    --trait: oklch(0.8921 0.0055 75);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: var(--papier); color: var(--encre);
    padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .motif { position: absolute; top: -80px; right: -120px; width: 620px; height: 620px; }
  .entete { display: flex; align-items: center; gap: 14px; }
  .entete img { height: 34px; }
  .marque, .surtitre, .pied {
    font-family: "Geist Mono", monospace; text-transform: uppercase;
    letter-spacing: 0.18em; font-size: 15px;
  }
  .marque { color: color-mix(in oklch, var(--encre), transparent 45%); }
  .surtitre { color: var(--signal); margin-bottom: 26px; }
  h1 {
    font-family: "Instrument Serif", Georgia, serif; font-weight: 400;
    font-size: 74px; line-height: 1.04; letter-spacing: -0.02em; max-width: 880px;
  }
  .pied { color: color-mix(in oklch, var(--encre), transparent 45%); }
  .filet { height: 1px; background: var(--trait); margin-bottom: 22px; }
</style></head>
<body>
  <svg class="motif" viewBox="0 0 240 240" fill="none" aria-hidden="true">
    <ellipse cx="96" cy="120" rx="58" ry="86" transform="rotate(-24 96 120)" stroke="var(--trait)" stroke-width="1.25"/>
    <ellipse cx="144" cy="120" rx="58" ry="86" transform="rotate(24 144 120)" stroke="var(--trait)" stroke-width="1.25"/>
  </svg>

  <div class="entete"><img src="logo-alodo.png" alt=""><span class="marque">ALODO MPME</span></div>
  <div><p class="surtitre">${surtitre}</p><h1>${titre}</h1></div>
  <div><div class="filet"></div><p class="pied">${pied}</p></div>
</body></html>`;

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

for (const [langue, textes] of Object.entries(TEXTES)) {
  const temporaire = `public/_partage-${langue}.html`;
  writeFileSync(temporaire, gabarit(textes), "utf8");

  const page = await contexte.newPage();
  await page.goto(pathToFileURL(resolve(temporaire)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `public/partage-${langue}.png` });
  await page.close();

  unlinkSync(temporaire);
  const taille = readFileSync(`public/partage-${langue}.png`).length;
  console.log(`public/partage-${langue}.png  ${Math.round(taille / 1024)} ko`);
}

await navigateur.close();
