export default {
  name: 'svelteRemote',
  exposes: {
    './App': './src/App.svelte',
  },
  shared: ['svelte'],
};
