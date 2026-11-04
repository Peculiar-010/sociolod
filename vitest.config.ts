import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/youtube/index.ts", "src/spotify/index.ts"],
    },
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/integration/**"],
  },
});
