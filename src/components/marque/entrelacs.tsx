import { cn } from "@/lib/utils";

/**
 * Motif repris des deux boucles entrelacées du logo ALODO.
 * Il sert de signature graphique et porte la lecture du diagnostic : deux anneaux liés,
 * ce que l'entreprise déclare et ce qu'elle peut prouver. Tracé seul, jamais rempli.
 */
export function Entrelacs({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className={cn("text-trait", className)}
    >
      <ellipse
        cx="96"
        cy="120"
        rx="58"
        ry="86"
        transform="rotate(-24 96 120)"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <ellipse
        cx="144"
        cy="120"
        rx="58"
        ry="86"
        transform="rotate(24 144 120)"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}
