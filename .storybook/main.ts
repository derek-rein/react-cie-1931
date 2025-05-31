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
  viteFinal: async (config) => {
    // Ensure proper base URL for GitHub Pages deployment
    if (process.env.NODE_ENV === "production") {
      config.base = "/react-cie-1931/";
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
