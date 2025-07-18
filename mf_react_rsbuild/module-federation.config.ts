import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
export default createModuleFederationConfig({
  name: 'mf_react_rsbuild',
  remotes: {
    provider: 'rslib_provider@http://localhost:3001/mf-manifest.json',
    lib: 'rslib_lib@http://localhost:5000/mf-manifest.json',
  },
  shareStrategy: 'loaded-first',
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
