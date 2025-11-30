# Module Federation Monorepo

> Multi-framework Module Federation workspace with intelligent dependency optimization and zero-config setup

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Generate a new MFE (React, Angular, Vue, or Svelte)
pnpm mfe generate my-app --framework react --build-tool vite

# Zero-config initialization
pnpm mfe init                    # Auto-detect and generate config
pnpm mfe init --host             # Generate host with all remotes

# Discover all remotes in workspace
pnpm mfe discover --save         # Scan and save registry

# Optimize shared dependencies
pnpm mfe optimize --apply        # Analyze and optimize

# Dynamic remote discovery (NEW!)
pnpm mfe registry start          # Start registry service
pnpm mfe registry register       # Register current remote
pnpm mfe registry list           # List all registered remotes
pnpm mfe registry status         # Check registry health

# Run development servers
pnpm dev:vite      # Vite MFE
pnpm dev:rsbuild   # Rsbuild MFE
pnpm dev:webpack   # Webpack MFE
```

## ✨ Features

### 🔌 Dynamic Remote Discovery (NEW!)
- **Runtime discovery**: Load remotes dynamically without build-time config
- **Registry service**: Central registry with REST API
- **Auto-registration**: Remotes self-register on startup
- **Health monitoring**: Track remote availability in real-time
- **Version management**: Support multiple versions and canary deployments
- **Module caching**: 3-level cache for optimal performance

### 🎯 Zero-Config Federation
- Automatic remote discovery across workspace
- Intelligent config generation (framework, build tool, exposes, shared)
- Remote registry management
- One command setup: `mfe init`

### 🔧 Multi-Framework Support
- React, Angular, Vue, Svelte templates
- Vite, Webpack, Rsbuild build tools
- Framework-specific optimizations

### 📊 Smart Optimization
- Automatic dependency analysis
- Version conflict detection
- Bundle size savings calculator
- Auto-apply optimizations

## 📚 Documentation

- **[DYNAMIC_DISCOVERY_GUIDE.md](./DYNAMIC_DISCOVERY_GUIDE.md)** - Runtime remote discovery (NEW!)
- **[ZERO_CONFIG_GUIDE.md](./ZERO_CONFIG_GUIDE.md)** - Zero-config federation guide
- **[OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)** - Dependency optimization
- **[MULTI_FRAMEWORK_IMPLEMENTATION.md](./MULTI_FRAMEWORK_IMPLEMENTATION.md)** - Multi-framework support
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Complete developer reference
- **[docs/status.md](./docs/status.md)** - Project status and roadmap

---

# Instructions for package.json Scripts

This file provides a brief guide on how to use the scripts defined in your `package.json` file.

## Common Commands

- **Install dependencies**
  ```bash
  pnpm install
  ```
- **Run development servers**
  - Rsbuild:
    ```bash
    pnpm dev:rsbuild
    ```
  - Vite:
    ```bash
    pnpm dev:vite
    ```
  - Webpack:
    ```bash
    pnpm dev:webpack
    ```
- **Run storybook**
  ```bash
  pnpm storybook
  ```
- **Build the project**
  - Library:
    ```bash
    pnpm build:lib
    ```
  - Provider:
    ```bash
    pnpm build:provider
    ```
  - Rsbuild:
    ```bash
    pnpm build:rsbuild
    ```
  - Vite:
    ```bash
    pnpm build:vite
    ```
  - Webpack:
    ```bash
    pnpm build:webpack
    ```
- **Run tests**
  - Webpack:
    ```bash
    pnpm test:webpack
    ```
  - Vite:
    ```bash
    pnpm test:vite
    ```
    <!--
  - All subdirectories:
    ```bash
    pnpm test
    ```
    -->

## Lint and Typecheck (Vite)

- **Lint Vite app**
  ```bash
  pnpm lint:vite
  ```
- **Typecheck Vite app**
  ```bash
  pnpm typecheck:vite
  ```

Refer to your `package.json` for the full list of
