import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globals: true,
    // The type tests assert what the engine sends. Without a type check they
    // run as no-ops and pass whatever the types say.
    typecheck: {
      enabled: true,
      include: ["tests/types.test.ts"],
      tsconfig: "./tsconfig.test.json",
    },
  },
});
