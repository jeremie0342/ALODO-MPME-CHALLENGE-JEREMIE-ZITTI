# Tests

## Commandes

| Commande                 | Portée                                           |
| ------------------------ | ------------------------------------------------ |
| `npm run test:unitaires` | Moteur de score et centralisation du thème       |
| `npm run test:parcours`  | Parcours de bout en bout, bureau et mobile       |
| `npm run lint`           | ESLint                                           |
| `npm run format:check`   | Prettier                                         |
| `npm run verifier`       | Format, lint, tests unitaires et build enchaînés |

`npm run test:parcours` construit et sert l'application automatiquement.

## Tests unitaires

### Moteur de score, `tests/unitaires/scoring.test.ts`

- **Cohérence du barème** : chaque dimension totalise exactement 100 points, les poids totalisent 1, aucune option ne dépasse le maximum de sa question, les identifiants sont uniques, dix questions sont posées.
- **Stratégies d'agrégation** : `meilleur-canal` retient le meilleur et n'additionne pas, `cumul-dettes` décroît avec le nombre de sources et pénalise davantage l'informel.
- **Décote de confiance** : coefficient plein sur registres, décote sur estimation, plancher sans annulation, et vérification que seule la dimension finance est touchée.
- **Plafond légal** : écrase un score par ailleurs excellent, ne contraint pas une entreprise enregistrée.
- **Ignorance** : les « je ne sais pas » sont comptés et font descendre la confiance.
- **Frein** : désigne une question, donne toujours la priorité à l'existence légale quand elle manque.
- **Résultat** : bornes 0 à 100, déterminisme, absence de régression quand une réponse s'améliore, et reproduction exacte du cas de référence documenté dans `scoring.md`.

### Thème, `tests/unitaires/theme.test.ts`

Ces tests scannent les sources et échouent si une valeur repart en dur, ce qu'une relecture laisse passer.

- Aucune couleur hexadécimale hors de `globals.css`.
- Aucune classe utilitaire à valeur de couleur arbitraire.
- Aucun dégradé.
- Les jetons attendus sont déclarés et les couleurs exprimées en OKLCH.

Les primitives shadcn sont exclues du scan : c'est du code téléchargé, hors de notre responsabilité.

## Tests de parcours

`tests/parcours/diagnostic.spec.ts`, rejoués sur deux profils, Desktop Chrome et Pixel 5.

- **Accueil** : objectif, durée, dimensions annoncées, bouton de départ fonctionnel.
- **Questions** : avancement bloqué tant qu'une question est sans réponse, position toujours affichée, retour arrière sans perte, sous-question exigée avant de continuer, reprise intacte après rechargement.
- **Résultat** : score, point fort, frein, recommandation, détail par dimension, indice de confiance, reprise du parcours.
- **Lisibilité** : aucun débordement horizontal, un seul titre de niveau 1 par écran.

## Ce qui n'est pas testé

- Accessibilité au clavier au-delà du parcours nominal.
- Contraste des couleurs, vérifié à l'œil et non par outil.
- Rendu sur un navigateur autre que Chromium.
