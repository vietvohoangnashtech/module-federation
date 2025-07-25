import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'mf_cart',
  exposes: {
    './components': './src/components/index.ts',
  },
  remotes: {
    mf_shared_lib: 'mf_shared_lib@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true, eager: true},
    'react-dom': {singleton: true, eager: true},
  },
});
