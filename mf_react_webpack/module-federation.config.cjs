module.exports = {
  name: 'mf_react_webpack',
  remotes: {
    lib: 'rslib@http://localhost:5000/mf-manifest.json',
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
};
