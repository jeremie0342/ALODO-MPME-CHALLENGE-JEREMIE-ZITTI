import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { marked } from "marked";

/**
 * Produit la version PDF de la note de reflexion produit, destinee a etre jointe a un
 * courriel. Elle reprend la charte du projet plutot qu'une mise en page generique :
 * memes polices, meme orange de marque, memes filets fins.
 *
 * marked est installe sans etre enregistre dans les dependances, l'outil ne servant
 * qu'a la production du document :
 *   npm install --no-save marked
 *   node outils/generer-pdf-note.mjs
 */

const SOURCE = "docs/note-produit.md";
const SORTIE = "docs/note-produit.pdf";
const AUTEUR = "Jérémie Zitti";

const corps = marked.parse(readFileSync(SOURCE, "utf8"));

const gabarit = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400&family=Instrument+Serif&display=block" rel="stylesheet">
<style>
  :root {
    --papier: oklch(0.9834 0.0033 78);
    --encre: oklch(0.1774 0.0089 55);
    --encre-attenue: oklch(0.4881 0.0128 62);
    --encre-discrete: oklch(0.6542 0.0113 68);
    --signal: oklch(0.6687 0.1748 38.06);
    --signal-sourd: oklch(0.9432 0.0248 48);
    --trait: oklch(0.8921 0.0055 75);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: "Geist", system-ui, sans-serif;
    font-size: 10.5pt;
    line-height: 1.62;
    color: var(--encre);
    background: #fff;
  }

  /* Bandeau de tete, sur la premiere page uniquement. */
  .tete {
    border-bottom: 1px solid var(--trait);
    padding-bottom: 14pt;
    margin-bottom: 26pt;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16pt;
  }
  .marque, .auteur {
    font-family: "Geist Mono", monospace;
    font-size: 7.5pt;
    letter-spacing: .16em;
    text-transform: uppercase;
  }
  .marque { color: var(--signal); }
  .auteur { color: var(--encre-discrete); }

  h1 {
    font-family: "Instrument Serif", Georgia, serif;
    font-weight: 400;
    font-size: 27pt;
    line-height: 1.1;
    margin: 0 0 10pt;
    letter-spacing: -.01em;
  }
  h2 {
    font-family: "Instrument Serif", Georgia, serif;
    font-weight: 400;
    font-size: 17pt;
    margin: 22pt 0 8pt;
    padding-top: 10pt;
    border-top: 1px solid var(--trait);
    break-after: avoid;
  }
  h3 {
    font-family: "Geist", sans-serif;
    font-weight: 500;
    font-size: 11pt;
    margin: 15pt 0 5pt;
    color: var(--encre);
    break-after: avoid;
  }

  p { margin: 0 0 9pt; }
  strong { font-weight: 500; }

  ul, ol { margin: 0 0 9pt; padding-left: 16pt; }
  li { margin-bottom: 4pt; }

  blockquote {
    margin: 10pt 0;
    padding: 8pt 14pt;
    border-left: 2px solid var(--signal);
    background: var(--signal-sourd);
    color: var(--encre);
  }
  blockquote p { margin: 0; }

  /*
    Le schema de l'entonnoir fait pres de cent caracteres : la taille est calee pour
    qu'il tienne sur la largeur utile sans etre coupe.
  */
  pre {
    font-family: "Geist Mono", monospace;
    font-size: 7pt;
    line-height: 1.5;
    background: transparent;
    border: 1px solid var(--trait);
    border-radius: 3pt;
    padding: 10pt 12pt;
    margin: 10pt 0;
    white-space: pre;
    overflow: visible;
  }
  code { font-family: "Geist Mono", monospace; font-size: 9pt; }
  /* Le bloc preformate porte la taille, marked y imbriquant un code qui la surchargerait. */
  pre code { font-size: inherit; }
  p code, li code, td code { color: var(--encre-attenue); }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0 12pt;
    font-size: 9.5pt;
    break-inside: avoid;
  }
  th {
    text-align: left;
    font-family: "Geist Mono", monospace;
    font-size: 7.5pt;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--encre-attenue);
    font-weight: 400;
    border-bottom: 1px solid var(--trait);
    padding: 6pt 10pt 6pt 0;
  }
  td {
    padding: 6pt 10pt 6pt 0;
    border-bottom: 1px solid var(--trait);
    vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }

  h2, h3, table, blockquote, pre { break-inside: avoid; }
</style></head>
<body>
  <div class="tete">
    <span class="marque">ALODO MPME · Exercice développeur</span>
    <span class="auteur">${AUTEUR}</span>
  </div>
  ${corps}
</body></html>`;

/** Largeur utile d'une page A4 a 96 ppp, marges laterales de 20 mm deduites. */
const LARGEUR_UTILE = 794 - 151;

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: LARGEUR_UTILE, height: 1123 } });
await page.setContent(gabarit, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

/*
  Le schema de l'entonnoir fait plus de quatre-vingt-dix caracteres et deborderait de la
  page, ou il serait coupe sans avertissement.

  scrollWidth ne sert a rien ici : sur un bloc en overflow visible, Chrome le rend egal a
  clientWidth et le debordement reste invisible a la mesure. On mesure donc la largeur
  reelle du texte avec une plage DOM, puis on reduit la taille jusqu'a ce qu'elle tienne.
  Laisser le navigateur mesurer evite de caler une valeur a la main qui redeviendrait
  fausse au premier changement de texte.
*/
const ajustements = await page.evaluate(() => {
  const rapport = [];

  for (const bloc of document.querySelectorAll("pre")) {
    const style = getComputedStyle(bloc);
    const disponible =
      bloc.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

    const largeurTexte = () => {
      const plage = document.createRange();
      plage.selectNodeContents(bloc);

      return plage.getBoundingClientRect().width;
    };

    let taille = 8;
    bloc.style.fontSize = `${taille}pt`;

    while (largeurTexte() > disponible && taille > 4) {
      taille -= 0.25;
      bloc.style.fontSize = `${taille}pt`;
    }

    rapport.push({
      taille,
      largeur: Math.round(largeurTexte()),
      disponible: Math.round(disponible),
    });
  }

  return rapport;
});

for (const { taille, largeur, disponible } of ajustements) {
  console.log(`bloc preformate : ${taille} pt, ${largeur} px sur ${disponible} disponibles`);
}

await page.pdf({
  path: SORTIE,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "20mm", left: "20mm", right: "20mm" },
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: `
    <div style="width:100%;padding:0 20mm;font-family:'Geist Mono',monospace;
                font-size:7pt;letter-spacing:.14em;text-transform:uppercase;
                color:#8a8378;display:flex;justify-content:space-between;">
      <span>Note de réflexion produit</span>
      <span class="pageNumber"></span>
    </div>`,
});

/*
  Chromium sans lecteur PDF ne sait pas relire le fichier produit. Le mode apercu rend
  le meme gabarit a la largeur d'une page A4, ce qui permet de controler la typographie
  et la tenue du schema avant de livrer :
    APERCU=1 node outils/generer-pdf-note.mjs
*/
if (process.env.APERCU) {
  const LARGEUR_A4 = 794;
  const HAUTEUR_A4 = 1123;
  const MARGE = 76;

  await page.setViewportSize({ width: LARGEUR_A4 - MARGE * 2, height: HAUTEUR_A4 });
  const hauteur = await page.evaluate(() => document.body.scrollHeight);
  console.log(`apercu : ${Math.ceil(hauteur / (HAUTEUR_A4 - MARGE * 2))} pages environ`);

  await page.screenshot({ path: "apercu-note.png", fullPage: true });
}

await navigateur.close();

const taille = Math.round(readFileSync(SORTIE).length / 1024);
console.log(`${SORTIE} : ${taille} ko`);
