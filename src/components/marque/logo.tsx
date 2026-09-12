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

export function Logo({ hauteur = 26, className, sansMention = false }: LogoProps) {
  const largeur = Math.round((hauteur * LARGEUR_NATIVE) / HAUTEUR_NATIVE);

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image src="/logo-alodo.png" alt={MARQUE.nom} width={largeur} height={hauteur} priority />
      {!sansMention && (
        <span className="libelle-instrument text-encre-attenue">{MARQUE.programme}</span>
      )}
    </span>
  );
}
