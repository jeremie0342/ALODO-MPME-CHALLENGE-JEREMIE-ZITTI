import type { Frein, Recommandation, Reponses } from "./types";

/**
 * Le dernier kilomètre du diagnostic. « Renforcez votre structuration financière »
 * n'est pas une recommandation mais un constat reformulé : chaque frein est traduit
 * en une action unique, locale et exécutable dans la semaine.
 */

type Variantes = {
  readonly defaut: Recommandation;
  /** Formulation plus précise selon la réponse donnée, quand elle change l'action. */
  readonly selon?: Readonly<Record<string, Recommandation>>;
};

const RECOMMANDATIONS: Readonly<Record<string, Variantes>> = {
  "q1-enregistrement": {
    defaut: {
      titre: "Complétez votre enregistrement",
      action:
        "Rendez-vous au Centre de formalités des entreprises pour obtenir le document qui vous manque, RCCM ou IFU.",
      justification:
        "Aucun établissement ne peut accorder un crédit formel à une entreprise qui n'existe pas juridiquement. Tant que ce dossier est incomplet, il plafonne tout le reste.",
    },
    selon: {
      aucun: {
        titre: "Faites exister votre entreprise",
        action:
          "Déposez un dossier d'immatriculation au Centre de formalités des entreprises pour obtenir votre RCCM, puis votre IFU auprès de l'administration fiscale.",
        justification:
          "C'est le seul point de départ possible. Vos chiffres peuvent être excellents, ils resteront inexploitables par un prêteur sans entité légale en face.",
      },
    },
  },

  "q2-separation": {
    defaut: {
      titre: "Séparez l'argent de l'entreprise du vôtre",
      action:
        "Ouvrez un compte Mobile Money dédié à l'entreprise et faites-y passer toutes les recettes. Versez-vous une somme fixe chaque mois plutôt que de puiser au fil de l'eau.",
      justification:
        "Tant que les deux caisses n'en font qu'une, personne ne peut mesurer ce que l'entreprise gagne réellement, et vous non plus.",
    },
  },

  "q3-encaissement": {
    defaut: {
      titre: "Laissez une trace de vos encaissements",
      action:
        "Ouvrez un numéro Mobile Money au nom de l'entreprise et proposez-le systématiquement comme moyen de paiement.",
      justification:
        "Un historique de transactions se récupère en quelques minutes et vaut davantage qu'une déclaration. C'est le chemin le plus court vers un dossier vérifiable.",
    },
  },

  "q4-enregistrement-flux": {
    defaut: {
      titre: "Notez vos entrées et vos sorties",
      action:
        "Chaque soir, inscrivez le total encaissé et le total dépensé. Un cahier suffit pour commencer.",
      justification:
        "Sans trace écrite, aucun chiffre n'est reconstituable. Trente jours de relevés valent plus qu'une année de mémoire.",
    },
  },

  "q5-pieces": {
    defaut: {
      titre: "Conservez vos justificatifs",
      action:
        "Demandez un reçu à chaque achat auprès d'un fournisseur et rangez-les dans une pochette unique, mois par mois.",
      justification:
        "Ce sont vos pièces qui transforment un chiffre déclaré en chiffre défendable devant un prêteur.",
    },
  },

  "q6-origine": {
    defaut: {
      titre: "Appuyez vos chiffres sur des écrits",
      action:
        "Reprenez le mois écoulé et reconstituez-le à partir de vos relevés Mobile Money et de vos reçus, plutôt que de mémoire.",
      justification:
        "Un chiffre estimé de tête est décoté dans votre évaluation. Le même chiffre, sorti d'un registre, compte pour sa valeur pleine.",
    },
  },

  "q7-dettes": {
    defaut: {
      titre: "Réduisez le nombre de vos créanciers",
      action:
        "Listez tout ce que vous devez, à qui et à quelle échéance, puis soldez en priorité l'engagement le plus court.",
      justification:
        "Le risque tient au cumul des sources de remboursement. Emprunter davantage avant d'avoir réduit ce cumul aggraverait votre situation au lieu de l'aider.",
    },
  },

  "q8-creances": {
    defaut: {
      titre: "Reprenez la main sur ce qu'on vous doit",
      action:
        "Tenez une page unique avec le nom de chaque client à crédit, le montant et la date promise. Relancez au-delà de quinze jours.",
      justification:
        "De l'argent dû est de l'argent absent de votre caisse. Ne pas savoir combien on vous doit est plus grave que d'avoir des impayés.",
    },
  },

  "q9-coussin": {
    defaut: {
      titre: "Constituez une réserve de sécurité",
      action:
        "Mettez de côté dix pour cent de chaque vente, sur un compte distinct, jusqu'à couvrir un mois de dépenses.",
      justification:
        "C'est votre capacité à absorber un mois creux qui détermine votre capacité à honorer une échéance de remboursement.",
    },
  },

  "q10-usage": {
    defaut: {
      titre: "Précisez ce que financerait un crédit",
      action:
        "Chiffrez un besoin unique, son montant et le revenu supplémentaire attendu, sur une seule page.",
      justification:
        "Un financement sans usage défini se dilue dans la trésorerie courante et se rembourse mal. Le projet précède la demande.",
    },
  },
};

const RECOMMANDATION_PAR_DEFAUT: Recommandation = {
  titre: "Structurez vos chiffres",
  action: "Reprenez le mois écoulé et consignez par écrit vos recettes et vos dépenses.",
  justification:
    "Un diagnostic ne vaut que par la matière qu'on lui donne. La trace écrite est le préalable à toute démarche de financement.",
};

export function recommander(frein: Frein, reponses: Reponses): Recommandation {
  const variantes = RECOMMANDATIONS[frein.questionId];
  if (!variantes) return RECOMMANDATION_PAR_DEFAUT;

  const reponse = reponses[frein.questionId]?.[0];
  const variante = reponse ? variantes.selon?.[reponse] : undefined;

  return variante ?? variantes.defaut;
}
