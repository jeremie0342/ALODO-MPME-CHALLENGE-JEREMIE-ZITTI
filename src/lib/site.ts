/**
 * Adresse publique du diagnostic.
 * Renseignée par Vercel en production, repli sur l'URL de la démonstration pour que
 * les métadonnées absolues restent correctes en local comme en préproduction.
 */
const DEMO = "https://alodo-mpme-challenge-jeremie-zitti.vercel.app";

function deduireUrl(): string {
  if (process.env.NEXT_PUBLIC_URL_SITE) return process.env.NEXT_PUBLIC_URL_SITE;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return DEMO;
}

export const URL_SITE = deduireUrl();
