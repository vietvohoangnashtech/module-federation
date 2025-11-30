export default {
  name: 'vueRemote',
  exposes: {
    './App': './src/App.vue',
  },
  shared: ['vue'],
};
