# mfe-cli (generate-mfe)

🚀 Scaffolding CLI for creating Module Federation micro frontends from production-ready boilerplate packages.

## Quick Start

```bash
# Inside module-federation workspace
cd mfe_cli
pnpm build
pnpm link --global

# Outside module-federation workspace
cd mfe_cli
pnpm prepare-publish  # Package templates for external use
pnpm link --global

# Generate a new MFE anywhere
generate-mfe my-app --template react-webpack --mf-name myRemote --port 3201

## Overview

Instead of manually copying and configuring files, this CLI uses your existing workspace packages (`mf_react_vite`, `mf_react_webpack`, `mf_react_rsbuild`, `mf_provider_app`) as **living templates**. When you generate a new MFE, it copies a real working package and customizes it for your use case.

## Installation & Build

```bash
# From monorepo root
pnpm install
pnpm -F mfe-cli build
```

## Usage

### Quick Generation

```bash
# Generate a Vite-based MFE with auto-install
pnpm exec generate-mfe my-analytics \
  --template react-vite \
  --mf-name analyticsRemote \
  --port 3200 \
  --install

# Generate a Webpack MFE
pnpm exec generate-mfe my-dashboard \
  --template react-webpack \
  --mf-name dashboardRemote \
  --port 3300
```

### Interactive Mode

```bash
pnpm exec generate-mfe
# Follow prompts to select template, name, port, etc.
```

### Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `<name>` | Package/folder name (positional) | `my-analytics` |
| `--template` | Boilerplate source | `react-vite`, `react-webpack`, `react-rsbuild`, `provider` |
| `--mf-name` | Module Federation container name | `--mf-name analyticsRemote` |
| `--port` | Dev server port | `--port 3200` |
| `--shared` | Shared dependencies (comma-separated) | `--shared react,react-dom` |
| `--install` | Auto-run `pnpm install` | `--install` |
| `--force` | Overwrite existing directory | `--force` |

## How It Works

1. **Template Mapping**: CLI maps template key to existing workspace package
   - `react-vite` → copies from `mf_react_vite`
   - `react-webpack` → copies from `mf_react_webpack`
   - `react-rsbuild` → copies from `mf_react_rsbuild`
   - `provider` → copies from `mf_provider_app`

2. **Smart Copy**: Excludes `node_modules`, `dist`, `coverage`, lock files

3. **Auto-Customization**: Updates:
   - `package.json` name & dev script port
   - `module-federation.config.*` container name
   - Build configs (vite/webpack/rsbuild) with port
   - `README.md` project name

4. **Workspace Registration**: Adds package to `pnpm-workspace.yaml`

5. **Optional Install**: Runs `pnpm install` in new package if `--install` flag

## Template Sources

Templates are **not stub files** - they're your actual working packages:

- **react-vite**: Full Vite setup with MF plugin, Jest, ESLint, TypeScript
- **react-webpack**: Production Webpack config with MF Enhanced, Sass, testing
- **react-rsbuild**: Rsbuild with MF plugin and React
- **provider**: Provider/host app with routing

## Development

### Watch Mode

```bash
pnpm -F mfe-cli dev
# Now changes auto-rebuild
```

### Local Testing

```bash
# After building
pnpm exec generate-mfe test-app --template react-vite --mf-name testRemote --port 3999 --install
cd test-app
pnpm dev
```

## Extending Templates

Want better defaults? Just improve the source packages:

```bash
# Example: Add Tailwind to mf_react_vite
cd mf_react_vite
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Configure tailwind...

# Now all future react-vite generations include Tailwind!
```

## Roadmap

- [ ] Angular template support
- [ ] Next.js template
- [ ] `--with-storybook` flag
- [ ] `--with-e2e` flag (Playwright/Cypress)
- [ ] Template versioning/tags
- [ ] Publish to npm for external use
- [ ] Post-generation hooks

## 🚀 Publishing to npm

1. Update version:
```bash
npm version patch
```

2. Build the CLI:
```bash
pnpm build
```

3. Publish:
```bash
npm publish
```

✅ Make sure `files` in `package.json` includes `dist/` and `templates/`

---

## 🧪 Testing before publish

```bash
npm pack
```

Unpack and inspect the `.tgz` file or test locally via:

```bash
npm install -g ./vietvohoang-mfe-cli-0.1.1.tgz
```

---

## 🧰 Scripts

| Command               | Description |
|-----------------------|-------------|
| `pnpm dev`            | Run ts-node locally with watch mode |
| `pnpm build`          | Compile TypeScript to `dist/` |
| `pnpm prepare-publish`| Build + sanitize package.json before publish |

## Using Outside the Workspace

To use the CLI in any directory:

```bash
# In mfe_cli directory
pnpm prepare-publish  # This packages templates for external use
pnpm link --global    # Makes CLI available globally

# Now use anywhere
cd /any/directory
generate-mfe my-app --template react-webpack --mf-name myRemote --port 3201
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" errors | Run `pnpm -F mfe-cli build` |
| Template not found | Inside workspace: No action needed<br>Outside workspace: Run `pnpm prepare-publish` in mfe_cli |
| Port already in use | Change `--port` or stop existing process |
| Installation failed | Run `pnpm install` manually in generated folder |
| Binary not found | Run `pnpm unlink --global && pnpm link --global` |

## Contributing

1. Keep source packages (`mf_react_*`) production-ready
2. Test CLI changes with real generation
3. Document new flags in this README
4. Update DEV_GUIDE.md for user-facing changes
