# Module Federation Configuration

## Host (`mf_shell`)

- Loads remotes at runtime using `module-federation.config.ts`
- Shares dependencies like React, Redux, etc.

## Example Config

```ts
// mf_shell/module-federation.config.ts
module.exports = {
  name: 'mf_shell',
  remotes: {
    mf_cart: 'mf_cart@http://localhost:3001/remoteEntry.js',
    mf_products: 'mf_products@http://localhost:3002/remoteEntry.js',
    // ...other remotes
  },
  shared: [
    'react',
    'react-dom',
    'react-router-dom',
    '@reduxjs/toolkit',
    'redux-saga',
  ],
};
```

## Remotes

Each remote exposes its entry point and declares shared dependencies.

## Shared Libraries

- Ensures only one instance of React, Redux, etc. is loaded.
- Version conflicts are resolved via `shared` config.

## References

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Rsbuild Docs](https://rsbuild.dev/)
