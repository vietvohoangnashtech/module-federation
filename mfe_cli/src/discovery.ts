import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { glob } from 'glob';
import yaml from 'yaml';

/**
 * Information about a Module Federation remote
 */
export interface RemoteInfo {
  name: string;
  path: string;
  url?: string;
  port?: number;
  framework: 'react' | 'angular' | 'vue' | 'svelte' | 'unknown';
  buildTool: 'vite' | 'webpack' | 'rsbuild' | 'unknown';
  exposes: Record<string, string>;
  shared?: string[];
  version?: string;
}

/**
 * Registry of all remotes in the workspace
 */
export interface RemoteRegistry {
  remotes: RemoteInfo[];
  lastUpdated: Date;
  workspaceRoot: string;
}

/**
 * Configuration for remote discovery
 */
export interface DiscoveryOptions {
  workspaceRoot?: string;
  includeDevUrls?: boolean;
  excludePatterns?: string[];
}

/**
 * Discover all Module Federation remotes in the workspace
 */
export async function discoverRemotes(
  options: DiscoveryOptions = {}
): Promise<RemoteRegistry> {
  const {
    workspaceRoot = process.cwd(),
    includeDevUrls = true,
    excludePatterns = ['**/node_modules/**', '**/dist/**']
  } = options;

  console.log(chalk.cyan('\n🔍 Discovering Module Federation remotes...\n'));

  // Find all packages in workspace
  const packages = await findWorkspacePackages(workspaceRoot);
  console.log(chalk.gray(`  ✓ Found ${packages.length} packages in workspace`));

  // Extract federation info from each package
  const remotes: RemoteInfo[] = [];
  for (const pkgPath of packages) {
    const remoteInfo = await extractFederationInfo(pkgPath, includeDevUrls);
    if (remoteInfo) {
      remotes.push(remoteInfo);
    }
  }

  console.log(chalk.green(`  ✓ Discovered ${remotes.length} Module Federation remotes\n`));

  return {
    remotes,
    lastUpdated: new Date(),
    workspaceRoot
  };
}

/**
 * Find all packages in the workspace
 */
async function findWorkspacePackages(workspaceRoot: string): Promise<string[]> {
  const workspaceYaml = path.join(workspaceRoot, 'pnpm-workspace.yaml');
  
  if (!await fs.pathExists(workspaceYaml)) {
    // Fallback: look for packages directory
    const packagesDir = path.join(workspaceRoot, 'packages');
    if (await fs.pathExists(packagesDir)) {
      const dirs = await fs.readdir(packagesDir);
      return dirs.map(dir => path.join(packagesDir, dir));
    }
    return [];
  }

  // Read workspace patterns
  const content = await fs.readFile(workspaceYaml, 'utf8');
  const parsed = yaml.parse(content);
  const patterns = parsed.packages || [];

  // Find all matching directories
  const packageDirs: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: workspaceRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**']
    });
    packageDirs.push(...matches);
  }

  return packageDirs;
}

/**
 * Extract Module Federation info from a package
 */
export async function extractFederationInfo(
  packagePath: string,
  includeDevUrls: boolean = true
): Promise<RemoteInfo | null> {
  // Check for package.json
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!await fs.pathExists(pkgJsonPath)) {
    return null;
  }

  const pkgJson = await fs.readJson(pkgJsonPath);
  const packageName = pkgJson.name || path.basename(packagePath);

  // Look for module-federation.config files
  const configPaths = [
    path.join(packagePath, 'module-federation.config.ts'),
    path.join(packagePath, 'module-federation.config.js'),
    path.join(packagePath, 'module-federation.config.cjs'),
    path.join(packagePath, 'module-federation.config.mjs'),
  ];

  let configPath: string | null = null;
  for (const p of configPaths) {
    if (await fs.pathExists(p)) {
      configPath = p;
      break;
    }
  }

  if (!configPath) {
    return null; // Not a federation package
  }

  // Parse the config file
  const configContent = await fs.readFile(configPath, 'utf8');
  
  // Extract name
  const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
  const federationName = nameMatch ? nameMatch[1] : packageName;

  // Extract exposes
  const exposes: Record<string, string> = {};
  const exposesMatch = configContent.match(/exposes:\s*\{([^}]+)\}/s);
  if (exposesMatch) {
    const exposesStr = exposesMatch[1];
    const entries = exposesStr.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g);
    for (const match of entries) {
      exposes[match[1]] = match[2];
    }
  }

  // Skip if no exposes (might be a host-only)
  if (Object.keys(exposes).length === 0) {
    return null;
  }

  // Detect framework
  const framework = detectFramework(pkgJson);

  // Detect build tool
  const buildTool = detectBuildTool(packagePath, pkgJson);

  // Extract port
  let port: number | undefined;
  const portMatch = configContent.match(/port:\s*(\d+)/);
  if (portMatch) {
    port = parseInt(portMatch[1], 10);
  }

  // Generate dev URL if needed
  let url: string | undefined;
  if (includeDevUrls && port) {
    url = `http://localhost:${port}`;
  }

  return {
    name: federationName,
    path: packagePath,
    url,
    port,
    framework,
    buildTool,
    exposes,
    version: pkgJson.version,
  };
}

/**
 * Detect framework from package.json
 */
function detectFramework(pkgJson: any): RemoteInfo['framework'] {
  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  
  if (deps['react']) return 'react';
  if (deps['@angular/core']) return 'angular';
  if (deps['vue']) return 'vue';
  if (deps['svelte']) return 'svelte';
  
  return 'unknown';
}

/**
 * Detect build tool from package files and package.json
 */
function detectBuildTool(
  packagePath: string,
  pkgJson: any
): RemoteInfo['buildTool'] {
  // Check for config files
  if (fs.existsSync(path.join(packagePath, 'vite.config.ts')) ||
      fs.existsSync(path.join(packagePath, 'vite.config.js'))) {
    return 'vite';
  }
  
  if (fs.existsSync(path.join(packagePath, 'rsbuild.config.ts')) ||
      fs.existsSync(path.join(packagePath, 'rsbuild.config.js'))) {
    return 'rsbuild';
  }
  
  if (fs.existsSync(path.join(packagePath, 'webpack.config.js')) ||
      fs.existsSync(path.join(packagePath, 'webpack.config.ts')) ||
      fs.existsSync(path.join(packagePath, 'webpack.config.cjs'))) {
    return 'webpack';
  }

  // Check dependencies as fallback
  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  if (deps['vite']) return 'vite';
  if (deps['@rsbuild/core']) return 'rsbuild';
  if (deps['webpack']) return 'webpack';

  return 'unknown';
}

/**
 * Generate remotes configuration for a host application
 */
export function generateRemotesConfig(
  registry: RemoteRegistry,
  options: {
    format?: 'object' | 'array';
    excludeSelf?: string;
    environment?: 'development' | 'production';
  } = {}
): any {
  const {
    format = 'object',
    excludeSelf,
    environment = 'development'
  } = options;

  const remotes = registry.remotes
    .filter(r => r.name !== excludeSelf);

  if (format === 'array') {
    return remotes.map(r => {
      const url = environment === 'development' && r.url
        ? r.url
        : r.url || `https://${r.name}.example.com`;
      
      return {
        name: r.name,
        entry: `${url}/remoteEntry.js`,
      };
    });
  }

  // Object format (default)
  const config: Record<string, string> = {};
  for (const remote of remotes) {
    const url = environment === 'development' && remote.url
      ? remote.url
      : remote.url || `https://${remote.name}.example.com`;
    
    config[remote.name] = `${remote.name}@${url}/remoteEntry.js`;
  }

  return config;
}

/**
 * Generate a complete module federation config from discovered info
 */
export async function generateZeroConfig(
  packagePath: string,
  options: {
    registry?: RemoteRegistry;
    isHost?: boolean;
  } = {}
): Promise<string> {
  const { registry, isHost = false } = options;

  // Extract basic info
  const pkgJsonPath = path.join(packagePath, 'package.json');
  const pkgJson = await fs.readJson(pkgJsonPath);
  const packageName = pkgJson.name || path.basename(packagePath);
  
  // Detect framework and build tool
  const framework = detectFramework(pkgJson);
  const buildTool = detectBuildTool(packagePath, pkgJson);

  // Auto-detect exposes
  const exposes = await autoDetectExposes(packagePath, framework);

  // Auto-detect shared dependencies
  const shared = autoDetectShared(pkgJson, framework);

  // Generate config based on build tool
  const federationName = packageName.replace(/^mf_/, '').replace(/_/g, '-');
  
  let config = '';

  if (buildTool === 'vite') {
    config = generateViteConfig(federationName, exposes, shared, registry, isHost);
  } else if (buildTool === 'webpack') {
    config = generateWebpackConfig(federationName, exposes, shared, registry, isHost);
  } else if (buildTool === 'rsbuild') {
    config = generateRsbuildConfig(federationName, exposes, shared, registry, isHost);
  }

  return config;
}

/**
 * Auto-detect exposed modules
 */
async function autoDetectExposes(
  packagePath: string,
  framework: string
): Promise<Record<string, string>> {
  const exposes: Record<string, string> = {};
  const srcDir = path.join(packagePath, 'src');

  if (!await fs.pathExists(srcDir)) {
    return exposes;
  }

  // Look for common entry points
  const commonEntries = [
    { key: './App', files: ['App.tsx', 'App.ts', 'App.jsx', 'App.js', 'App.vue', 'App.svelte'] },
    { key: './Component', files: ['Component.tsx', 'Component.ts', 'Component.jsx', 'Component.js'] },
    { key: './index', files: ['index.tsx', 'index.ts', 'index.jsx', 'index.js'] },
  ];

  for (const entry of commonEntries) {
    for (const file of entry.files) {
      const filePath = path.join(srcDir, file);
      if (await fs.pathExists(filePath)) {
        exposes[entry.key] = `./src/${file}`;
        break;
      }
    }
  }

  // Look for components directory
  const componentsDir = path.join(srcDir, 'components');
  if (await fs.pathExists(componentsDir)) {
    const files = await fs.readdir(componentsDir);
    for (const file of files) {
      const stat = await fs.stat(path.join(componentsDir, file));
      if (stat.isDirectory()) {
        // Look for index file in subdirectory
        const indexFiles = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'];
        for (const indexFile of indexFiles) {
          if (await fs.pathExists(path.join(componentsDir, file, indexFile))) {
            const componentName = file.charAt(0).toUpperCase() + file.slice(1);
            exposes[`./${componentName}`] = `./src/components/${file}`;
            break;
          }
        }
      }
    }
  }

  return exposes;
}

/**
 * Auto-detect shared dependencies
 */
function autoDetectShared(pkgJson: any, framework: string): string[] {
  const shared: string[] = [];
  const deps = pkgJson.dependencies || {};

  // Framework-specific shared deps
  switch (framework) {
    case 'react':
      if (deps['react']) shared.push('react');
      if (deps['react-dom']) shared.push('react-dom');
      if (deps['react-router-dom']) shared.push('react-router-dom');
      break;
    case 'vue':
      if (deps['vue']) shared.push('vue');
      if (deps['vue-router']) shared.push('vue-router');
      break;
    case 'angular':
      if (deps['@angular/core']) shared.push('@angular/core');
      if (deps['@angular/common']) shared.push('@angular/common');
      if (deps['@angular/router']) shared.push('@angular/router');
      break;
    case 'svelte':
      if (deps['svelte']) shared.push('svelte');
      break;
  }

  // Common shared dependencies
  const commonShared = ['lodash', 'axios', 'dayjs', 'date-fns'];
  for (const dep of commonShared) {
    if (deps[dep] && !shared.includes(dep)) {
      shared.push(dep);
    }
  }

  return shared;
}

/**
 * Generate Vite config
 */
function generateViteConfig(
  name: string,
  exposes: Record<string, string>,
  shared: string[],
  registry?: RemoteRegistry,
  isHost: boolean = false
): string {
  const exposesStr = Object.entries(exposes)
    .map(([key, value]) => `    '${key}': '${value}'`)
    .join(',\n');

  const sharedConfig = shared.map(dep => 
    `    '${dep}': { singleton: true }`
  ).join(',\n');

  let remotesStr = '';
  if (isHost && registry) {
    const remotes = generateRemotesConfig(registry, { 
      format: 'object',
      excludeSelf: name,
      environment: 'development'
    });
    remotesStr = Object.entries(remotes)
      .map(([key, value]) => `    ${key}: '${value}'`)
      .join(',\n');
  }

  return `import { defineConfig } from '@module-federation/vite';

export default defineConfig({
  name: '${name}',
  filename: 'remoteEntry.js',
  ${exposesStr ? `exposes: {\n${exposesStr}\n  },` : ''}
  ${remotesStr ? `remotes: {\n${remotesStr}\n  },` : ''}
  ${sharedConfig ? `shared: {\n${sharedConfig}\n  }` : 'shared: {}'}
});
`;
}

/**
 * Generate Webpack config
 */
function generateWebpackConfig(
  name: string,
  exposes: Record<string, string>,
  shared: string[],
  registry?: RemoteRegistry,
  isHost: boolean = false
): string {
  const exposesStr = Object.entries(exposes)
    .map(([key, value]) => `      '${key}': '${value}'`)
    .join(',\n');

  const sharedConfig = shared.map(dep => 
    `      '${dep}': { singleton: true, eager: false }`
  ).join(',\n');

  let remotesStr = '';
  if (isHost && registry) {
    const remotes = generateRemotesConfig(registry, { 
      format: 'object',
      excludeSelf: name,
      environment: 'development'
    });
    remotesStr = Object.entries(remotes)
      .map(([key, value]) => `      ${key}: '${value}'`)
      .join(',\n');
  }

  return `const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: '${name}',
      filename: 'remoteEntry.js',
      ${exposesStr ? `exposes: {\n${exposesStr}\n      },` : ''}
      ${remotesStr ? `remotes: {\n${remotesStr}\n      },` : ''}
      ${sharedConfig ? `shared: {\n${sharedConfig}\n      }` : 'shared: {}'}
    })
  ]
};
`;
}

/**
 * Generate Rsbuild config
 */
function generateRsbuildConfig(
  name: string,
  exposes: Record<string, string>,
  shared: string[],
  registry?: RemoteRegistry,
  isHost: boolean = false
): string {
  const exposesStr = Object.entries(exposes)
    .map(([key, value]) => `      '${key}': '${value}'`)
    .join(',\n');

  const sharedConfig = shared.map(dep => 
    `      '${dep}': { singleton: true }`
  ).join(',\n');

  let remotesStr = '';
  if (isHost && registry) {
    const remotes = generateRemotesConfig(registry, { 
      format: 'object',
      excludeSelf: name,
      environment: 'development'
    });
    remotesStr = Object.entries(remotes)
      .map(([key, value]) => `      ${key}: '${value}'`)
      .join(',\n');
  }

  return `import { defineConfig } from '@rsbuild/core';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginModuleFederation({
      name: '${name}',
      filename: 'remoteEntry.js',
      ${exposesStr ? `exposes: {\n${exposesStr}\n      },` : ''}
      ${remotesStr ? `remotes: {\n${remotesStr}\n      },` : ''}
      ${sharedConfig ? `shared: {\n${sharedConfig}\n      }` : 'shared: {}'}
    })
  ]
});
`;
}

/**
 * Save remote registry to file
 */
export async function saveRegistry(
  registry: RemoteRegistry,
  outputPath?: string
): Promise<void> {
  const registryPath = outputPath || path.join(registry.workspaceRoot, '.mfe-registry.json');
  
  await fs.writeJson(registryPath, registry, { spaces: 2 });
  console.log(chalk.green(`✓ Registry saved to ${registryPath}`));
}

/**
 * Load remote registry from file
 */
export async function loadRegistry(
  workspaceRoot: string,
  registryPath?: string
): Promise<RemoteRegistry | null> {
  const path_ = registryPath || path.join(workspaceRoot, '.mfe-registry.json');
  
  if (!await fs.pathExists(path_)) {
    return null;
  }

  return await fs.readJson(path_);
}

/**
 * Print registry information
 */
export function printRegistry(registry: RemoteRegistry): void {
  console.log(chalk.bold.cyan('\n📦 Module Federation Registry\n'));
  console.log(chalk.gray(`Workspace: ${registry.workspaceRoot}`));
  console.log(chalk.gray(`Last updated: ${registry.lastUpdated.toLocaleString()}`));
  console.log(chalk.gray(`Total remotes: ${registry.remotes.length}\n`));

  for (const remote of registry.remotes) {
    console.log(chalk.bold.green(`📦 ${remote.name}`));
    console.log(chalk.gray(`   Path: ${remote.path}`));
    if (remote.url) {
      console.log(chalk.gray(`   URL: ${remote.url}`));
    }
    console.log(chalk.gray(`   Framework: ${remote.framework} | Build: ${remote.buildTool}`));
    console.log(chalk.gray(`   Exposes: ${Object.keys(remote.exposes).join(', ')}`));
    if (remote.version) {
      console.log(chalk.gray(`   Version: ${remote.version}`));
    }
    console.log();
  }
}
