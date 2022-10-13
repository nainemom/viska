import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { version } from './package.json';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  define: {
    APP_VERSION: JSON.stringify(version),
  },
})
