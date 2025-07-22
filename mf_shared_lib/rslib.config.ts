import {pluginReact} from '@rsbuild/plugin-react';
import {pluginSass} from '@rsbuild/plugin-sass';
import {defineConfig} from '@rslib/core';
import {pluginModuleFederation} from '@module-federation/rsbuild-plugin';
import moduleFederationConfig from './module-federation.config';
import pkg from './package.json';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      ...shared,
      format: 'mf',
      output: {
        // set unpkg cdn as assetPrefix if you want to publish
        assetPrefix:
          process.env.NODE_ENV === 'production'
            ? `https://unpkg.com/${pkg.name}@latest/dist/mf/`
            : undefined,
        distPath: {
          root: './dist/mf',
        },
      },
    },
  ],
  server: {
    port: 5000,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(moduleFederationConfig, {}),
    pluginSass(),
  ],
});
