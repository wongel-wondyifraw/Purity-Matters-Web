import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/public/_next/**",
    "next-env.d.ts",
  ]),
  {
    files: ["server.js", "scripts/**/*.js"],
    rules: {
      // These Node entry points intentionally use CommonJS for runtime compatibility.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      // Legacy API payloads are normalized at the service boundary; keep gradual typing from blocking lint.
      "@typescript-eslint/no-explicit-any": "off",
      // Existing form initialization and server-clamped pagination synchronize state in effects.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
