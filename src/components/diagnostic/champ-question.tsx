"use client";

import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Option, Question } from "@/domaine/types";
import { cn } from "@/lib/utils";

interface ChampQuestionProps {
  readonly question: Question;
  readonly selection: readonly string[];
  readonly onChoisir: (selection: readonly string[]) => void;
  readonly onBasculer: (optionId: string, exclusive: boolean) => void;
}

/**
 * Rend une question à partir de sa seule description structurelle, les libellés étant
 * résolus par identifiant dans les messages. Ajouter un type de question se fait ici
 * et nulle part ailleurs : les écrans n'en savent rien.
 */
export function ChampQuestion({ question, selection, onChoisir, onBasculer }: ChampQuestionProps) {
  const t = useTranslations("questions");
  const libelle = (option: Option) => t(`${question.id}.options.${option.id}`);

  if (question.type === "choix-multiple") {
    return (
      <div role="group" aria-label={t(`${question.id}.intitule`)} className="grid gap-2.5">
        {question.options.map((option) => (
          <LigneOption
            key={option.id}
            libelle={libelle(option)}
            optionId={option.id}
            coche={selection.includes(option.id)}
            multiple
            onActiver={() => onBasculer(option.id, Boolean(option.exclusive))}
          />
        ))}
      </div>
    );
  }

  return (
    <RadioGroup
      value={selection[0] ?? ""}
      onValueChange={(valeur) => onChoisir([valeur])}
      className="grid gap-2.5"
    >
      {question.options.map((option) => (
        <LigneOption
          key={option.id}
          libelle={libelle(option)}
          optionId={option.id}
          coche={selection.includes(option.id)}
          multiple={false}
        />
      ))}
    </RadioGroup>
  );
}

interface LigneOptionProps {
  readonly libelle: string;
  readonly optionId: string;
  readonly coche: boolean;
  readonly multiple: boolean;
  readonly onActiver?: () => void;
}

/**
 * Cible tactile pleine largeur. Le marché visé répond sur un téléphone d'entrée de gamme,
 * souvent debout : la zone cliquable est la ligne entière, pas la pastille.
 */
function LigneOption({ libelle, optionId, coche, multiple, onActiver }: LigneOptionProps) {
  const identifiant = `option-${optionId}`;

  return (
    <label
      htmlFor={identifiant}
      data-coche={coche || undefined}
      className={cn(
        "group/field-label flex min-h-14 items-center gap-3.5 rounded-md border border-trait bg-papier-releve px-4 py-3.5 transition-colors",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-signal has-[:focus-visible]:ring-offset-2",
        coche ? "border-signal bg-signal-sourd" : "hover:border-trait-appuye hover:bg-survol",
      )}
    >
      {multiple ? (
        <Checkbox
          id={identifiant}
          checked={coche}
          onCheckedChange={onActiver}
          className="shrink-0"
        />
      ) : (
        <RadioGroupItem id={identifiant} value={optionId} className="shrink-0" />
      )}

      <span className={cn("text-[0.9375rem] leading-snug text-encre", coche && "font-medium")}>
        {libelle}
      </span>
    </label>
  );
}
