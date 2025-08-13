import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        "experiment-01": "experiment-01/index.html",
        "experiment-01-child": "experiment-01/child.html",

      },
    },
  },
});
