/**
 * Auto-Registration System for Module Federation Remotes
 * 
 * Automatically registers remotes with the registry service when dev servers start.
 * Provides plugins/hooks for Vite, Webpack, and Rsbuild to inject registration logic.
 * 
 * Usage:
 * 1. CLI: `mfe auto-register` - starts auto-registration service
 * 2. Dev server integration via plugins
 * 3. Manual registration: registerRemote(config)
 */

import fs from 'fs-extra';
import path from 'node:path';
import chalk from 'chalk';

export interface AutoRegisterConfig {
  registryUrl: string;
  packagePath?: string;
  autoDetect?: boolean;
  onRegistered?: (name: string, version: string) => void;
  onError?: (error: Error) => void;
}

export interface RemoteRegistration {
  name: string;
  url: string;
  version: string;
  manifest?: string;
  exposes: Record<string, string>;
  shared?: Record<string, any>;
  framework?: string;
  buildTool?: string;
  metadata?: {
    description?: string;
    team?: string;
    owner?: string;
  };
  deployment?: {
    environment: 'development' | 'staging' | 'production';
    canary?: boolean;
  };
}

/**
 * Register a remote with the registry service
 */
export async function registerRemote(
  config: AutoRegisterConfig,
  remote: RemoteRegistration
): Promise<boolean> {
  try {
    const response = await fetch(`${config.registryUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(remote)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Registration failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (config.onRegistered) {
      config.onRegistered(remote.name, remote.version);
    }

    return true;
  } catch (error) {
    if (config.onError) {
      config.onError(error instanceof Error ? error : new Error(String(error)));
    }
    return false;
  }
}

/**
 * Auto-detect and register from package directory
 */
export async function autoRegisterFromPackage(
  config: AutoRegisterConfig
): Promise<boolean> {
  const packagePath = config.packagePath || process.cwd();
  
  try {
    // Read package.json
    const pkgJsonPath = path.join(packagePath, 'package.json');
    if (!await fs.pathExists(pkgJsonPath)) {
      throw new Error('package.json not found');
    }

    const pkgJson = await fs.readJson(pkgJsonPath);
    
    // Read module-federation config
    const federationConfig = await detectFederationConfig(packagePath);
    if (!federationConfig) {
      throw new Error('No Module Federation config found');
    }

    // Detect dev server port
    const port = await detectDevServerPort(packagePath, pkgJson);
    
    // Detect framework and build tool
    const framework = detectFramework(pkgJson);
    const buildTool = await detectBuildTool(packagePath, pkgJson);

    // Build registration payload
    const remote: RemoteRegistration = {
      name: federationConfig.name,
      url: `http://localhost:${port}`,
      version: pkgJson.version || '0.0.1',
      manifest: `http://localhost:${port}/mf-manifest.json`,
      exposes: federationConfig.exposes || {},
      shared: federationConfig.shared,
      framework,
      buildTool,
      metadata: {
        description: pkgJson.description,
        team: pkgJson.author,
        owner: pkgJson.author
      },
      deployment: {
        environment: 'development',
        canary: false
      }
    };

    // Register
    const success = await registerRemote(config, remote);
    
    if (success) {
      console.log(chalk.green(`✅ Registered: ${remote.name}@${remote.version}`));
      console.log(chalk.cyan(`   URL: ${remote.url}`));
      console.log(chalk.gray(`   Framework: ${framework} (${buildTool})`));
    }

    return success;
  } catch (error) {
    if (config.onError) {
      config.onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      console.error(chalk.red('❌ Auto-registration failed:'), error);
    }
    return false;
  }
}

/**
 * Detect Module Federation config from package
 */
async function detectFederationConfig(packagePath: string): Promise<any> {
  const configFiles = [
    'module-federation.config.ts',
    'module-federation.config.js',
    'module-federation.config.cjs',
    'module-federation.config.mjs'
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(packagePath, configFile);
    if (await fs.pathExists(configPath)) {
      try {
        const content = await fs.readFile(configPath, 'utf8');
        
        // Parse config (simplified - extract name and exposes)
        const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
        const name = nameMatch ? nameMatch[1] : null;
        
        // Extract exposes (simplified)
        const exposesMatch = content.match(/exposes:\s*{([^}]+)}/);
        const exposes: Record<string, string> = {};
        
        if (exposesMatch) {
          const exposesContent = exposesMatch[1];
          const exposesLines = exposesContent.split(',');
          
          exposesLines.forEach(line => {
            const match = line.match(/['"](.+?)['"]\s*:\s*['"](.+?)['"]/);
            if (match) {
              exposes[match[1]] = match[2];
            }
          });
        }

        if (name) {
          return { name, exposes };
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to parse ${configFile}`));
      }
    }
  }

  return null;
}

/**
 * Detect dev server port from configs
 */
async function detectDevServerPort(packagePath: string, pkgJson: any): Promise<number> {
  // Check package.json scripts for port
  const devScript = pkgJson.scripts?.dev || pkgJson.scripts?.start || '';
  const portMatch = devScript.match(/--port[=\s]+(\d+)/);
  if (portMatch) {
    return parseInt(portMatch[1], 10);
  }

  // Check vite.config
  const viteConfigPath = path.join(packagePath, 'vite.config.ts');
  if (await fs.pathExists(viteConfigPath)) {
    const content = await fs.readFile(viteConfigPath, 'utf8');
    const portMatch = content.match(/port:\s*(\d+)/);
    if (portMatch) {
      return parseInt(portMatch[1], 10);
    }
  }

  // Check rsbuild.config
  const rsbuildConfigPath = path.join(packagePath, 'rsbuild.config.ts');
  if (await fs.pathExists(rsbuildConfigPath)) {
    const content = await fs.readFile(rsbuildConfigPath, 'utf8');
    const portMatch = content.match(/port:\s*(\d+)/);
    if (portMatch) {
      return parseInt(portMatch[1], 10);
    }
  }

  // Check webpack.config
  const webpackConfigPath = path.join(packagePath, 'webpack.config.cjs');
  if (await fs.pathExists(webpackConfigPath)) {
    const content = await fs.readFile(webpackConfigPath, 'utf8');
    const portMatch = content.match(/port:\s*(\d+)/);
    if (portMatch) {
      return parseInt(portMatch[1], 10);
    }
  }

  // Default ports by framework
  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  if (deps['vite']) return 5173;
  if (deps['@rsbuild/core']) return 3000;
  if (deps['webpack']) return 8080;
  
  return 3000; // Fallback
}

/**
 * Detect framework from package.json
 */
function detectFramework(pkgJson: any): string {
  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  
  if (deps['react'] || deps['react-dom']) return 'react';
  if (deps['@angular/core']) return 'angular';
  if (deps['vue']) return 'vue';
  if (deps['svelte']) return 'svelte';
  
  return 'unknown';
}

/**
 * Detect build tool from configs
 */
async function detectBuildTool(packagePath: string, pkgJson: any): Promise<string> {
  if (await fs.pathExists(path.join(packagePath, 'vite.config.ts'))) return 'vite';
  if (await fs.pathExists(path.join(packagePath, 'rsbuild.config.ts'))) return 'rsbuild';
  if (await fs.pathExists(path.join(packagePath, 'webpack.config.cjs'))) return 'webpack';
  
  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  if (deps['vite']) return 'vite';
  if (deps['@rsbuild/core']) return 'rsbuild';
  if (deps['webpack']) return 'webpack';
  
  return 'unknown';
}

/**
 * Unregister a remote from the registry
 */
export async function unregisterRemote(
  registryUrl: string,
  remoteName: string,
  version?: string
): Promise<boolean> {
  try {
    const endpoint = version ? `${remoteName}@${version}` : remoteName;
    const response = await fetch(`${registryUrl}/remotes/${endpoint}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Unregistration failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Unregistration failed:'), error);
    return false;
  }
}

/**
 * Create Vite plugin for auto-registration
 */
export function viteAutoRegisterPlugin(config: AutoRegisterConfig): any {
  return {
    name: 'vite-auto-register-mfe',
    configureServer(server: any) {
      server.httpServer?.once('listening', () => {
        // Wait a bit for server to be fully ready
        setTimeout(() => {
          autoRegisterFromPackage(config).catch(err => {
            console.error(chalk.red('Auto-registration failed:'), err);
          });
        }, 1000);
      });
    }
  };
}

/**
 * Create Webpack plugin for auto-registration
 */
export function webpackAutoRegisterPlugin(config: AutoRegisterConfig): any {
  return {
    apply(compiler: any) {
      compiler.hooks.afterEmit.tap('webpack-auto-register-mfe', () => {
        autoRegisterFromPackage(config).catch((err: Error) => {
          console.error(chalk.red('Auto-registration failed:'), err);
        });
      });
    }
  };
}

/**
 * Create Rsbuild plugin for auto-registration
 */
export function rsbuildAutoRegisterPlugin(config: AutoRegisterConfig): any {
  return {
    name: 'rsbuild-auto-register-mfe',
    setup(api: any) {
      api.onAfterBuild(() => {
        autoRegisterFromPackage(config).catch((err: Error) => {
          console.error(chalk.red('Auto-registration failed:'), err);
        });
      });
    }
  };
}

/**
 * Watch for changes and re-register
 */
export function startAutoRegisterWatch(config: AutoRegisterConfig): () => void {
  const packagePath = config.packagePath || process.cwd();
  const configFiles = [
    'module-federation.config.ts',
    'module-federation.config.js',
    'module-federation.config.cjs',
    'package.json'
  ];

  let watchTimeout: NodeJS.Timeout | null = null;

  const handleChange = () => {
    if (watchTimeout) clearTimeout(watchTimeout);
    
    watchTimeout = setTimeout(() => {
      console.log(chalk.cyan('🔄 Config changed, re-registering...'));
      autoRegisterFromPackage(config).catch(err => {
        console.error(chalk.red('Re-registration failed:'), err);
      });
    }, 1000);
  };

  // Simple file watching (in production, use chokidar or similar)
  const watchers = configFiles.map(file => {
    const filePath = path.join(packagePath, file);
    try {
      return fs.watch(filePath, handleChange);
    } catch {
      return null;
    }
  }).filter(Boolean);

  console.log(chalk.cyan(`👀 Watching ${watchers.length} files for changes...`));

  // Return cleanup function
  return () => {
    watchers.forEach(watcher => watcher?.close());
    if (watchTimeout) clearTimeout(watchTimeout);
  };
}
