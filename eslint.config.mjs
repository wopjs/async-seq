import wopjs from "@wopjs/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(...wopjs, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-expressions": "off",
  },
});
