# Modèle de score

Le score global s'appelle indice de préparation au financement. Il répond à une question unique : cette entreprise peut-elle décrocher un premier crédit formel ?

## Trois règles

1. **L'existence légale est un verrou, pas un mérite.** Elle plafonne le score au lieu de le gonfler.
2. **Un chiffre vaut ce que vaut sa preuve.** La dimension finance est décotée par la qualité comptable.
3. **« Je ne sais pas » est une réponse notée.** Jamais une donnée manquante.

## Étape 1, score par dimension

Chaque dimension totalise 100 points, vérifié par test.

### Formalisation

| Question                | Réponse                    | Points |
| ----------------------- | -------------------------- | ------ |
| Q1 Enregistrement       | RCCM et IFU                | 50     |
|                         | Un seul des deux           | 30     |
|                         | Démarches commencées       | 15     |
|                         | Rien                       | 0      |
| Q2 Séparation pro/perso | Complètement séparés       | 30     |
|                         | Séparés mais je pioche     | 15     |
|                         | Tout mélangé               | 0      |
| Q3 Encaissement         | Compte bancaire entreprise | 20     |
|                         | Mobile Money dédié         | 16     |
|                         | Compte bancaire personnel  | 8      |
|                         | Mobile Money personnel     | 6      |
|                         | Espèces                    | 0      |

Q3 retient le **meilleur** canal, pas la somme : multiplier les canaux ne prouve rien.

### Comptabilité

| Question                   | Réponse              | Points |
| -------------------------- | -------------------- | ------ |
| Q4 Enregistrement des flux | Logiciel             | 40     |
|                            | Téléphone            | 30     |
|                            | Cahier               | 20     |
|                            | Rien                 | 0      |
| Q5 Pièces justificatives   | Toujours             | 30     |
|                            | Parfois              | 15     |
|                            | Rarement ou jamais   | 0      |
| Q6b Origine du chiffre     | Registres écrits     | 30     |
|                            | Estimation de tête   | 12     |
|                            | Ne sait pas vraiment | 0      |

### Finance

| Question                 | Réponse                         | Points |
| ------------------------ | ------------------------------- | ------ |
| Q9 Tenue sans ventes     | Plus de 3 mois                  | 35     |
|                          | 1 à 3 mois                      | 26     |
|                          | 1 à 4 semaines                  | 14     |
|                          | Moins d'une semaine             | 4      |
|                          | Je ne sais pas                  | 0      |
| Q7 Dettes                | Aucune                          | 25     |
|                          | 1 source formelle               | 18     |
|                          | 1 source informelle             | 12     |
|                          | 2 sources                       | 6      |
|                          | 3 sources ou plus               | 0      |
| Q8 Créances              | Jamais à crédit                 | 20     |
|                          | Parfois, paient à temps         | 15     |
|                          | Souvent, difficultés            | 5      |
|                          | Ne sait pas combien on lui doit | 0      |
| Q10 Usage du financement | Stock                           | 20     |
|                          | Matériel                        | 18     |
|                          | Embauche                        | 14     |
|                          | Rembourser des dettes           | 5      |
|                          | Ne sait pas encore              | 0      |

Q7 note le **cumul** des sources de remboursement, l'informel pesant plus lourd que le formel parce qu'il échappe à tout suivi.

**Q6a, le montant, n'est pas noté.** On ne mesure pas combien l'entreprise gagne, on mesure si le dirigeant le sait. Le montant est conservé comme ligne de base T0.

## Étape 2, décote de confiance

```
finance_ajustée = finance_brute × coefficient
```

| Origine du chiffre   | Coefficient |
| -------------------- | ----------- |
| Registres écrits     | 1,00        |
| Estimation de tête   | 0,85        |
| Ne sait pas vraiment | 0,70        |

Une décote, pas une annulation. Le plancher à 0,70 évite de sanctionner une population qui, par construction, ne tient pas de comptabilité écrite.

Q6b sert deux fois, et c'est voulu : elle **mesure** la comptabilité et elle **pondère** la finance. Deux rôles distincts, pas un double comptage.

## Étape 3, score global

```
base = 0,30 × formalisation + 0,30 × comptabilité + 0,40 × finance_ajustée
score = min(base, plafond)
```

| Q1                 | Plafond |
| ------------------ | ------- |
| RCCM et IFU        | 100     |
| Un seul document   | 75      |
| Démarches en cours | 60      |
| Rien               | 45      |

Le plafond vient d'**une question**, pas de toute la dimension, pour ne pas sanctionner deux fois la même faiblesse.

## Étape 4, indice de confiance

Affiché à côté du score pour qu'ALODO sache s'il peut le reprendre dans un rapport.

| Condition                                      | Confiance |
| ---------------------------------------------- | --------- |
| Aucune ignorance et chiffre issu des registres | Élevée    |
| 1 à 2 ignorances, ou chiffre estimé de mémoire | Moyenne   |
| 3 ignorances ou plus                           | Faible    |

Un chiffre estimé de tête interdit la confiance élevée, même si le dirigeant a répondu à tout.

## Étape 5, frein et recommandation

Le frein principal est la **question** au plus grand écart pondéré au maximum :

```
écart = (points_max − points_obtenus) × poids_dimension
```

Une question se traduit en une action ; une dimension ne donne qu'un reproche vague. Si l'entreprise n'est pas enregistrée, le frein est toujours Q1 : rien d'autre ne débloque un crédit formel.

Chaque frein est associé à une action locale exécutable dans `recommandations.ts`.

## Cas de référence

Commerce de détail, 2 personnes. Ce cas est figé dans `tests/unitaires/scoring.test.ts`.

|                 |                                                   |
| --------------- | ------------------------------------------------- |
| Formalisation   | 30 + 15 + 6 = **51**                              |
| Comptabilité    | 20 + 15 + 12 = **47**                             |
| Finance brute   | 14 + 6 + 5 + 20 = **45**                          |
| Finance ajustée | 45 × 0,85 = **38**                                |
| Base            | 0,30(51) + 0,30(47) + 0,40(38) = **45**           |
| Plafond         | 75, non contraignant                              |
| **Score**       | **45 sur 100, confiance moyenne, niveau fragile** |

## Limites assumées

- Les seuils et les poids sont posés à dire d'expert, pas calibrés sur des données. Ils ne le seront qu'après la première cohorte.
- Le score est déclaratif. Rien ne vérifie les réponses, ce qui est précisément le rôle de l'indice de confiance.
- La pondération 30/30/40 est défendable autrement. Ce qui compte est qu'elle soit explicite et modifiable en un seul endroit, `bareme.ts`.
