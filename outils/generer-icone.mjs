import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

/**
 * Produit l'icone du site a partir du logo.
 *
 * Le logo est cadre au plus juste et pose sur le papier de marque : sans fond, les
 * boucles disparaitraient a moitie dans un onglet sombre comme dans un onglet clair.
 *
 * Relancer si le logo source change :
 *   node outils/generer-icone.mjs
 */

const SOURCE = "public/logo-alodo.png";
const SORTIE = "src/app/icon.png";
const COTE = 256;
const MARGE = 0.16;
const FOND = "oklch(0.9834 0.0033 78)";

const navigateur = await chromium.launch();
const page = await navigateur.newPage();
await page.goto(pathToFileURL(resolve("public")).href);

const base64 = readFileSync(SOURCE).toString("base64");

const dataUrl = await page.evaluate(
  async ({ base64, cote, marge, fond }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();

    const toile = document.createElement("canvas");
    toile.width = cote;
    toile.height = cote;
    const contexte = toile.getContext("2d");

    contexte.fillStyle = fond;
    contexte.fillRect(0, 0, cote, cote);

    // Conserve le rapport d'aspect et centre le logo dans le carre.
    const disponible = cote * (1 - marge * 2);
    const echelle = Math.min(disponible / image.width, disponible / image.height);
    const largeur = image.width * echelle;
    const hauteur = image.height * echelle;

    contexte.drawImage(image, (cote - largeur) / 2, (cote - hauteur) / 2, largeur, hauteur);

    return toile.toDataURL("image/png");
  },
  { base64, cote: COTE, marge: MARGE, fond: FOND },
);

writeFileSync(SORTIE, Buffer.from(dataUrl.split(",")[1], "base64"));
await navigateur.close();

console.log(`${SORTIE} : ${COTE}x${COTE}`);
