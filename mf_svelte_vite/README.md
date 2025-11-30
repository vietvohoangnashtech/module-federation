# Svelte Module Federation (Vite)

Svelte application configured with Module Federation using Vite.

## Features

- ✅ Svelte 4 with TypeScript
- ✅ Vite for lightning-fast HMR
- ✅ Module Federation with @module-federation/vite
- ✅ Shared dependencies (svelte)
- ✅ Production-ready build
- ✅ Minimal runtime overhead

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

- `./App` - Main Svelte application component

Default port: **5173**

## Integration with Host

```typescript
// In your host application's federation config
remotes: {
  svelteRemote: 'svelteRemote@http://localhost:5173/remoteEntry.js'
}

// In your host application (React)
import { lazy } from 'react';
const SvelteApp = lazy(() => import('svelteRemote/App'));

// In your host application (Vue)
import { defineAsyncComponent } from 'vue';
const SvelteApp = defineAsyncComponent(() => import('svelteRemote/App'));
```

## Scripts

- `pnpm dev` - Start development server (port 5173)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Svelte type checking

## Tech Stack

- **Framework**: Svelte 4
- **Build Tool**: Vite 7
- **Module Federation**: @module-federation/vite 1.6
- **Language**: TypeScript 5.7
