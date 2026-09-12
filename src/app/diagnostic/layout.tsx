import { FournisseurDiagnostic } from "@/etat/contexte-diagnostic";

export default function LayoutDiagnostic({ children }: LayoutProps<"/diagnostic">) {
  return <FournisseurDiagnostic>{children}</FournisseurDiagnostic>;
}
