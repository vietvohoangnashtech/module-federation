# Module Federation CLI Guide

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

## Basic Usage

```bash
# Generate a new MFE
generate-mfe my-app --template react-webpack --mf-name myRemote --port 3201

# Interactive mode
generate-mfe
```

## Templates

### Available Templates

1. **react-webpack**
   - Webpack 5 based setup
   - TypeScript support
   - SCSS support
   - Jest testing

2. **react-vite**
   - Vite based setup
   - TypeScript support
   - CSS modules
   - Jest testing

3. **react-rsbuild**
   - RSBuild based setup
   - TypeScript support
   - Modern bundler
   - Performance optimized

4. **provider**
   - Host application setup
   - Remote orchestration
   - Routing configuration
   - Authentication setup

## Command Options

| Option | Description | Example | Default |
|--------|-------------|---------|---------|
| `--template` | Template to use | `react-webpack` | Required |
| `--mf-name` | Federation name | `myRemote` | Required |
| `--port` | Dev server port | `3201` | `3000` |
| `--install` | Install dependencies | `--install` | `false` |
| `--force` | Overwrite existing | `--force` | `false` |

## Common Issues

### 1. Template Not Found
```
Error: Template 'react-webpack' not found
```
**Solution**: 
- Run `pnpm prepare-publish` in mfe_cli directory
- Or run from within module-federation workspace

### 2. Global Installation Issues
```
Error: Command not found: generate-mfe
```
**Solution**:
```bash
cd mfe_cli
pnpm build
pnpm prepare-publish
pnpm unlink --global && pnpm link --global
```

### 3. Port Conflicts
```
Error: Port 3000 is already in use
```
**Solution**:
- Use `--port` to specify different port
- Check for running MFE instances

## Development Guide

### Adding New Templates

1. Create template package:
```bash
mkdir mf_react_newtech
```

2. Update template map:
```typescript
// mfe_cli/src/templates.ts
const TEMPLATE_SOURCE_MAP = {
  'react-newtech': 'mf_react_newtech',
  // existing templates...
};
```

3. Rebuild CLI:
```bash
pnpm build
pnpm prepare-publish
```

### Publishing

1. Update version in package.json

2. Build and prepare:
```bash
pnpm build
pnpm prepare-publish
```

3. Test locally:
```bash
pnpm link --global
generate-mfe test-app --template react-webpack
```

4. Publish:
```bash
npm login
npm publish
```