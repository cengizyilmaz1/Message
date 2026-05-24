import { FlatCompat } from "@eslint/eslintrc"
import prettier from "eslint-config-prettier/flat"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "tailwind.config.js",
      "postcss.config.js",
      "prettier.config.js",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
]

export default eslintConfig
