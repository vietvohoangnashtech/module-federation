# Module Federation Monorepo

> Production-ready Module Federation templates with multi-build-tool support and scaffolding CLI.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nashtech-garage/module-federation.git
cd module-federation

# Install dependencies
pnpm install

# Build and set up the CLI
cd mfe_cli
pnpm build
pnpm prepare-publish  # Required for using CLI outside workspace
pnpm link --global

# Generate a new MFE (from any directory)
generate-mfe my-app --template react-webpack --mf-name myRemote --port 3201
```

## Features

- **Multiple Build Tools**: Support for Webpack, Vite, and RSBuild
- **TypeScript Support**: Full TypeScript configuration in all templates
- **Testing Setup**: Jest configuration included in templates
- **Shared Library**: Common components available through `mf_lib`
- **CLI Tool**: Powerful CLI for scaffolding new MFEs
- **Host Application**: Example provider app showing remote loading
```

## Project Structure

| Package | Description |
|---------|-------------|
| `mfe_cli` | CLI tool for generating new MFEs |
| `mf_lib` | Shared component library with reusable components |
| `mf_provider_app` | Host/shell application that loads remotes |
| `mf_react_rsbuild` | Example MFE using RSBuild |
| `mf_react_vite` | Example MFE using Vite |
| `mf_react_webpack` | Example MFE using Webpack 5 |

## Documentation

- [Module Federation CLI Guide](docs/how-to-use-mfe-cli.md)
- [Architecture Overview](docs/architecture.md)
- [Status and Roadmap](docs/status.md)
- [Building the CLI](docs/building-mfe-cli.md)
- [Development Guide](DEV_GUIDE.md)

## Features

- **Multiple Build Tools**: Support for Webpack, Vite, and RSBuild
- **TypeScript Support**: Full TypeScript configuration in all templates
- **Testing Setup**: Jest configuration included in templates
- **Shared Library**: Common components available through `mf_lib`
- **CLI Tool**: Powerful CLI for scaffolding new MFEs
- **Host Application**: Example provider app showing remote loading

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests (`pnpm test`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
