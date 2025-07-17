import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
import deps from './package.json';
export default createModuleFederationConfig({
  name: 'mf_provider_app',
  exposes: {
    '.': './src/components/ProviderComponent.tsx',
  },
  remotes: {
    lib: 'rslib_provider@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true},
    'react-dom': {singleton: true},
    'react-router-dom': {
      singleton: true,
      requiredVersion: deps['react-router-dom'],
    },
  },
});
