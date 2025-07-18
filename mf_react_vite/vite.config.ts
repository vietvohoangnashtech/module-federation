import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {federation} from '@module-federation/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mf_react_vite',
      remotes: {
        lib: 'rslib@http://localhost:5000/mf-manifest.json',
      },
      shared: {
        react: {singleton: true, requiredVersion: '^18.3.1'},
        'react-dom': {singleton: true, requiredVersion: '^18.3.1'},
      },
    }),
  ],
});
