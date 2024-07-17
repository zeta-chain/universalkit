import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "MyLib",
      formats: ["es"],
      fileName: (format) => `index.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
