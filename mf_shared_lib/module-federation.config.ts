import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
import pkg from './package.json';

export default createModuleFederationConfig({
  name: pkg.name,
  exposes: {
    './redux': './src/redux/index.ts',
    './navigationSlice': './src/redux/navigation/navigationSlice.ts',
    './components': './src/components/index.ts',
    './theme/tokens': './src/theme/tokens.ts',
    './icons': './src/icons/index.ts',
  },
  shared: {
    react: {
      singleton: true,
      eager: true,
    },
    'react-dom': {
      singleton: true,
      eager: true,
    },
    '@reduxjs/toolkit': {
      singleton: true,
      eager: true,
    },
    'react-redux': {
      singleton: true,
      eager: true,
    },
    'redux-saga': {
      singleton: true,
      eager: true,
    },
  },
});
