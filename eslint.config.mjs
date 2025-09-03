import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "off", // Disable unused variable check
      "@typescript-eslint/no-unused-vars": "off", // Disable TypeScript unused variable check
      "@typescript-eslint/no-explicit-any": "off", // Disable implicit 'any' check
      "react-hooks/exhaustive-deps": "warn", // Change exhaustive deps to warning instead of error
      "@typescript-eslint/no-var-requires": "off", // Disable no require imports rule
    },
  },
];

export default eslintConfig;
