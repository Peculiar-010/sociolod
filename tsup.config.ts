import { defineConfig } from "tsup";

export default defineConfig([
  // Main entry
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    minify: false,
    target: "es2020",
    outDir: "dist",
    platform: "neutral",
    esbuildOptions(options) {
      options.conditions = ["import", "require"];
    },
  },
  // YouTube sub-entry
  {
    entry: { "youtube/index": "src/youtube/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    outDir: "dist",
    platform: "neutral",
  },
  // Spotify sub-entry
  {
    entry: { "spotify/index": "src/spotify/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    outDir: "dist",
    platform: "neutral",
  },
]);
