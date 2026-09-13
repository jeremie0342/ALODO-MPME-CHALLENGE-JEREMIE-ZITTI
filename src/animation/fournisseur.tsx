"use client";

import { LazyMotion, domAnimation } from "motion/react";

/**
 * Charge le sous-ensemble d'animations réellement utilisé plutôt que la bibliothèque
 * entière. Les composants emploient `m` et non `motion`, ce qui divise par trois le
 * poids ajouté au premier chargement, un critère qui compte sur réseau instable.
 */
export function FournisseurMouvement({ children }: { readonly children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
