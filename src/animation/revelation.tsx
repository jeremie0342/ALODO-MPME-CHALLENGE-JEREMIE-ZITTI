"use client";

import { m } from "motion/react";

import { TRANSITION_REVELATION, VARIANTES_REVELATION, VARIANTES_SERIE } from "./mouvement";
import { useMouvementReduit } from "./use-mouvement-reduit";

/**
 * Révèle une série d'éléments en cascade légère.
 * Mouvement réduit actif, les enfants apparaissent à leur état final sans transition.
 */
export function Serie({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  const mouvementReduit = useMouvementReduit();

  if (mouvementReduit) return <div className={className}>{children}</div>;

  return (
    <m.div className={className} variants={VARIANTES_SERIE} initial="entree" animate="presente">
      {children}
    </m.div>
  );
}

export function Revelation({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  const mouvementReduit = useMouvementReduit();

  if (mouvementReduit) return <div className={className}>{children}</div>;

  return (
    <m.div className={className} variants={VARIANTES_REVELATION} transition={TRANSITION_REVELATION}>
      {children}
    </m.div>
  );
}
