import { FournisseurDiagnostic } from "@/etat/contexte-diagnostic";

export default function LayoutDiagnostic({ children }: { children: React.ReactNode }) {
  return <FournisseurDiagnostic>{children}</FournisseurDiagnostic>;
}
