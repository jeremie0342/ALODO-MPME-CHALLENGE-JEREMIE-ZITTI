# Architecture

## Principe

Le questionnaire est de la **donnée**, pas du code. Le moteur de rendu et le moteur de score sont génériques et ne connaissent aucune question en particulier.

Conséquence directe : ajouter les cinq dimensions restantes revient à éditer un fichier de configuration, sans toucher ni au moteur ni aux écrans.

## Arborescence

```
src/
  app/
    page.tsx                    écran 1, introduction
    diagnostic/
      layout.tsx                fournit l'état aux deux écrans suivants
      page.tsx                  écran 2, questions
      resultat/page.tsx         écran 3, résultat
    globals.css                 source unique du thème
    layout.tsx                  polices et métadonnées
  domaine/                      aucune dépendance à React
    types.ts                    modèle du questionnaire et du résultat
    questionnaire.ts            les dix questions et les trois dimensions
    bareme.ts                   politique de notation, seuils, plafonds
    scoring.ts                  moteur pur
    recommandations.ts          frein vers action locale
  components/
    ui/                         primitives shadcn, non modifiées
    marque/                     logo et motif d'entrelacs
    mise-en-page/               cadre commun
    diagnostic/                 rendu des questions et progression
    resultat/                   affichage du score
  etat/
    stockage-local.ts           magasin externe persisté
    contexte-diagnostic.tsx     état du parcours
  lib/
    marque.ts                   constantes de marque
```

## Couches

| Couche        | Règle                                                                |
| ------------- | -------------------------------------------------------------------- |
| `domaine/`    | Fonctions pures, testables sans navigateur. N'importe rien de React. |
| `etat/`       | Persistance et transitions du parcours.                              |
| `components/` | Rendu. Ne calcule aucun score.                                       |
| `app/`        | Assemblage.                                                          |

La dépendance va toujours du haut vers le bas. Le domaine ignore tout de l'interface.

## Décisions

**Pas de base de données.** Le document l'autorise et un backend ici serait du périmètre non justifié. L'état vit dans `localStorage`.

**`useSyncExternalStore` plutôt qu'un effet.** Lire le stockage dans un `useEffect` déclenche un rendu en cascade et une discordance à l'hydratation. Le magasin externe résout les deux, et c'est l'usage prévu par React pour une source hors de son arbre.

**Stratégies d'agrégation nommées dans la donnée.** Une question à choix multiple déclare `meilleur-canal` ou `cumul-dettes` ; l'implémentation vit dans le moteur. Le nom est de la donnée, le calcul est du code.

**Sous-question plutôt que deux questions.** Q6 porte sa sous-question, ce qui garde dix questions pour l'utilisateur tout en notant séparément la provenance du chiffre.

## Portabilité de canal

Le produit ALODO distribue déjà par WhatsApp, sur des téléphones sans application. Un questionnaire décrit en configuration se rend en web aujourd'hui et en conversation demain, sans réécrire la logique de score. C'est la principale raison de séparer si nettement la donnée du rendu.
