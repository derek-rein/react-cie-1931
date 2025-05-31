import type { StorybookConfig } from "@storybook/react-vite";

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
  // Configure for GitHub Pages deployment
  managerHead: (head) => `
    ${head}
    <base href="/react-cie-1931/" />
  `,
  viteFinal: async (config) => {
    // Configure for GitHub Pages deployment
    const isProduction = process.env.NODE_ENV === "production";
    const basePath = "/react-cie-1931/";

    if (isProduction) {
      config.base = basePath;
      // Ensure assets are loaded with correct base path
      config.build = {
        ...config.build,
        assetsDir: "assets",
      };
    }

    // Fix Storybook dependency optimization issues
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        "@storybook/blocks",
        "@storybook/components",
        "@storybook/core-events",
        "@storybook/docs-tools",
        "@storybook/global",
        "@storybook/manager-api",
        "@storybook/preview-api",
        "@storybook/theming",
        "@storybook/types",
      ],
    };

    return config;
  },
};
export default config;
