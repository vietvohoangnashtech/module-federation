# Module Federation Configuration

## Overview

This environment uses Webpack Module Federation (via Rsbuild) to enable independent development and deployment of multiple frontend modules. The `mf_shell` acts as the host, while `mf_cart`, `mf_products`, and `mf_user` are remotes. `mf_shared_lib` provides shared UI and logic.

## Host (`mf_shell`)

- Loads remotes at runtime using `module-federation.config.ts`
- Uses manifest-based discovery (`mf-manifest.json`) instead of `remoteEntry.js`
- Shares dependencies like React, Redux, etc.

## Example Config (Manifest Mode)

```ts
// mf_shell/module-federation.config.ts
module.exports = {
  name: 'mf_shell',
  remotes: {
    mf_cart: 'mf_cart@http://localhost:3001/mf-manifest.json',
    mf_products: 'mf_products@http://localhost:3002/mf-manifest.json',
    mf_user: 'mf_user@http://localhost:3003/mf-manifest.json',
  },
  manifest: true, // Enable manifest mode
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

Each remote exposes its entry point and declares shared dependencies. With manifest mode, each remote generates an `mf-manifest.json` file for module discovery.

Example for `mf_cart`:

```ts
// mf_cart/module-federation.config.ts
module.exports = {
  name: 'mf_cart',
  filename: 'mf-manifest.json', // Output manifest file
  manifest: true, // Enable manifest mode
  exposes: {
    './CartApp': './src/App',
  },
  shared: ['react', 'react-dom', '@reduxjs/toolkit'],
};
```

## Shared Libraries

- Ensures only one instance of React, Redux, etc. is loaded.
- Version conflicts are resolved via `shared` config.

## Why Use Manifest Mode?

- **Improved discoverability:** The manifest provides metadata and module mapping for dynamic loading.
- **Better integration:** Works well with modern build tools and deployment strategies.
- **Simpler updates:** No need to reference `remoteEntry.js` directly; the manifest handles module resolution.

## References

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Rsbuild Docs](https://rsbuild.dev/)
