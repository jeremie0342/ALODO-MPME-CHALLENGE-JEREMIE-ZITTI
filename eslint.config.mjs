import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // La regle ne vise que le code applicatif : dans un script en ligne de commande,
    // ecrire sur la sortie standard est le comportement attendu.
    files: ["src/**", "tests/**"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "console",
          property: "log",
          message: "Retirer les traces de débogage avant de livrer.",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
