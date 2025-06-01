import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
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
    // Only add base href for GitHub Pages, not custom domains
    const isGitHubPages =
      process.env.GITHUB_PAGES || process.env.GITHUB_ACTIONS;
    if (isProduction && isGitHubPages) {
      return `
        ${head}
        <base href="/react-cie-1931/" />
      `;
    }
    return head;
  },
  viteFinal: async (config, { configType }) => {
    const isProduction = configType === "PRODUCTION";
    // Only use base path for GitHub Pages deployment, not custom domains
    const isGitHubPages =
      process.env.GITHUB_PAGES || process.env.GITHUB_ACTIONS;
    const basePath = isProduction && isGitHubPages ? "/react-cie-1931/" : "/";

    return mergeConfig(config, {
      // Configure base path for GitHub Pages
      base: basePath,

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
