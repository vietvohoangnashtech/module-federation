export default {
  name: 'angularRemote',
  exposes: {
    './Component': './src/app/app.component.ts',
  },
  shared: ['@angular/core', '@angular/common', '@angular/router'],
};
