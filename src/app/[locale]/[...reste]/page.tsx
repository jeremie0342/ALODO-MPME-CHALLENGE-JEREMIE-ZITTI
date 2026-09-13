import { notFound } from "next/navigation";

/**
 * Attrape les adresses inconnues situees sous un segment de langue, afin que la page
 * d'erreur s'affiche dans la mise en page localisee plutot que dans le repli racine.
 */
export default function PageAttrapeTout() {
  notFound();
}
