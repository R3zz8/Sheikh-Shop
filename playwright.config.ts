import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:3000',
  },
});
