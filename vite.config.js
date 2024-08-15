// Plugins
import vue from '@vitejs/plugin-vue'
import webfontDownload from 'vite-plugin-webfont-dl';

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    webfontDownload([],
      {
        injectAsStyleTag: true,
        minifyCss: true,
        async: true,
        cache: true,
        proxy: false,
      }),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => 'src/lib/adapters/serial-worker.js', // Disable code splitting by assigning everything to a single chunk
      },
    },
    cssCodeSplit: false, // This ensures CSS is included in the same file
  },
})
