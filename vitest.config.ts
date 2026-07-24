import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [mdx({ remarkPlugins: [remarkGfm] })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    environment: "node",
  },
});
