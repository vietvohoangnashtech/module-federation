# Rsbuild Project

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get Started

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

# mf_shell

The `mf_shell` is the host application in a micro-frontend architecture using Module Federation. It orchestrates and composes remote modules such as `mf_cart`, `mf_products`, and `mf_user` at runtime.

## Features

- Micro-frontend architecture with Module Federation
- React 18, TypeScript, Rsbuild
- Dynamic remote loading and shared dependencies
- Modern testing and development tooling

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `pnpm dev` – Start development server
- `pnpm build` – Build for production
- `pnpm preview` – Preview production build
- `pnpm test` – Run tests
- `pnpm typecheck` – TypeScript type checking

## Project Structure

- `src/` – Source code
- `public/` – Static assets
- `@mf-types/` – Shared TypeScript types
- `components/` – React components
- `redux/` – State management

## Related Modules

- `mf_cart`
- `mf_products`
- `mf_shared_lib`
- `mf_user`
