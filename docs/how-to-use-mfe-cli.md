# Module Federation CLI Guide

## Installation & Setup

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/nashtech-garage/module-federation.git
cd module-federation

# Install dependencies
pnpm install

# Build and link the CLI
cd mfe_cli
pnpm build
pnpm link --global
```

### Common Installation Issues

1. **Template Not Found Error**
   ```
   ❌ Generation failed: Template 'react-webpack' not found
   ```
   **Solution**: 
   - When running outside the module-federation workspace, run `pnpm prepare-publish` first
   - Or run the CLI from within the module-federation workspace

2. **Global Link Issues**
   ```
   WARN mfe-cli has no binaries
   ```
   **Solution**: 
   - Check package.json has correct "bin" configuration
   - Rebuild the CLI with `pnpm build`
   - Try unlinking and relinking: `pnpm unlink --global && pnpm link --global`

## Using the CLI

### Basic Usage

```bash
# Basic command structure
generate-mfe <name> --template <template> --mf-name <name> --port <port>

# Examples
# Create a Webpack-based MFE
generate-mfe my-remote --template react-webpack --mf-name myRemote --port 3201

# Create a Vite-based MFE
generate-mfe analytics --template react-vite --mf-name analyticsApp --port 3202

# Create a RSBuild-based MFE
generate-mfe dashboard --template react-rsbuild --mf-name dashboardApp --port 3203

# Create a provider (host) application
generate-mfe shell --template provider --mf-name shellApp --port 3200
```

### Command Options

- `<name>`: The name of your new MFE package/directory
- `--template`: Template to use (`react-webpack`, `react-vite`, `react-rsbuild`, `provider`)
- `--mf-name`: Module Federation name (used in the federation config)
- `--port`: Development server port (default: 3000)
- `--shared`: Comma-separated list of shared dependencies (default: "react,react-dom")
- `--install`: Run pnpm install after generation (optional)
- `--force`: Overwrite existing directory (optional)
- `--git-init`: Initialize git repository (optional)

### Usage Environments

1. **Within Module Federation Workspace**
   - Templates are used directly from workspace packages
   - Immediate access to template updates
   - No preparation needed

2. **Outside Module Federation Workspace**
   - Requires packaged templates
   - Run `pnpm prepare-publish` in mfe_cli before using
   - Perfect for creating new projects anywhere

## Development Guide

### Adding New Templates

1. Create your template package in the workspace (e.g., `mf_angular_webpack`)
2. Update template mappings in two files:

```typescript
// src/templates.ts
const TEMPLATE_SOURCE_MAP: Record<string, string> = {
  'react-vite': 'mf_react_vite',
  'react-webpack': 'mf_react_webpack',
  'react-rsbuild': 'mf_react_rsbuild',
  'provider': 'mf_provider_app',
  'angular-webpack': 'mf_angular_webpack' // Add your new template
};
```

```typescript
// src/prepare-publish.ts
const TEMPLATES = {
  'react-vite': '../../mf_react_vite',
  'react-webpack': '../../mf_react_webpack',
  'react-rsbuild': '../../mf_react_rsbuild',
  'provider': '../../mf_provider_app',
  'angular-webpack': '../../mf_angular_webpack' // Add your new template
};
```

### Publishing to npm

1. Update version in package.json
2. Prepare the package:
   ```bash
   cd mfe_cli
   pnpm prepare-publish
   ```
3. Test the package locally:
   ```bash
   pnpm link --global
   cd /some/other/directory
   generate-mfe test-app --template react-webpack
   ```
4. Publish to npm:
   ```bash
   npm login
   npm publish
   ```

## Troubleshooting

### Template Resolution Issues

The CLI looks for templates in this order:
1. Workspace packages (`mf_*` directories)
2. Packaged templates in CLI package
3. Various fallback locations

If templates aren't found:
```bash
cd mfe_cli
pnpm prepare-publish
pnpm unlink --global && pnpm link --global
```

### Common Errors

1. **Binary Not Found**
   - Ensure package.json has correct "bin" configuration
   - Rebuild and relink the CLI

2. **Template Not Found**
   - Check if you're in the module-federation workspace
   - Run prepare-publish if outside the workspace

3. **Port Already in Use**
   - Use `--port` to specify a different port
   - Check for running MFE instances

## Best Practices

1. **Template Development**
   - Keep templates minimal and focused
   - Include clear README.md
   - Document any special configuration

2. **CLI Usage**
   - Use semantic MF names
   - Follow port allocation strategy
   - Document shared dependencies

3. **Maintenance**
   - Test templates regularly
   - Keep dependencies updated
   - Document breaking changes
