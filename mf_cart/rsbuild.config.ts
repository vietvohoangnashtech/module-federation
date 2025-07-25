import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
import {pluginModuleFederation} from '@module-federation/rsbuild-plugin';
import moduleFederationConfig from './module-federation.config';

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig, {})],
  server: {
    port: 3002,
  },
  tools: {
    rspack: (config, {rspack}) => {
      config.plugins.push(
        new rspack.DefinePlugin({
          'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
          'process.env.SUPABASE_PUBLIC_KEY': JSON.stringify(
            process.env.SUPABASE_PUBLIC_KEY
          ),
        })
      );
    },
  },
});
