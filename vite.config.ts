import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ["**/*.stories.*", "**/*.test.*"],
      rollupTypes: true, // Bundle types into a single file for better distribution
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "ReactCIE1931",
      formats: ["es", "umd"],
      fileName: (format) => `viewer.${format === "umd" ? "umd.cjs" : "js"}`,
    },
    sourcemap: true, // Generate source maps for better debugging
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ["react", "react-dom"],
      output: {
        // Provide global variables for UMD build
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Ensure CSS is extracted properly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "viewer.css";
          }
          return assetInfo.name || "assets/[name].[ext]";
        },
      },
    },
    // Optimize for component library
    target: "es2020", // Support modern features including BigInt
  },
});
