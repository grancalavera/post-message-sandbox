/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { glob } from "glob";

const experimentEntries = glob
  .sync("experiment-*/**/index.html")
  .reduce((entries: Record<string, string>, file) => {
    // Convert "experiment-01/child/index.html" to "experiment-01-child"
    const segments = file.split("/");
    const experimentName = segments[0]; // "experiment-01"
    const subPath = segments.slice(1, -1); // ["child"] or []

    const entryName =
      subPath.length > 0
        ? `${experimentName}-${subPath.join("-")}`
        : experimentName;

    entries[entryName] = file;
    return entries;
  }, {});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        ...experimentEntries,
      },
    },
  },
  worker: {
    format: "es",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
