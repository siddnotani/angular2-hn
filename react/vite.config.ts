/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ngEncapsulationBabel, ngEncapsulationPostcss } from './build/ngEncapsulation';

export default defineConfig({
  plugins: [react({ babel: { plugins: [ngEncapsulationBabel] } })],
  css: {
    postcss: { plugins: [ngEncapsulationPostcss()] },
    preprocessorOptions: {
      scss: {
        // The Angular SCSS is ported verbatim, including @import and `/` division.
        silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'build/**/*.test.ts'],
  },
});
