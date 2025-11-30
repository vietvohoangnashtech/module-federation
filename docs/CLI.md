# Module Federation CLI Guide

The mfe-cli is a comprehensive toolset for managing Module Federation applications across multiple frameworks and build tools. It provides features for code generation, dependency optimization, zero-config setup, and dynamic remote discovery.

## Installation

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/nashtech-garage/module-federation.git
cd module-federation

# Install dependencies
pnpm install

# Build and prepare CLI
cd mfe_cli
pnpm build
pnpm prepare-publish  # Required for global usage
pnpm link --global
```

### Global Installation from npm

```bash
npm install -g @vietvohoang/mfe-cli
# or
pnpm add -g @vietvohoang/mfe-cli
```

---

## Feature Overview

### Feature 1: Multi-Framework Code Generation

Generate new MFE packages with support for 4 frameworks and 3 build tools.

```bash
# Interactive mode
mfe generate my-app

# With options
mfe generate my-app \
  --framework react \
  --build-tool vite \
  --mf-name myRemote \
  --port 3200 \
  --install
```

**Supported Combinations:**
- React + Vite, Webpack, Rsbuild
- Angular + Webpack
- Vue + Vite
- Svelte + Vite

See: [MULTI_FRAMEWORK_IMPLEMENTATION.md](../MULTI_FRAMEWORK_IMPLEMENTATION.md)

---

### Feature 2: Smart Dependency Optimization

Analyze and optimize shared dependencies in your Module Federation workspace.

```bash
# Analyze dependencies and show recommendations
mfe optimize

# Auto-apply optimizations
mfe optimize --apply

# Preview without applying
mfe optimize --dry-run
```

**Capabilities:**
- Automatic workspace scanning
- Dependency version conflict detection
- Bundle size estimation
- Shared library optimization recommendations
- Smart export analysis

See: [OPTIMIZATION_GUIDE.md](../OPTIMIZATION_GUIDE.md)

---

### Feature 3: Zero-Config Federation

Automatically discover and configure Module Federation without manual setup.

```bash
# Discover all remotes in workspace
mfe discover

# Save discovery results
mfe discover --save

# Initialize zero-config for current package
mfe init

# Create host with auto-discovered remotes
mfe init --host
```

**Capabilities:**
- Auto-detect all MFE packages
- Framework detection
- Build tool detection
- Automatic config generation
- Host orchestration

See: [ZERO_CONFIG_GUIDE.md](../ZERO_CONFIG_GUIDE.md)

---

### Feature 4: Dynamic Remote Discovery

Manage remote modules at runtime with automatic registration and discovery.

```bash
# Start registry service (default port 3999)
mfe registry start

# Register current package as remote
mfe registry register

# List all registered remotes
mfe registry list

# Check registry health and status
mfe registry status
```

**Capabilities:**
- HTTP-based registry service
- Runtime remote registration
- Version management
- Health monitoring
- Automatic plugin integration

See: [DYNAMIC_DISCOVERY_GUIDE.md](../DYNAMIC_DISCOVERY_GUIDE.md)

---

## Commands Reference

### `mfe generate <name>`

Generate a new Module Federation application.

**Options:**
```
--framework <name>    Framework: react|angular|vue|svelte
--build-tool <name>   Build tool: vite|webpack|rsbuild
--template <name>     Template key (legacy, use framework + build-tool)
--mf-name <name>      Module Federation container name (default: auto)
--port <number>       Dev server port (default: auto-detect)
--shared <libs>       Comma-separated shared dependencies
--install             Auto-install dependencies
--force               Overwrite existing directory
```

**Examples:**
```bash
mfe generate my-app --framework react --build-tool vite
mfe generate dashboard --framework angular --build-tool webpack --port 3201
mfe generate components --framework vue --build-tool vite --install
```

---

### `mfe optimize`

Analyze and optimize shared dependencies.

**Options:**
```
--apply               Automatically apply optimizations
--dry-run             Preview changes without applying
```

**Examples:**
```bash
# Analyze current workspace
mfe optimize

# Apply recommended changes
mfe optimize --apply

# Preview what would change
mfe optimize --dry-run
```

---

### `mfe discover`

Discover all Module Federation remotes in the workspace.

**Options:**
```
--save                Save discovery results to .mfe-registry.json
--print               Print results (default: true)
```

**Examples:**
```bash
# List all discovered remotes
mfe discover

# Save to registry file
mfe discover --save

# Use in scripts
mfe discover --print=false
```

---

### `mfe init`

Initialize zero-config Module Federation setup.

**Options:**
```
--path <dir>          Package path (default: current directory)
--host                Configure as host with auto-discovered remotes
```

**Examples:**
```bash
# Initialize current package
mfe init

# Initialize as host
mfe init --host

# Initialize specific package
mfe init --path ../other-package
```

---

### `mfe registry`

Manage the Module Federation registry service.

**Subcommands:**

#### `mfe registry start`
Start the registry HTTP service.
```bash
mfe registry start
# Service runs on http://localhost:3999
```

#### `mfe registry register`
Register current package as a remote.
```bash
mfe registry register
```

#### `mfe registry list`
List all registered remotes.
```bash
mfe registry list
```

#### `mfe registry status`
Check registry service health.
```bash
mfe registry status
```

---

## Templates

### Available Templates

| Template | Framework | Build Tool | Module Fed | Features |
|----------|-----------|------------|-----------|----------|
| react-vite | React | Vite | ✅ | Fast HMR, CSS modules |
| react-webpack | React | Webpack 5 | ✅ | Module Fed native |
| react-rsbuild | React | Rsbuild | ✅ | Performance optimized |
| angular-webpack | Angular | Webpack | ✅ | Ivy, AOT ready |
| vue-vite | Vue | Vite | ✅ | SFC, fast dev |
| svelte-vite | Svelte | Vite | ✅ | Compiler, minimal |
| provider | React/Vue | Vite/Webpack | ✅ | Host app orchestration |

Each template includes:
- Pre-configured Module Federation setup
- Framework-specific best practices
- TypeScript configuration
- Jest testing setup
- Development server configuration
- Build optimization settings
- ESM/CommonJS compatibility

---

## Troubleshooting

### 1. Template Not Found

**Error:**
```
Error: Template 'react-webpack' not found
```

**Solution:**
- Ensure CLI is built: `pnpm build` in mfe_cli directory
- Verify template exists in workspace
- Run `pnpm prepare-publish` to package templates

---

### 2. Command Not Found

**Error:**
```
Error: Command not found: mfe
```

**Solution:**
```bash
cd mfe_cli
pnpm build
pnpm prepare-publish
pnpm link --global  # For local dev
# OR
npm install -g @vietvohoang/mfe-cli  # For published version
```

---

### 3. Port Conflicts

**Error:**
```
Error: Port 3000 is already in use
```

**Solution:**
- Specify different port: `mfe generate app --port 3201`
- Kill existing process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
- Check running MFE instances

---

### 4. Registry Service Won't Start

**Error:**
```
Error: Cannot start registry on port 3999
```

**Solution:**
- Check if port is in use: `lsof -i :3999`
- Use environment variable: `MFE_REGISTRY_PORT=4000 mfe registry start`
- Increase port range or stop conflicting service

---

### 5. Discovery Returns Empty

**Error:**
```
No remotes discovered in workspace
```

**Solution:**
- Verify workspace has MFE packages
- Check package.json contains module-federation config
- Run from workspace root: `mfe discover --save`
- Review `ZERO_CONFIG_GUIDE.md` for detection criteria

---

## Development

### Adding New Templates

1. Create new framework package:
```bash
mkdir mf_react_newframework
cd mf_react_newframework
npm init -y
```

2. Update template registry in `mfe_cli/src/templates.ts`:
```typescript
const TEMPLATE_SOURCE_MAP = {
  'react-newframework': 'mf_react_newframework',
  // ... existing templates
};
```

3. Rebuild and test:
```bash
cd ../mfe_cli
pnpm build
pnpm link --global
mfe generate test --framework react --build-tool newframework
```

---

### Publishing to npm

1. Update version in `mfe_cli/package.json`

2. Build and prepare:
```bash
cd mfe_cli
pnpm build
pnpm prepare-publish
```

3. Test locally:
```bash
pnpm link --global
mfe generate test-app --framework react --build-tool vite
```

4. Publish:
```bash
npm login
npm publish
```

---

## Resources

- [Module Federation Documentation](https://module-federation.io)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation)
- [Rspack Module Federation](https://rspack.dev/guide/module-federation)
- [Vite Federation Plugin](https://github.com/originjs/vite-plugin-federation)

See also:
- `MULTI_FRAMEWORK_IMPLEMENTATION.md` - Feature 1 details
- `OPTIMIZATION_GUIDE.md` - Feature 2 details
- `ZERO_CONFIG_GUIDE.md` - Feature 3 details
- `DYNAMIC_DISCOVERY_GUIDE.md` - Feature 4 details
