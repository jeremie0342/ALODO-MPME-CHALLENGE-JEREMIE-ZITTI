"use client";

import Link from "next/link";
import { X } from "lucide-react";

/**
 * Sortie explicite du questionnaire. Le libellé annonce que le parcours est conservé :
 * un simple « Quitter » laisserait croire qu'on perd ses réponses, et dissuaderait
 * de s'interrompre alors que le diagnostic se remplit entre deux clients.
 */
export function BoutonSortie() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-sm px-1 py-1 text-encre-attenue transition-colors hover:text-encre focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
    >
      <span className="libelle-instrument hidden sm:inline">Reprendre plus tard</span>
      <X className="size-4" strokeWidth={2} aria-hidden="true" />
      <span className="sr-only sm:hidden">Quitter le diagnostic, mes réponses sont conservées</span>
    </Link>
  );
}
