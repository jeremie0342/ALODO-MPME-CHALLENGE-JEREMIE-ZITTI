import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

/**
 * Produit la variante sombre du logo.
 *
 * La boucle noire du logo disparait sur fond sombre : seul l'anneau orange reste
 * visible, ce qui casse la marque. On recolore donc les pixels neutres en couleur
 * d'encre claire, en conservant l'orange et le canal alpha. Un filtre CSS ne
 * conviendrait pas, il toucherait aussi l'orange.
 *
 * Relancer si le logo source ou le jeton d'encre sombre change :
 *   node outils/generer-logo-sombre.mjs
 */

const SOURCE = "public/logo-alodo.png";
const SORTIE = "public/logo-alodo-sombre.png";

/** Doit suivre --encre du bloc [data-theme="sombre"] dans globals.css. */
const ENCRE_SOMBRE = "oklch(0.9312 0.0042 78)";

/** Ecart maximal entre canaux en deca duquel un pixel est considere neutre. */
const TOLERANCE_NEUTRE = 34;

const navigateur = await chromium.launch();
const page = await navigateur.newPage();
await page.goto(pathToFileURL(resolve("public")).href);

const base64 = readFileSync(SOURCE).toString("base64");

const resultat = await page.evaluate(
  async ({ base64, encre, tolerance }) => {
    // Le canvas convertit OKLCH en sRGB, ce qui evite de reimplementer la transformation
    // et garantit la meme couleur que celle rendue par la feuille de style. Le style
    // calcule ne convient pas : Chromium y conserve la notation OKLCH telle quelle.
    const sonde = document.createElement("canvas");
    sonde.width = 1;
    sonde.height = 1;
    const pinceau = sonde.getContext("2d");
    pinceau.fillStyle = encre;
    pinceau.fillRect(0, 0, 1, 1);
    const [cr, cg, cb] = pinceau.getImageData(0, 0, 1, 1).data;

    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();

    const toile = document.createElement("canvas");
    toile.width = image.width;
    toile.height = image.height;
    const contexte = toile.getContext("2d");
    contexte.drawImage(image, 0, 0);

    const donnees = contexte.getImageData(0, 0, toile.width, toile.height);
    const pixels = donnees.data;
    let recolores = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) continue;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const ecart = Math.max(r, g, b) - Math.min(r, g, b);

      // Neutre et sombre : c'est la boucle noire, pas l'orange de marque.
      if (ecart <= tolerance && Math.max(r, g, b) < 170) {
        pixels[i] = cr;
        pixels[i + 1] = cg;
        pixels[i + 2] = cb;
        recolores += 1;
      }
    }

    contexte.putImageData(donnees, 0, 0);

    return {
      dataUrl: toile.toDataURL("image/png"),
      recolores,
      couleur: [cr, cg, cb],
    };
  },
  { base64, encre: ENCRE_SOMBRE, tolerance: TOLERANCE_NEUTRE },
);

writeFileSync(SORTIE, Buffer.from(resultat.dataUrl.split(",")[1], "base64"));
await navigateur.close();

console.log(
  `${SORTIE} : ${resultat.recolores} pixels recolores en rgb(${resultat.couleur.join(", ")})`,
);
