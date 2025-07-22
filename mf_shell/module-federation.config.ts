import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'mf_shell',
  remotes: {
    // mf_cart: 'mf_cart@http://localhost:3002/mf-manifest.json',
    // mf_checkout: 'mf_checkout@http://localhost:3003/mf-manifest.json',
    // mf_products: 'mf_products@http://localhost:3004/mf-manifest.json',
    mf_user: 'mf_user@http://localhost:3005/mf-manifest.json',
    mf_shared_lib: 'mf_shared_lib@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true},
    'react-dom': {singleton: true},
  },
});
