import { defineConfig } from "vitest/config";

import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",

    include: ["src/**/*.test.ts"],

    testTimeout: 15000,

    setupFiles: ["src/test/setup.ts"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

      // Next.js-only import guard; stub it for unit tests.
      "server-only": path.resolve(__dirname, "./src/test/server-only-stub.ts"),
    },
  },
});
