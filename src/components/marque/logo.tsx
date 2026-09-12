import Image from "next/image";

import { MARQUE } from "@/lib/marque";
import { cn } from "@/lib/utils";

/** Dimensions natives du fichier source, pour conserver le rapport d'aspect du logo. */
const LARGEUR_NATIVE = 542;
const HAUTEUR_NATIVE = 460;

interface LogoProps {
  /** Hauteur rendue en pixels. La largeur en découle. */
  readonly hauteur?: number;
  readonly className?: string;
  /** Masque le nom du programme pour ne garder que la marque. */
  readonly sansMention?: boolean;
}

/**
 * Deux fichiers plutôt qu'un filtre CSS : la boucle sombre du logo disparaîtrait sur
 * fond sombre, et un filtre altérerait aussi l'orange de marque. La variante est produite
 * par outils/generer-logo-sombre.mjs, qui ne recolore que les pixels neutres.
 *
 * Les deux images sont rendues et permutées en CSS, ce qui évite tout clignotement
 * au chargement comme au changement de thème.
 */
export function Logo({ hauteur = 26, className, sansMention = false }: LogoProps) {
  const largeur = Math.round((hauteur * LARGEUR_NATIVE) / HAUTEUR_NATIVE);

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {/* Une seule des deux est affichée, donc une seule est annoncée : toutes deux
          portent le nom de la marque plutôt qu'un texte de remplacement vide. */}
      <Image
        src="/logo-alodo.png"
        alt={MARQUE.nom}
        width={largeur}
        height={hauteur}
        priority
        className="dark:hidden"
      />
      <Image
        src="/logo-alodo-sombre.png"
        alt={MARQUE.nom}
        width={largeur}
        height={hauteur}
        priority
        className="hidden dark:block"
      />
      {!sansMention && (
        <span className="libelle-instrument text-encre-attenue">{MARQUE.programme}</span>
      )}
    </span>
  );
}
