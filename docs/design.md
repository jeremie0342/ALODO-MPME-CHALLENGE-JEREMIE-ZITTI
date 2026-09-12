# Direction artistique

## Principe

L'interface se lit comme un instrument de mesure, pas comme un site de marketing. Fond papier chaud, encre presque noire, orange réservé au signal. Aucun dégradé, aucune ombre portée, angles serrés.

## Couleurs

Relevées sur le logo ALODO puis converties en OKLCH.

| Source           | Hex       | OKLCH                        |
| ---------------- | --------- | ---------------------------- |
| Orange de marque | `#EB663B` | `oklch(0.6687 0.1748 38.06)` |
| Noir de marque   | `#030303` | `oklch(0.0969 0 0)`          |

Le noir de marque n'est pas utilisé tel quel pour le texte : il est réchauffé et éclairci en `--encre` pour rester lisible sur un écran bas de gamme en plein jour.

### Jetons

| Jeton                                            | Rôle                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `--papier`, `--papier-creux`, `--papier-releve`  | Surfaces, du fond au premier plan                                      |
| `--encre`, `--encre-attenue`, `--encre-discrete` | Texte, par ordre d'importance                                          |
| `--trait`, `--trait-appuye`                      | Filets                                                                 |
| `--signal`, `--signal-sourd`, `--signal-profond` | Accent unique, réservé à ce qui demande une action ou porte une mesure |
| `--niveau-critique` à `--niveau-solide`          | Niveaux de maturité                                                    |

### Niveaux de maturité

La teinte pivote de 29 à 196 à mesure que le score monte. C'est une progression construite, pas quatre couleurs choisies séparément.

| Niveau   | Score    | Teinte               |
| -------- | -------- | -------------------- |
| Critique | 0 à 34   | 29, rouge brique     |
| Fragile  | 35 à 54  | 38, orange de marque |
| Engagée  | 55 à 74  | 110, olive           |
| Solide   | 75 à 100 | 196, bleu-vert       |

## Typographie

| Famille          | Usage                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Instrument Serif | Titres et score. Donne au chiffre le poids d'un verdict.         |
| Geist Sans       | Interface et texte courant. Lisible sur petit écran.             |
| Geist Mono       | Mesures, compteurs, libellés d'instrument en capitales espacées. |

Les chiffres affichés portent `data-mesure`, qui active les chiffres tabulaires pour que les colonnes s'alignent.

## Règles

- Aucune couleur écrite en dur dans un composant. Tout passe par un jeton de `src/app/globals.css`.
- Aucun dégradé.
- Cible tactile de 56 px minimum, ligne entière cliquable.
- Thème clair uniquement. Le diagnostic se remplit de jour, sur un téléphone d'entrée de gamme ; un second thème doublerait la surface à maintenir sans servir l'usage.

Ces règles sont vérifiées par `tests/unitaires/theme.test.ts`, qui scanne les sources et fait échouer la vérification si une valeur repart en dur.
