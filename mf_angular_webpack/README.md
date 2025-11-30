# Angular Module Federation (Webpack)

Angular application configured with Module Federation using Webpack.

## Features

- ✅ Angular 17+ with TypeScript
- ✅ Webpack Module Federation
- ✅ Shared dependencies (@angular/core, @angular/common, @angular/router)
- ✅ Development server with HMR
- ✅ Production-ready build

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Module Federation Configuration

This remote exposes:
- `./Component` - Main app component

Default port: **4200**

## Integration with Host

```typescript
// In your host application's webpack.config.js
remotes: {
  angularRemote: 'angularRemote@http://localhost:4200/remoteEntry.js'
}

// In your host application
import('angularRemote/Component').then(module => {
  // Use the Angular component
});
```

## Scripts

- `pnpm dev` - Start development server (port 4200)
- `pnpm build` - Build for production
- `pnpm test` - Run unit tests
- `pnpm lint` - Lint code

## Tech Stack

- **Framework**: Angular 17
- **Build Tool**: Webpack 5
- **Module Federation**: @angular-architects/module-federation
- **Language**: TypeScript 5.4
