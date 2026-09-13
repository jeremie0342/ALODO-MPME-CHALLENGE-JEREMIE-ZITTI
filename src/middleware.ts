import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  /*
    Trois motifs plutot qu'une seule expression : la racine, les chemins deja prefixes,
    et tout le reste hors fichiers statiques et points d'entree internes. Un chemin sans
    prefixe de langue comme /diagnostic doit etre redirige, pas renvoyer une page absente.
  */
  matcher: ["/", "/(fr|en)/:chemin*", "/((?!_next|_vercel|api|.*[.].*).*)"],
};
