# Development Guide

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
pnpm install
```

## Running Locally

Start the shell and all remotes in separate terminals:

```bash
cd mf_shell && pnpm dev
cd mf_cart && pnpm dev
cd mf_products && pnpm dev
# ...other modules
```

## Type Checking

```bash
pnpm typecheck
```

## Linting & Formatting

- Use ESLint and Prettier (add config if not present).

## Hot Reloading

- Supported via Rsbuild dev server.

## Adding a New Remote

1. Create a new module folder.
2. Add `module-federation.config.ts`.
3. Register the remote in the shell’s config.
