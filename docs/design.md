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
| `--survol`, `--encre-survol`                     | Surfaces de survol, sur fond clair et sur fond sombre                  |
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
- Tout élément actionnable montre un curseur de clic et change visiblement au survol. Tailwind v4 pose `cursor: default` sur les boutons, et les variantes shadcn reposent sur des écarts d'opacité calibrés pour un fond blanc pur : les deux sont repris dans `globals.css`, dans la couche `utilities` sans quoi les utilitaires les écraseraient.
- Un bouton désactivé montre un curseur d'interdiction et ne réagit pas au survol.
- Deux thèmes, clair et sombre, plus le suivi de la préférence système.

Ces règles sont vérifiées par `tests/unitaires/theme.test.ts`, qui scanne les sources et fait échouer la vérification si une valeur repart en dur.

## Thème sombre

Le projet a d'abord été livré en thème clair seul. Le thème sombre a été ajouté ensuite, pour une raison précise : les jetons étant déjà centralisés, il ne touche **aucun composant**. C'est la démonstration que la centralisation tient.

Ce n'est pas une inversion. Sur fond sombre, l'orange de marque perd en lisibilité et les teintes de maturité s'écrasent : les deux sont remontées en clarté. Les surfaces gardent leur sémantique, « creux » restant en retrait et « relevé » en avant, ce qui inverse leur direction par rapport au thème clair.

| Aspect           | Choix                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Sélecteur        | `[data-theme="sombre"]` sur `<html>`                                                                                                   |
| Préférences      | système, clair, sombre, parcourues par un seul bouton                                                                                  |
| Résolution       | un script pose l'attribut **avant la peinture** ; sans lui la page s'afficherait en clair puis basculerait                             |
| Sans JavaScript  | thème clair, qui reste le cas d'usage principal                                                                                        |
| Variante `dark:` | redéfinie pour suivre l'attribut et non la préférence système brute, sinon un choix manuel laisserait les primitives shadcn en arrière |

### Le logo

La boucle sombre du logo disparaît sur fond sombre : seul l'anneau orange resterait visible. Un filtre CSS altérerait aussi l'orange, donc une variante est produite par `outils/generer-logo-sombre.mjs`, qui ne recolore que les pixels neutres et conserve le canal alpha. Les deux images sont rendues et permutées en CSS, ce qui évite tout clignotement.
