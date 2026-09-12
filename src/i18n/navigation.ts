import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/** Navigation consciente de la langue : les liens conservent le préfixe courant. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
