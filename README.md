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
    <!--
  - All subdirectories:
    ```bash
    pnpm test
    ```
    -->

Refer to your `package.json` for the full list of
