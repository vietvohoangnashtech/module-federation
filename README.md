# Monorepo Demo - Project Guide

This README provides an overview of the project structure, available scripts, and port usage for the Nash monorepo demo.

## Project Structure

````
mf_cart/         # Cart microfrontend (Vite)
mf_checkout/     # Checkout microfrontend (Webpack)
mf_products/     # Products microfrontend (Rsbuild)
  - Shell (mf_shell, Rsbuild):
## Common Scripts

- **Install dependencies**
  ```bash
  pnpm install
````

- **Run all development servers concurrently**

  ```bash
  pnpm dev:all
  # Runs all apps in parallel
  ```

- **Run individual development servers**

  ```bash
  pnpm dev:shell      # mf_shell (port 3001)
  pnpm dev:cart       # mf_cart (port 3002)
  pnpm dev:checkout   # mf_checkout (port 3003)
  pnpm dev:products   # mf_products (port 3004)
  pnpm dev:user       # mf_user (port 3005)
  pnpm dev:shared     # mf_shared_lib (port 5000)
  ```

- **Build all apps**

  ```bash
  pnpm build:all
  # Builds all apps and shared lib
  ```

- **Build individual apps**

  ```bash
  pnpm build:shell
  pnpm build:cart
  pnpm build:checkout
  pnpm build:products
  pnpm build:user
  pnpm build:shared
  ```

- **Run tests**

  ```bash
  pnpm test:all       # Run tests for cart and checkout
  pnpm test:cart
  pnpm test:checkout
  ```

- **Lint**

  ```bash
  pnpm lint:all       # Lint cart and checkout
  pnpm lint:cart
  pnpm lint:checkout
  ```

- **Typecheck**
  ```bash
  pnpm typecheck:all  # Typecheck all apps and shared lib
  pnpm typecheck:cart
  pnpm typecheck:checkout
  pnpm typecheck:products
  pnpm typecheck:shell
  pnpm typecheck:user
  pnpm typecheck:shared
  ```
  ```bash
  pnpm dev:vite
  ```

## Port Usage

| App           | Tool      | Default Port |
| ------------- | --------- | ------------ |
| mf_shell      | Rsbuild   | 3001         |
| mf_cart       | Vite      | 3002         |
| mf_checkout   | Webpack   | 3003         |
| mf_products   | Rsbuild   | 3004         |
| mf_user       | Rsbuild   | 3005         |
| mf_shared_lib | Rsbuild   | 5000         |
| Storybook     | Storybook | 6006         |

Refer to your `package.json` files in each subdirectory for the full list of available scripts and configuration details.
