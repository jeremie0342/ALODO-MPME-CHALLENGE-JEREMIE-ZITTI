/**
 * Préférence de thème, exposée comme un magasin externe au même titre que la session.
 *
 * Trois valeurs possibles, mais l'attribut posé sur <html> n'en vaut que deux :
 * « systeme » est résolu en « clair » ou « sombre » avant le premier rendu, ce qui
 * évite au CSS de gérer à la fois un attribut et une requête média.
 */

export type PreferenceTheme = "clair" | "sombre" | "systeme";
export type ThemeApplique = "clair" | "sombre";

export const CLE_THEME = "alodo-mpme.theme.v1";
export const PREFERENCE_DEFAUT: PreferenceTheme = "systeme";

export const PREFERENCES: readonly PreferenceTheme[] = ["systeme", "clair", "sombre"];

/**
 * Exécuté avant la peinture, dans une balise script du document.
 * Sans lui, la page s'afficherait en clair puis basculerait, ce qui est plus
 * désagréable que de ne pas proposer de thème sombre du tout.
 */
export const SCRIPT_ANTI_CLIGNOTEMENT = `(function(){try{
var p=localStorage.getItem(${JSON.stringify(CLE_THEME)})||${JSON.stringify(PREFERENCE_DEFAUT)};
var s=window.matchMedia("(prefers-color-scheme: dark)").matches?"sombre":"clair";
document.documentElement.dataset.theme=p==="systeme"?s:p;
}catch(e){document.documentElement.dataset.theme="clair";}})();`;

let cache: PreferenceTheme | null = null;
const abonnes = new Set<() => void>();

function lire(): PreferenceTheme {
  if (typeof window === "undefined") return PREFERENCE_DEFAUT;

  try {
    const brut = window.localStorage.getItem(CLE_THEME);

    return PREFERENCES.includes(brut as PreferenceTheme)
      ? (brut as PreferenceTheme)
      : PREFERENCE_DEFAUT;
  } catch {
    return PREFERENCE_DEFAUT;
  }
}

export function themeSysteme(): ThemeApplique {
  if (typeof window === "undefined") return "clair";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

export function resoudre(preference: PreferenceTheme): ThemeApplique {
  return preference === "systeme" ? themeSysteme() : preference;
}

function appliquer(preference: PreferenceTheme): void {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.theme = resoudre(preference);
}

export function souscrireTheme(ecouteur: () => void): () => void {
  abonnes.add(ecouteur);

  // Une préférence système qui change doit se refléter immédiatement.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const surChangement = () => {
    if (instantaneTheme() === "systeme") appliquer("systeme");
    ecouteur();
  };

  media.addEventListener("change", surChangement);

  return () => {
    abonnes.delete(ecouteur);
    media.removeEventListener("change", surChangement);
  };
}

export function instantaneTheme(): PreferenceTheme {
  cache ??= lire();

  return cache;
}

export function instantaneThemeServeur(): PreferenceTheme {
  return PREFERENCE_DEFAUT;
}

export function definirTheme(preference: PreferenceTheme): void {
  cache = preference;

  try {
    window.localStorage.setItem(CLE_THEME, preference);
  } catch {
    // Navigation privée : le thème tient le temps de la visite.
  }

  appliquer(preference);

  for (const ecouteur of abonnes) ecouteur();
}

/** Fait défiler les trois préférences, dans l'ordre de PREFERENCES. */
export function preferenceSuivante(courante: PreferenceTheme): PreferenceTheme {
  const index = PREFERENCES.indexOf(courante);

  return PREFERENCES[(index + 1) % PREFERENCES.length];
}
