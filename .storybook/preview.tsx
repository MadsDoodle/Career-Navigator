/// <reference path="../src/vite-env.d.ts" />

import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '../src/contexts/UserContext';
import { Toaster } from '../src/components/ui/toaster';
import React from 'react';

import '../src/index.css';
import '../src/components/ui/tokens.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UserProvider>
            <Story />
            <Toaster />
          </UserProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export default preview;