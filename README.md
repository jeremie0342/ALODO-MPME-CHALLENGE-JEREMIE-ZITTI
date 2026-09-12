# Diagnostic ALODO MPME

Prototype de l'étape Diagnostic du programme ALODO MPME. Dix questions, un score, une action à mener.

**Démo : https://alodo-mpme-challenge-jeremie-zitti.vercel.app**

## 1. Présentation

Une application web de trois écrans qui évalue la capacité d'une micro, petite ou moyenne entreprise à obtenir un **premier crédit formel**.

| Écran        | Contenu                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Introduction | Objectif, durée, dimensions évaluées                                                                        |
| Questions    | Dix questions, progression permanente                                                                       |
| Résultat     | Score sur 100, indice de confiance, détail par dimension, point fort, frein principal, action de la semaine |

Le parcours est complet de bout en bout. Le périmètre est volontairement étroit : trois dimensions sur les huit du programme.

## 2. Choix produit

### Le périmètre

**Formalisation, Comptabilité, Finance.** Ces trois dimensions ne sont pas un échantillon : elles répondent ensemble à une seule question, dans cet ordre. A-t-elle le droit d'emprunter ? Peut-elle le prouver ? En a-t-elle la capacité ?

La huitième dimension du programme, « Préparation au financement », n'est pas traitée à part parce qu'elle est le **résultat** des trois autres. Elle devient donc le score global.

Huit dimensions étaient de toute façon arithmétiquement impossibles : douze questions au maximum divisées par huit donnent 1,5 question par dimension, ce qui ne mesure rien.

### Les questions

Critère de sélection : **couvrir ce que les outils de collecte ALODO ne verront jamais.** Le produit ALODO capte déjà le comportement transactionnel, soit la régularité, le panier moyen et la saisonnalité. Il est aveugle au statut juridique, à la tenue des comptes, aux dettes informelles et au mélange pro/perso.

Demander un chiffre d'affaires qu'un capteur mesurera exactement dans trente jours reviendrait à voler une question au dirigeant, et à recueillir une réponse fausse puisqu'il ne tient pas de comptes.

Aucun jargon : ni « trésorerie », ni « créances », ni « marge ». Ancrage local assumé : RCCM, IFU, Mobile Money, tontine, dettes familiales.

### Le scoring

Trois partis pris, détaillés dans [`docs/scoring.md`](docs/scoring.md).

1. **L'existence légale plafonne le score au lieu de le gonfler.** Cohérent avec la thèse ALODO, un score de crédit ne doit pas récompenser la paperasse. Mais aucun établissement ne prête à une entité qui n'existe pas juridiquement : c'est un verrou, pas un mérite.
2. **La finance est décotée par la qualité comptable.** Un chiffre vaut ce que vaut sa preuve. La décote s'arrête à 0,70 : c'est une décote, pas une annulation.
3. **« Je ne sais pas » est une réponse notée.** Quatre questions sur dix l'acceptent. Un questionnaire qui punit l'ignorance pousse à inventer ; celui-ci la transforme en diagnostic. Le nombre d'ignorances produit un **indice de confiance** affiché à côté du score, pour qu'ALODO sache s'il peut le reprendre dans un rapport.

### Le frein

Le résultat désigne une **question**, pas une dimension. « Renforcez votre structuration financière » est un constat reformulé ; « rendez-vous au Centre de formalités des entreprises » est une action. Une question se traduit en un acte, une dimension non.

## 3. Choix techniques

| Choix                  | Raison                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Next.js 16, App Router | Déploiement immédiat, et la stack du site alodotech.com                                     |
| TypeScript             | Le modèle du questionnaire est typé de bout en bout                                         |
| Tailwind v4            | Le thème se déclare en CSS, donc en une seule source                                        |
| shadcn et Radix        | Accessibilité clavier fournie par les primitives, direction artistique appliquée par-dessus |
| Lucide                 | Jeu d'icônes cohérent                                                                       |
| Aucune base de données | Le sujet l'autorise ; un backend serait du périmètre non justifié                           |

### Le point d'architecture

**Le questionnaire est de la donnée, pas du code.** Les dix questions, leurs options et leurs points vivent dans `src/domaine/questionnaire.ts`. Le moteur de rendu et le moteur de score sont génériques.

Ajouter les cinq dimensions restantes revient à éditer un fichier de configuration, sans toucher au moteur ni aux écrans. Surtout, le produit ALODO distribue déjà par WhatsApp sur des téléphones sans application : un questionnaire décrit en configuration se rend en web aujourd'hui et en conversation demain, sans réécrire la logique.

Le moteur de score est une **fonction pure**, ce qui le rend testable sans navigateur et vérifiable à la main.

### Le thème

Toutes les couleurs, polices et rayons sont déclarés dans `src/app/globals.css`. La palette dérive du logo, `#EB663B` et `#030303`, convertis en OKLCH. Les quatre niveaux de maturité sont une **rotation de teinte continue** de 29 à 196, pas quatre couleurs choisies séparément.

Des tests scannent les sources et font échouer la vérification si une couleur repart en dur. Voir [`docs/design.md`](docs/design.md).

## 4. Installation

Node 20 ou supérieur.

```bash
npm install
npm run dev
```

L'application démarre sur `http://localhost:3000`.

```bash
npm run verifier        # format, lint, tests unitaires, build
npm run test:unitaires  # moteur de score et thème
npm run test:parcours   # bout en bout, bureau et mobile
```

Les tests de parcours nécessitent le navigateur Playwright : `npx playwright install chromium`.

Pour rejouer les mêmes scénarios contre un déploiement plutôt qu'en local :

```bash
URL_CIBLE=https://alodo-mpme-challenge-jeremie-zitti.vercel.app npm run test:parcours
```

## 5. Fonctionnalités

- Parcours complet en trois écrans.
- Dix questions, quatre types de réponse : choix unique, choix multiple, tranche, sous-question.
- Progression sur deux lectures : barre globale et rail par dimension.
- Sortie possible à tout moment, et reprise exacte à la question quittée.
- Reprise du parcours après fermeture ou coupure réseau.
- Score sur 100, indice de confiance, détail par dimension avec décote visible.
- Point fort, frein principal, recommandation locale exécutable.
- Avertissement explicite quand le plafond légal contraint le score.
- Responsive, cibles tactiles de 56 px, aucun débordement horizontal.
- 49 tests unitaires et 38 tests de parcours.

## 6. Limites

Ce qui a été volontairement laissé de côté.

- **Cinq dimensions sur huit.** Commercial, Digitalisation, Opérations et Ressources humaines. Les trois premières seront observables par les outils ALODO ; les ressources humaines n'ont pas d'objet dans une entreprise de deux personnes.
- **Le reste du programme.** Candidature, sélection, analyse, rapport, accompagnement.
- **Aucune persistance serveur.** Les réponses ne quittent pas l'appareil. Rien n'est agrégé, donc rien n'est exploitable par ALODO en l'état.
- **Aucune authentification, aucun tableau de bord.**
- **Les seuils et les poids sont posés à dire d'expert**, pas calibrés sur des données. Ils ne le seront qu'après la première cohorte.
- **Le score reste déclaratif.** Rien ne vérifie les réponses, ce qui est exactement le rôle de l'indice de confiance.
- **Thème clair uniquement**, et contraste vérifié à l'œil plutôt qu'à l'outil.
- **Le diagnostic est supposé auto-administré.** S'il est passé par un analyste en entretien, l'interface doit devenir un outil de saisie rapide.

## 7. Améliorations

Par ordre de valeur pour ALODO.

1. **Faire du diagnostic un instrument de mesure répétée.** Dans l'entonnoir tel que décrit, le diagnostic est posé une fois à l'entrée et le programme s'arrête à l'accompagnement. Il n'y a pas de boucle de retour, donc pas de preuve d'impact, pas d'apprentissage, et aucune progression visible pour l'entreprise. Rejouer le même questionnaire à six mois transforme un score en trajectoire. C'est le même instrument lancé deux fois, et c'est ce qui se vend à un bailleur.

2. **Scorer par rapport à une classe de comparaison.** Un taxi-moto et un importateur ne peuvent pas être notés sur la même échelle absolue. Comparer une entreprise à ses semblables, même secteur et même taille, rend le résultat actionnable et lisible par une institution financière, pour qui un percentile sectoriel est un signal de risque là où un score absolu n'est rien. Effet secondaire : ce scoring s'améliore à chaque MPME diagnostiquée.

3. **Doubler le score d'une part vérifiée.** Laisser joindre des preuves que l'entreprise possède déjà, photo du RCCM, capture de l'historique Mobile Money, page du cahier de caisse, et distinguer un score déclaré d'un score vérifié. La part vérifiée devient la mesure de bancabilité du dossier. L'indice de confiance de ce prototype en est le premier étage.

4. **Mesurer l'écart entre le déclaré et l'observé.** Le montant de la question 6 est déjà conservé sans être noté, précisément pour servir de ligne de base. Une fois le comportement transactionnel observé, l'écart entre les deux mesure la connaissance qu'a le dirigeant de son affaire et sa sincérité, deux signaux hautement prédictifs. Le questionnaire devient alors auto-calibrant : on saura quelles questions prédisent le réel et on pourra supprimer les autres.

5. **L'arrêt adaptatif plutôt que le branchement adaptatif.** Il ne faut pas huit questions pour établir qu'une entreprise est au plancher sur la formalisation, deux suffisent. En choisissant à chaque étape la question la plus informative compte tenu des réponses déjà obtenues, on couvrirait les huit dimensions en douze questions au lieu de soixante, à précision égale.

6. Export du rapport en PDF, passation assistée par un analyste, rendu du questionnaire en conversation WhatsApp.

## Documentation

| Document                                       | Contenu                                                |
| ---------------------------------------------- | ------------------------------------------------------ |
| [`docs/perimetre.md`](docs/perimetre.md)       | Ce qui est construit, ce qui ne l'est pas, et pourquoi |
| [`docs/scoring.md`](docs/scoring.md)           | Barème complet et cas de référence calculé à la main   |
| [`docs/architecture.md`](docs/architecture.md) | Couches, arborescence, décisions techniques            |
| [`docs/design.md`](docs/design.md)             | Couleurs, typographie, règles du thème                 |
| [`docs/tests.md`](docs/tests.md)               | Ce qui est couvert et ce qui ne l'est pas              |
