# mfe-cli

A comprehensive CLI tool for Module Federation workspace management. Generate, optimize, discover, and manage micro-frontend applications using **React**, **Angular**, **Vue**, or **Svelte** with **Vite**, **Webpack**, or **Rsbuild**.

**Features:**
- ‚ú® **Feature 1** - Multi-framework code generation (4 frameworks √ó 3 build tools)
- ‚ú® **Feature 2** - Smart dependency optimization with automatic analysis
- ‚ú® **Feature 3** - Zero-config federation with automatic discovery
- ‚ú® **Feature 4** - Dynamic remote discovery with runtime registration

---

## Ì∫Ä Quick Start

### Generate a New MFE (Feature 1)

```bash
# Interactive mode
npx @vietvohoang/mfe-cli generate my-app

# With specific framework + build tool
npx @vietvohoang/mfe-cli generate my-app \
  --framework react \
  --build-tool vite \
  --mf-name myRemote \
  --port 3200
```

### Optimize Dependencies (Feature 2)

```bash
# Analyze and show recommendations
pnpm mfe optimize

# Auto-apply optimizations
pnpm mfe optimize --apply
```

### Zero-Config Setup (Feature 3)

```bash
# Discover all remotes in workspace
pnpm mfe discover --save

# Initialize zero-config for current package
pnpm mfe init

# Create host with all discovered remotes
pnpm mfe init --host
```

### Dynamic Remote Discovery (Feature 4)

```bash
# Start registry service
pnpm mfe registry start

# Register current remote
pnpm mfe registry register

# List all registered remotes
pnpm mfe registry list

# Check registry status
pnpm mfe registry status
```

---

## Ì≥¶ Install Globally

```bash
npm install -g @vietvohoang/mfe-cli
# or
pnpm add -g @vietvohoang/mfe-cli
```

Then use any command:

```bash
mfe generate my-app --framework react --build-tool vite
mfe optimize --apply
mfe discover --save
mfe registry start
```

---

## Ì∑∞ Supported Frameworks & Build Tools

| Framework | Vite | Webpack | Rsbuild |
|-----------|------|---------|---------|
| React     | ‚úÖ   | ‚úÖ      | ‚úÖ      |
| Angular   | -    | ‚úÖ      | -       |
| Vue       | ‚úÖ   | ‚úÖ      | -       |
| Svelte    | ‚úÖ   | -       | -       |

### All Available Templates

- `react-vite` - React + Vite
- `react-webpack` - React + Webpack
- `react-rsbuild` - React + Rsbuild
- `angular-webpack` - Angular + Webpack
- `vue-vite` - Vue + Vite
- `svelte-vite` - Svelte + Vite
- `provider` - Provider/Host app

---

## ‚öôÔ∏è CLI Commands

### `mfe generate <name>`

Generate a new MFE package.

**Options:**
- `--framework` - Framework: react|angular|vue|svelte
- `--build-tool` - Build tool: vite|webpack|rsbuild
- `--template` - Legacy template key (for backwards compatibility)
- `--mf-name` - Module Federation container name
- `--port` - Dev server port (default: auto-detected)
- `--shared` - Comma-separated shared libs
- `--install` - Auto-install dependencies
- `--force` - Overwrite existing directory

### `mfe optimize`

Analyze and optimize shared dependencies.

**Options:**
- `--apply` - Automatically apply optimizations
- `--dry-run` - Preview changes without applying

### `mfe discover`

Discover all Module Federation remotes in workspace.

**Options:**
- `--save` - Save registry to .mfe-registry.json
- `--print` - Print to console (default: true)

### `mfe init`

Initialize zero-config Module Federation setup.

**Options:**
- `--path` - Package path (default: current directory)
- `--host` - Configure as host with auto-discovered remotes

### `mfe registry`

Manage the Module Federation registry service.

**Subcommands:**
- `start` - Start registry service (port 3999)
- `register` - Register current package
- `list` - List all registered remotes
- `status` - Check registry health

---

## Ì≥Å Project Structure

Each generated app includes:

- Configured `module-federation.config.*`
- Async-ready `src/bootstrap.*` entry point
- Framework-specific components and examples
- Shared dependencies pre-configured
- Build tool optimized for fast development
- TypeScript and Jest setup included

---

## Ì≥ö Documentation

For detailed guides, see the root directory documentation:

- **[MULTI_FRAMEWORK_IMPLEMENTATION.md](../MULTI_FRAMEWORK_IMPLEMENTATION.md)** - Feature 1: Multi-framework support
- **[OPTIMIZATION_GUIDE.md](../OPTIMIZATION_GUIDE.md)** - Feature 2: Dependency optimization
- **[ZERO_CONFIG_GUIDE.md](../ZERO_CONFIG_GUIDE.md)** - Feature 3: Zero-config federation
- **[DYNAMIC_DISCOVERY_GUIDE.md](../DYNAMIC_DISCOVERY_GUIDE.md)** - Feature 4: Dynamic discovery
- **[DEV_GUIDE.md](../DEV_GUIDE.md)** - Contributing and development

---

## Ì≥ò Resources

Learn more about Module Federation:
- https://module-federation.io
- https://webpack.js.org/concepts/module-federation
- https://rspack.dev/guide/module-federation

---

## Ì±®‚ÄçÌ≤ª Contributing

Check out `DEV_GUIDE.md` for development setup and contribution guidelines.

---

## Ì≥ù License

MIT ¬© 2025 [Viet Vo Hoang](https://github.com/vietvohoang)
