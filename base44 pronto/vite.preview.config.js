import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(process.cwd()),
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      'react-router-dom': path.resolve(process.cwd(), 'src/preview-router.js'),
    },
  },
  css: { postcss: false },
  esbuild: { jsxInject: "import React from 'react'" },
  server: { port: 5174, strictPort: true },
});
