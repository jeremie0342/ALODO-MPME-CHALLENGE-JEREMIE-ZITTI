import Image from "next/image";

import { MARQUE } from "@/lib/marque";
import { cn } from "@/lib/utils";

interface LogoProps {
  readonly taille?: number;
  readonly className?: string;
  /** Masque le nom du programme pour ne garder que la marque. */
  readonly sansMention?: boolean;
}

export function Logo({ taille = 28, className, sansMention = false }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-alodo.png"
        alt={MARQUE.nom}
        width={taille}
        height={taille}
        priority
        className="h-auto w-auto"
        style={{ width: taille, height: "auto" }}
      />
      {!sansMention && (
        <span className="libelle-instrument text-encre-attenue">{MARQUE.programme}</span>
      )}
    </span>
  );
}
