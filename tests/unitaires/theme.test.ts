import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MARQUE } from "@/lib/marque";

/**
 * Le thème est la source unique des couleurs. Ces tests font échouer la vérification
 * dès qu'une valeur repart en dur dans un composant, ce qu'une relecture laisse passer.
 */

const RACINE_SOURCE = join(process.cwd(), "src");
const FEUILLE_THEME = join(RACINE_SOURCE, "app", "globals.css");

/** Les primitives shadcn sont du code téléchargé, hors de notre responsabilité. */
const EXCLUS = [join("components", "ui"), join("lib", "marque.ts")];

function fichiersSource(racine: string): string[] {
  return readdirSync(racine).flatMap((entree) => {
    const chemin = join(racine, entree);

    if (statSync(chemin).isDirectory()) return fichiersSource(chemin);
    if (!/\.(ts|tsx|css)$/.test(entree)) return [];
    if (EXCLUS.some((exclu) => chemin.includes(exclu))) return [];

    return [chemin];
  });
}

const SOURCES = fichiersSource(RACINE_SOURCE);

describe("centralisation du thème", () => {
  it("ne trouve aucune couleur hexadécimale hors de la feuille de thème", () => {
    const fautifs = SOURCES.filter((chemin) => chemin !== FEUILLE_THEME).filter((chemin) =>
      /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(chemin, "utf8")),
    );

    expect(fautifs).toEqual([]);
  });

  it("ne trouve aucune classe utilitaire à valeur arbitraire de couleur", () => {
    const arbitraire = /\b(?:bg|text|border|fill|stroke|ring|from|via|to)-\[(?:#|rgb|hsl|oklch)/;
    const fautifs = SOURCES.filter((chemin) => arbitraire.test(readFileSync(chemin, "utf8")));

    expect(fautifs).toEqual([]);
  });

  it("n'utilise aucun dégradé", () => {
    const degrade = /bg-gradient-|linear-gradient|radial-gradient|conic-gradient/;
    const fautifs = SOURCES.filter((chemin) => degrade.test(readFileSync(chemin, "utf8")));

    expect(fautifs).toEqual([]);
  });
});

describe("feuille de thème", () => {
  const theme = readFileSync(FEUILLE_THEME, "utf8");

  it("déclare les jetons attendus", () => {
    const jetons = [
      "--papier",
      "--encre",
      "--signal",
      "--trait",
      "--niveau-critique",
      "--niveau-fragile",
      "--niveau-engage",
      "--niveau-solide",
      "--font-display",
      "--radius",
    ];

    for (const jeton of jetons) {
      expect(theme, `jeton ${jeton}`).toContain(jeton);
    }
  });

  it("exprime les couleurs en OKLCH", () => {
    const declarations = theme.match(/^\s*--[a-z-]+:\s*(oklch|var)\(/gm) ?? [];

    expect(declarations.length).toBeGreaterThan(10);
  });
});

describe("constantes de marque", () => {
  it("conserve les couleurs relevées sur le logo", () => {
    expect(MARQUE.signal).toBe("#EB663B");
    expect(MARQUE.noir).toBe("#030303");
  });
});
