# Vue Module Federation (Vite)

Vue 3 application configured with Module Federation using Vite.

## Features

- ✅ Vue 3 with Composition API
- ✅ TypeScript support
- ✅ Vite for lightning-fast HMR
- ✅ Module Federation with @module-federation/vite
- ✅ Shared dependencies (vue)
- ✅ Production-ready build

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Module Federation Configuration

This remote exposes:

- `./App` - Main Vue application component

Default port: **5173**

## Integration with Host

```typescript
// In your host application's federation config
remotes: {
  vueRemote: 'vueRemote@http://localhost:5173/remoteEntry.js'
}

// In your host application
import { defineAsyncComponent } from 'vue';
const VueApp = defineAsyncComponent(() => import('vueRemote/App'));

// Or with React host
import { lazy } from 'react';
const VueApp = lazy(() => import('vueRemote/App'));
```

## Scripts

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Lint and fix code

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite 7
- **Module Federation**: @module-federation/vite 1.6
- **Language**: TypeScript 5.7
