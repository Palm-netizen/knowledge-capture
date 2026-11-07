import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app has no server/data layer (static export), so every page
      // fetches its own data from Supabase on mount via a plain
      // fetch-on-mount effect (https://react.dev/learn/synchronizing-with-effects#fetching-data).
      // The rule can't see that the called loader is async and flags the
      // call site itself, even though setState only ever runs after the
      // await.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Separate Next.js app with its own config/dependencies.
    "content-studio/**",
  ]),
]);

export default eslintConfig;
