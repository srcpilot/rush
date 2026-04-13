import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cloudflareDevProxy from '@cloudflare/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    cloudflareDevProxy(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
  },
});
