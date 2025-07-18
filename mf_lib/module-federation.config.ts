import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
import pkg from './package.json';

export default createModuleFederationConfig({
  name: pkg.name,
  exposes: {
    '.': './src/index.tsx',
    './components': './src/components/index.tsx',
    './components/Button': './src/components/button/button.tsx',
  },
  shared: {
    react: {
      singleton: true,
      eager: true,
      requiredVersion: '^18.3.1',
    },
    'react-dom': {
      singleton: true,
      eager: true,
      requiredVersion: '^18.3.1',
    },
  },
});
