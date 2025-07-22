import {createModuleFederationConfig} from '@module-federation/rsbuild-plugin';
import pkg from './package.json';

export default createModuleFederationConfig({
  name: pkg.name,
  exposes: {
    '.': './src/index.tsx',
    './components': './src/components/index.tsx',
    './components/Button': './src/components/Button.tsx',
    './components/Modal': './src/components/Modal.tsx',
    './components/Card': './src/components/Card.tsx',
    './components/Input': './src/components/Input.tsx',
    './components/Select': './src/components/Select.tsx',
    './components/Checkbox': './src/components/Checkbox.tsx',
    './components/Radio': './src/components/Radio.tsx',
    './components/Textarea': './src/components/Textarea.tsx',
    './components/Alert': './src/components/Alert.tsx',
    './components/Navbar': './src/components/Navbar.tsx',
    './components/Dropdown': './src/components/Dropdown.tsx',
    './components/Tooltip': './src/components/Tooltip.tsx',
    './components/Spinner': './src/components/Spinner.tsx',
    './components/Table': './src/components/Table.tsx',
    './components/Badge': './src/components/Badge.tsx',
    './components/Pagination': './src/components/Pagination.tsx',
    './components/Tabs': './src/components/Tabs.tsx',
    './components/Breadcrumbs': './src/components/Breadcrumbs.tsx',
    './redux': './src/redux/index.ts',
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
