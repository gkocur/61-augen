/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: ['./src/test/setup.ts'],
    // Node 26 ma własne (eksperymentalne) localStorage, które przesłania to z jsdom.
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
