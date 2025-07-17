import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
import deps from './package.json';
export default createModuleFederationConfig({
  name: 'mf_react_rsbuild',
  remotes: {
    provider: 'rslib_provider@http://localhost:3001/mf-manifest.json',
    lib: 'rslib_lib@http://localhost:5000/mf-manifest.json',
  },
  shareStrategy: 'loaded-first',
  shared: {
    react: {singleton: true},
    'react-dom': {singleton: true},
    'react-router-dom': {
      singleton: true,
      requiredVersion: deps['react-router-dom'],
    },
  },
});
