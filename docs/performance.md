# Performance & Optimization

## Bundling

- Rsbuild handles code splitting and tree shaking.
- Use `React.lazy` and `Suspense` for dynamic imports.

## Shared Libraries

- Only one instance of React, Redux, etc. is loaded.

## Caching

- Set cache headers for static assets.
- Use CDN for faster delivery.

## Monitoring

- Use Lighthouse and Chrome DevTools for audits.
- Profile bundle size and runtime performance.

## Best Practices

- Minimize initial bundle size.
- Lazy load non-critical modules.
- Clean up event listeners and memory leaks.
