import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

export interface CreateOptions {
  name: string;
  template?: string;
  framework?: string;
  buildTool?: string;
  mfName: string;
  port: number;
  shared: string;
  uiLibs?: string[];
  install: boolean;
  gitInit: boolean;
  force: boolean;
  targetDir: string;
  root: string;
}

export interface FrameworkHandler {
  updateConfig(opts: CreateOptions): Promise<void>;
  getDefaultShared(): string[];
  getDefaultPort(): number;
  getSupportedBuildTools(): string[];
}

/**
 * Framework-specific configuration handlers
 */
export const FRAMEWORK_HANDLERS: Record<string, FrameworkHandler> = {
  react: {
    async updateConfig(opts: CreateOptions): Promise<void> {
      console.log(chalk.gray('  🔧 Applying React-specific configurations...'));
      // React configs handled by existing template logic
    },
    getDefaultShared: () => ['react', 'react-dom'],
    getDefaultPort: () => 3000,
    getSupportedBuildTools: () => ['vite', 'webpack', 'rsbuild'],
  },

  angular: {
    async updateConfig(opts: CreateOptions): Promise<void> {
      console.log(
        chalk.gray('  🔧 Applying Angular-specific configurations...')
      );

      // Update angular.json if exists
      const angularJsonPath = path.join(opts.targetDir, 'angular.json');
      if (await fs.pathExists(angularJsonPath)) {
        const config = await fs.readJson(angularJsonPath);

        // Update project name and port
        const projectKey = Object.keys(config.projects)[0];
        if (projectKey) {
          // Rename project
          config.projects[opts.name] = config.projects[projectKey];
          if (projectKey !== opts.name) {
            delete config.projects[projectKey];
          }

          // Update dev server port
          if (config.projects[opts.name].architect?.serve?.options) {
            config.projects[opts.name].architect.serve.options.port = opts.port;
          }
        }

        await fs.writeJson(angularJsonPath, config, { spaces: 2 });
        console.log(
          chalk.gray(`    ✓ Updated angular.json (port: ${opts.port})`)
        );
      }

      // Update webpack.config.js for Module Federation
      const webpackConfigPath = path.join(opts.targetDir, 'webpack.config.js');
      if (await fs.pathExists(webpackConfigPath)) {
        let content = await fs.readFile(webpackConfigPath, 'utf8');

        // Update Module Federation plugin name
        content = content.replace(
          /name:\s*['"][\w_-]+['"]/g,
          `name: '${opts.mfName}'`
        );

        await fs.writeFile(webpackConfigPath, content, 'utf8');
        console.log(
          chalk.gray(
            `    ✓ Updated webpack.config.js (MF name: ${opts.mfName})`
          )
        );
      }

      // Update package.json
      const pkgPath = path.join(opts.targetDir, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = opts.name;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        console.log(
          chalk.gray(`    ✓ Updated package.json (name: ${opts.name})`)
        );
      }
    },
    getDefaultShared: () => [
      '@angular/core',
      '@angular/common',
      '@angular/router',
    ],
    getDefaultPort: () => 4200,
    getSupportedBuildTools: () => ['webpack'],
  },

  vue: {
    async updateConfig(opts: CreateOptions): Promise<void> {
      console.log(chalk.gray('  🔧 Applying Vue-specific configurations...'));

      // Update vite.config.ts/js if exists
      const viteConfigPath = path.join(
        opts.targetDir,
        (await fs.pathExists(path.join(opts.targetDir, 'vite.config.ts')))
          ? 'vite.config.ts'
          : 'vite.config.js'
      );

      if (await fs.pathExists(viteConfigPath)) {
        let content = await fs.readFile(viteConfigPath, 'utf8');

        // Update Module Federation name
        content = content.replace(
          /name:\s*['"][\w_-]+['"]/g,
          `name: '${opts.mfName}'`
        );

        // Update dev server port
        content = content.replace(/port:\s*\d+/g, `port: ${opts.port}`);

        await fs.writeFile(viteConfigPath, content, 'utf8');
        console.log(
          chalk.gray(`    ✓ Updated vite.config (port: ${opts.port})`)
        );
      }

      // Update package.json
      const pkgPath = path.join(opts.targetDir, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = opts.name;

        // Update dev script to use correct port
        if (pkg.scripts?.dev) {
          pkg.scripts.dev = `vite --port ${opts.port}`;
        }

        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        console.log(chalk.gray(`    ✓ Updated package.json`));
      }
    },
    getDefaultShared: () => ['vue'],
    getDefaultPort: () => 5173,
    getSupportedBuildTools: () => ['vite', 'webpack'],
  },

  svelte: {
    async updateConfig(opts: CreateOptions): Promise<void> {
      console.log(
        chalk.gray('  🔧 Applying Svelte-specific configurations...')
      );

      // Similar to Vue
      const viteConfigPath = path.join(
        opts.targetDir,
        (await fs.pathExists(path.join(opts.targetDir, 'vite.config.ts')))
          ? 'vite.config.ts'
          : 'vite.config.js'
      );

      if (await fs.pathExists(viteConfigPath)) {
        let content = await fs.readFile(viteConfigPath, 'utf8');
        content = content.replace(
          /name:\s*['"][\w_-]+['"]/g,
          `name: '${opts.mfName}'`
        );
        content = content.replace(/port:\s*\d+/g, `port: ${opts.port}`);
        await fs.writeFile(viteConfigPath, content, 'utf8');
      }

      const pkgPath = path.join(opts.targetDir, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = opts.name;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }
    },
    getDefaultShared: () => ['svelte'],
    getDefaultPort: () => 5173,
    getSupportedBuildTools: () => ['vite'],
  },
};

/**
 * Get framework handler or throw error
 */
export function getFrameworkHandler(framework: string): FrameworkHandler {
  const handler = FRAMEWORK_HANDLERS[framework];
  if (!handler) {
    throw new Error(
      `Unsupported framework: ${framework}. Available: ${Object.keys(
        FRAMEWORK_HANDLERS
      ).join(', ')}`
    );
  }
  return handler;
}

/**
 * Validate framework and build tool combination
 */
export function validateFrameworkBuildTool(
  framework: string,
  buildTool: string
): boolean {
  const handler = FRAMEWORK_HANDLERS[framework];
  if (!handler) return false;

  const supportedTools = handler.getSupportedBuildTools();
  return supportedTools.includes(buildTool);
}

/**
 * Get supported build tools for a framework
 */
export function getSupportedBuildTools(framework: string): string[] {
  const handler = FRAMEWORK_HANDLERS[framework];
  return handler?.getSupportedBuildTools() || [];
}
