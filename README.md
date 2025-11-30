# Module Federation Monorepo

> Multi-framework Module Federation workspace with intelligent dependency optimization

## íº€ Quick Start

```bash
# Install dependencies
pnpm install

# Generate a new MFE (React, Angular, Vue, or Svelte)
pnpm mfe generate my-app --framework react --build-tool vite

# Optimize shared dependencies across workspace
pnpm mfe optimize

# Run development servers
pnpm dev:vite      # Vite MFE
pnpm dev:rsbuild   # Rsbuild MFE
pnpm dev:webpack   # Webpack MFE
```

## í³š Documentation

- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Complete developer reference
- **[OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)** - Dependency optimization guide
- **[MULTI_FRAMEWORK_IMPLEMENTATION.md](./MULTI_FRAMEWORK_IMPLEMENTATION.md)** - Multi-framework support
- **[docs/status.md](./docs/status.md)** - Project status and roadmap

## Project Structure

| Package | Description |
|---------|-------------|
| `mfe_cli` | CLI tool for generating new MFEs and optimizing dependencies |
| `mf_lib` | Shared component library with reusable components |
| `mf_provider_app` | Host/shell application that loads remotes |
| `mf_react_rsbuild` | Example MFE using RSBuild |
| `mf_react_vite` | Example MFE using Vite |
| `mf_react_webpack` | Example MFE using Webpack 5 |
| `mf_angular_webpack` | Example MFE using Angular + Webpack |
| `mf_vue_vite` | Example MFE using Vue + Vite |
| `mf_svelte_vite` | Example MFE using Svelte + Vite |

## Features

- **Multiple Frameworks**: React, Angular, Vue, and Svelte support
- **Multiple Build Tools**: Webpack, Vite, and RSBuild
- **TypeScript Support**: Full TypeScript configuration in all templates
- **Testing Setup**: Jest configuration included in templates
- **Shared Library**: Common components available through `mf_lib`
- **CLI Tool**: Powerful CLI for scaffolding new MFEs
- **Dependency Optimization**: Smart analysis and optimization of shared dependencies
- **Host Application**: Example provider app showing remote loading

## Common Commands

### Install Dependencies

```bash
pnpm install
```

### Run Development Servers

- **Rsbuild:**
  ```bash
  pnpm dev:rsbuild
  ```

- **Vite:**
  ```bash
  pnpm dev:vite
  ```

- **Webpack:**
  ```bash
  pnpm dev:webpack
  ```

### Build the Project

- **Library:**
  ```bash
  pnpm build:lib
  ```

- **Provider:**
  ```bash
  pnpm build:provider
  ```

- **Rsbuild:**
  ```bash
  pnpm build:rsbuild
  ```

- **Vite:**
  ```bash
  pnpm build:vite
  ```

- **Webpack:**
  ```bash
  pnpm build:webpack
  ```

### Run Tests

- **Webpack:**
  ```bash
  pnpm test:webpack
  ```

- **Vite:**
  ```bash
  pnpm test:vite
  ```

### Run Storybook

```bash
pnpm storybook
```

### Lint and Type Check

- **Lint Vite app:**
  ```bash
  pnpm lint:vite
  ```

- **Type check Vite app:**
  ```bash
  pnpm typecheck:vite
  ```

## Generate New MFE

### Using Multi-Framework Mode

```bash
pnpm mfe generate my-app \
  --framework react \
  --build-tool vite \
  --mf-name myRemote \
  --port 3200
```

Supported combinations:
- `react` + `vite | webpack | rsbuild`
- `angular` + `webpack`
- `vue` + `vite | webpack`
- `svelte` + `vite`

### Using Legacy Template Mode

```bash
pnpm mfe generate my-app \
  --template react-vite \
  --mf-name myRemote \
  --port 3200
```

## Optimize Dependencies

Analyze and optimize shared dependencies across the workspace:

```bash
# Analyze and show recommendations
pnpm mfe optimize

# Analyze and auto-apply optimizations
pnpm mfe optimize --apply

# Preview what would be changed
pnpm mfe optimize --dry-run
```

See [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) for detailed usage.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests (`pnpm test`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
