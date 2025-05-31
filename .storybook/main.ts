import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  // Configure for GitHub Pages deployment (only in production)
  managerHead: (head) => {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      return `
        ${head}
        <base href="/react-cie-1931/" />
      `;
    }
    return head;
  },
  viteFinal: async (config, { configType }) => {
    const isProduction = configType === "PRODUCTION";
    const basePath = "/react-cie-1931/";

    return mergeConfig(config, {
      // Configure base path for GitHub Pages
      base: isProduction ? basePath : "/",

      // Optimize dependency handling
      optimizeDeps: {
        // Include dependencies that should be pre-bundled
        include: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react-dom/client",
        ],
        // Exclude Storybook internals from optimization
        exclude: [
          "@storybook/addon-docs/dist/DocsRenderer-CFRXHY34.js",
          "@storybook/addon-docs",
          "@storybook/blocks",
          "@storybook/components",
          "@storybook/global",
          "@storybook/manager-api",
          "@storybook/preview-api",
          "@storybook/theming",
        ],
      },

      // Build optimizations
      build: {
        // Ensure assets are properly handled
        assetsDir: "assets",
        // Optimize chunk strategy
        rollupOptions: {
          output: {
            // Manual chunking for better caching
            manualChunks: (id) => {
              // Vendor chunk for node_modules
              if (id.includes("node_modules")) {
                // Separate React ecosystem
                if (id.includes("react") || id.includes("react-dom")) {
                  return "react-vendor";
                }
                // Other vendor dependencies
                return "vendor";
              }
              // Storybook chunks
              if (id.includes("@storybook")) {
                return "storybook";
              }
            },
          },
        },
        // Set appropriate chunk size limits
        chunkSizeWarningLimit: 1000,
      },

      // Environment-specific optimizations
      ...(isProduction && {
        esbuild: {
          // Production optimizations
          drop: ["console", "debugger"],
        },
      }),
    });
  },
};

export default config;
