import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'mf_products',
  exposes: {
    '.': './src/bootstrap.tsx',
  },
  remotes: {
    mf_shared_lib: 'mf_shared_lib@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true},
    'react-dom': {singleton: true},
  },
});
