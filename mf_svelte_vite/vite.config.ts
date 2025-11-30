import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    svelte(),
    federation({
      name: 'svelteRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.svelte',
      },
      shared: {
        svelte: {
          singleton: true,
        },
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
});
