import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  async viteFinal(config, options) {
    // Add your configuration here
    return config;
  },
};

export default config;
