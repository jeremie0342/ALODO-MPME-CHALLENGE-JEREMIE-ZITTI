import Link from "next/link";

import { Logo } from "@/components/marque/logo";
import { cn } from "@/lib/utils";

/** Largeur de lecture commune à tous les écrans, pour que la mise en page ne dérive pas. */
export function Contenu({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-5xl px-5 sm:px-8", className)}>{children}</div>;
}

export function EnTete({ children }: { readonly children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-trait bg-papier/90 backdrop-blur-sm">
      <Contenu className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
        >
          <Logo />
        </Link>
        {children}
      </Contenu>
    </header>
  );
}

export function PiedDePage() {
  return (
    <footer className="mt-auto border-t border-trait">
      <Contenu className="flex flex-col gap-1 py-6">
        <p className="libelle-instrument text-encre-discrete">
          Prototype de diagnostic, données non conservées hors de cet appareil
        </p>
      </Contenu>
    </footer>
  );
}
