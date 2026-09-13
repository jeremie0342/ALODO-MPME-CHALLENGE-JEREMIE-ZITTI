# Note de réflexion produit

Proposition d'amélioration du diagnostic ALODO MPME, rédigée après lecture du sujet et du site alodotech.com.

## 1. Point de départ

Trois éléments du dossier ALODO orientent toute la suite.

**Le client final n'est pas la MPME.** Le produit ALODO s'adresse aux « banques, institutions de microfinance, ONG et gouvernements ». Une micro-entreprise béninoise n'achètera pas un diagnostic. Ce qu'ALODO vend, c'est la capacité à qualifier un portefeuille d'entreprises que ces institutions ne savent pas évaluer aujourd'hui.

**Le produit repose sur une thèse explicite.** Le site l'affiche : « Score de crédit propriétaire basé sur le comportement réel, pas sur la paperasse ». La BOX et le bot WhatsApp observent la régularité, le panier moyen, la saisonnalité et la croissance.

**La première cohorte est limitée à 20 MPME.** À cette taille, le goulot d'étranglement n'est pas l'automatisation. C'est la qualité et la comparabilité de ce qui est collecté.

## 2. Une tension à résoudre

Le diagnostic est un questionnaire déclaratif. Deux de ses huit dimensions s'appellent « Formalisation, statut légal, documents administratifs » et « Comptabilité, pièces justificatives ». C'est de la paperasse, c'est-à-dire exactement ce que le produit dit ne pas vouloir scorer.

La contradiction disparaît si on remet les deux sur un axe temporel. Le score comportemental a un problème que tout système de scoring connaît : avant la première transaction observée, il n'a rien à scorer. Une MPME sans BOX ni bot n'a aucun historique. Le questionnaire est la seule information disponible au départ.

Le diagnostic n'est donc pas un concurrent du score comportemental. C'est son démarrage à froid. Il sert à trois choses :

1. qualifier qui mérite d'être équipé, un boîtier à 25 dollars posé chez la mauvaise entreprise étant du capital perdu, ce qui se voit vite sur 20 dossiers ;
2. établir la ligne de base avant que le comportement ne devienne observable ;
3. se faire remplacer par la donnée comportementale dès qu'elle existe.

Cette lecture a une conséquence pratique sur le choix des questions, appliquée dans le prototype : **ne demander que ce que le capteur ne verra jamais.** Le statut juridique, la tenue des comptes, les dettes informelles, les créances et le mélange entre argent personnel et argent de l'entreprise. Demander de mémoire un chiffre d'affaires que la BOX mesurera exactement en trente jours coûte une question au dirigeant et produit une réponse fausse.

## 3. La faille principale

Le programme est décrit ainsi dans le sujet :

```
Candidature → Sélection → Diagnostic → Analyse → Rapport → Recommandations → Accompagnement
                              ↑                                                     |
                              └──────────────────  ?  ────────────────────────────┘
```

Le diagnostic est posé une seule fois, à l'entrée, puis le programme s'écoule vers l'accompagnement et s'arrête. Rien ne mesure ce que l'accompagnement a changé.

Trois conséquences.

**ALODO ne peut pas prouver son impact.** Pour un bailleur ou un programme d'appui aux PME, la phrase qui compte est « nos 20 MPME ont gagné 18 points de formalisation en 6 mois ». Sans seconde mesure, cette phrase est indisponible.

**Le diagnostic n'apprend jamais.** Impossible de savoir quelles recommandations ont produit un effet. La version suivante du questionnaire sera écrite à l'intuition comme la première.

**La MPME ne voit aucune progression.** Un score unique est un jugement. Un score qui bouge est une raison de revenir.

Il est possible que la re-mesure soit déjà prévue sans figurer sur le schéma. Dans ce cas, la suite de cette note décrit comment l'outiller.

## 4. Proposition

### 4.1 Faire du diagnostic un instrument de mesure répétée

Même questionnaire, passé au départ puis six mois plus tard. Ce qu'ALODO présente alors n'est plus un score mais une trajectoire.

Le coût est faible : c'est le même instrument, lancé deux fois. La nature de l'actif change : une base de scores est une photographie, une base de trajectoires est une preuve d'effet. Seule la seconde se vend à un bailleur, et seule la seconde, accumulée, apprend à une institution financière ce qui prédit le remboursement.

### 4.2 Scorer par rapport à une classe de comparaison

Un taxi-moto de deux personnes et un importateur de vingt-cinq salariés ne peuvent pas être notés sur la même échelle absolue de structuration. Le premier restera bas à vie, n'apprendra rien et se démobilisera.

Il faut comparer une MPME à ses semblables, même secteur et même taille :

> Vous êtes dans le premier tiers des commerces de détail de votre taille sur la formalisation, et dans les derniers 20 % sur la comptabilité.

C'est immédiatement actionnable. C'est aussi le seul format qu'une institution financière sait lire : un percentile sectoriel est un signal de risque, un score absolu n'en est pas un.

Effet secondaire : ce scoring s'améliore à chaque MPME diagnostiquée. La base s'apprécie au lieu de rester un stock de formulaires.

### 4.3 Distinguer la part déclarée de la part vérifiée

L'horizon d'ALODO est le premier crédit formel, mais aucune banque ne prête sur du déclaratif. Il existe un fossé entre ce que le diagnostic produit et ce que le financement exige.

Sans aller vers l'intégration bancaire, il existe un entre-deux accessible : laisser la MPME joindre des preuves qu'elle possède déjà. Photo du RCCM ou de l'IFU, capture de l'historique Mobile Money, page du cahier de caisse. Le score porte alors deux composantes, déclarée et vérifiée.

La part vérifiée d'un dossier devient la mesure de sa bancabilité, et c'est elle qui se vend à une banque, qui n'a aucun moyen d'aller chercher cette information seule.

L'indice de confiance implémenté dans le prototype en est le premier étage : chaque réponse porte son niveau de preuve, et le score s'affiche avec la fiabilité qu'on peut lui accorder.

### 4.4 Mesurer l'écart entre le déclaré et l'observé

Les réponses données au départ sont des hypothèses testables. Un dirigeant qui annonce 150 000 F de bénéfice mensuel émet une prédiction que la BOX vérifiera en trente jours.

L'écart entre le déclaré et l'observé devient alors un signal à part entière. Il mesure deux choses, la connaissance qu'a le dirigeant de sa propre affaire et sa sincérité, toutes deux prédictives du risque de crédit.

Il rend surtout le questionnaire **auto-calibrant**. Au bout de 20 MPME équipées, ALODO sait lesquelles de ses questions prédisent le réel et peut supprimer les autres.

C'est la raison pour laquelle le prototype enregistre le montant de la question 6 sans le noter : il sert de ligne de base, pas de note.

## 5. Deux pistes plus courtes

**L'arrêt adaptatif plutôt que le branchement adaptatif.** Le sujet propose en exemple un parcours qui change selon le profil. La version plus utile n'est pas « quel parcours selon le profil » mais « quand puis-je arrêter de poser des questions ». Il ne faut pas huit questions pour établir qu'une entreprise est au plancher sur la formalisation, deux suffisent. En choisissant à chaque étape la question la plus informative compte tenu des réponses déjà obtenues, les huit dimensions se couvrent en douze questions au lieu de soixante, à précision égale. Cela règle le vrai problème du canal mobile, qui est la longueur.

**Le dernier kilomètre de la recommandation.** « Renforcez votre structuration financière » est un constat reformulé. Ce dont une MPME a besoin, c'est : voici les trois documents à obtenir, voici où, voici le coût, voici le délai. Cette table de correspondance entre faiblesse et action locale exécutable est un actif éditorial et non technique, et c'est elle qui rend l'accompagnement réel plutôt que nominal. Le prototype en contient une version réduite, une action par frein identifié.

## 6. Par où commencer

Par ordre de coût croissant.

| Priorité | Action                                                     | Coût                                              |
| -------- | ---------------------------------------------------------- | ------------------------------------------------- |
| 1        | Rejouer le diagnostic à six mois sur la première cohorte   | Aucun développement, seulement de l'organisation  |
| 2        | Enregistrer secteur et effectif à la candidature           | Deux champs, condition du scoring par classe      |
| 3        | Ajouter la pièce jointe et la vérification par un analyste | Stockage de fichiers et un écran de validation    |
| 4        | Rapprocher le déclaré et l'observé                         | Suppose que les premières BOX soient posées       |
| 5        | Arrêt adaptatif                                            | À calibrer sur les données des premières cohortes |

Les deux premières lignes ne demandent presque rien et débloquent l'essentiel : sans re-mesure il n'y a pas de preuve d'impact, et sans secteur ni effectif il n'y a pas de comparaison possible.

## 7. Ce qui reste à vérifier

Cette note repose sur une lecture du sujet et du site public. Trois points la feraient évoluer :

- **Qui administre le diagnostic.** Le prototype suppose qu'il est rempli par le dirigeant. S'il est passé par un analyste en entretien, l'interface devient un outil de terrain et non un parcours pédagogique.
- **Qui finance le programme.** Si le modèle repose sur les institutions financières plutôt que sur des bailleurs, la priorité passe de la preuve d'impact à la qualification du portefeuille.
- **Le calendrier d'équipement.** Toute la partie sur l'écart entre déclaré et observé suppose que les BOX soient posées peu après le diagnostic.
