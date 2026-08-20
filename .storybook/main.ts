import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.stories.@(ts|tsx)",
    "../src/components/ui/LearnerProgressBadge.stories.tsx"
  ],
  framework: "@storybook/react-vite"
};

export default config;