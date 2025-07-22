import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'mf_user',
  exposes: {
    '.': './src/bootstrap.tsx',
    './LoginPage': './src/components/LoginPage.tsx',
    './SignupPage': './src/components/SignupPage.tsx',
    './authReducer': './src/redux/auth/reducer.ts',
    './rootSaga': './src/redux/sagas.ts',
  },
  remotes: {
    mf_shared_lib: 'mf_shared_lib@http://localhost:5000/mf-manifest.json',
  },
  shared: {
    react: {singleton: true, eager: true},
    'react-dom': {singleton: true, eager: true},
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
