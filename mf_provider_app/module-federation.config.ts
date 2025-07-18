import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
export default createModuleFederationConfig({
  name: 'mf_provider_app',
  exposes: {
    '.': './src/components/ProviderComponent.tsx',
  },
  remotes: {
    lib: 'rslib_provider@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true, eager: true, requiredVersion: '^18.3.1'},
    'react-dom': {singleton: true, eager: true, requiredVersion: '^18.3.1'},
    'react-router-dom': {
      singleton: true,
      eager: true,
      requiredVersion: '^7.6.3',
    },
  },
});
