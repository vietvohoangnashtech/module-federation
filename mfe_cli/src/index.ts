#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { mutateWorkspace } from './workspace.js';
import { createFromTemplate } from './templates.js';
import { optimizeWorkspace } from './optimizer.js';
import {
  discoverRemotes,
  generateZeroConfig,
  saveRegistry,
  loadRegistry,
  printRegistry,
  type RemoteRegistry
} from './discovery.js';
import { startRegistryService, RegistryService, type RegistryConfig } from './registry-service.js';
import { autoRegisterFromPackage, unregisterRemote, startAutoRegisterWatch, type AutoRegisterConfig } from './auto-register.js';

interface CliArgs {
  name?: string;
  template?: string;
  framework?: string;
  buildTool?: string;
  mfName?: string;
  port?: number;
  shared?: string;
  install?: boolean;
  gitInit?: boolean;
  force?: boolean;
}

const FRAMEWORKS = ['react', 'angular', 'vue', 'svelte'];
const TEMPLATES = ['react-vite', 'react-webpack', 'react-rsbuild', 'provider', 'angular-webpack', 'vue-vite', 'svelte-vite'];

async function ensureArgs(argv: CliArgs): Promise<Required<CliArgs>> {
  let { name, template, framework, buildTool, mfName, port, shared, install, gitInit, force } = argv;
  
  // New mode: framework + buildTool
  // Legacy mode: template (for backwards compatibility)
  const useFrameworkMode = !template && (framework || buildTool);
  
  if (useFrameworkMode) {
    // Framework-based mode
    const missing = !name || !framework || !buildTool || !mfName;
    if (missing) {
      console.log(chalk.cyan('\n🎯 Module Federation Generator (Multi-Framework)\n'));
      const answers = await inquirer.prompt([
        !name ? { name: 'name', message: 'Package folder name?', validate: Boolean } : null,
        !framework ? { 
          name: 'framework', 
          message: 'Select framework:', 
          type: 'list', 
          choices: FRAMEWORKS 
        } : null,
        !buildTool && framework ? {
          name: 'buildTool',
          message: 'Select build tool:',
          type: 'list',
          choices: (answers: any) => {
            const fw = framework || answers.framework;
            return getFrameworkBuildTools(fw);
          }
        } : null,
        !mfName ? { name: 'mfName', message: 'Module Federation container name?', validate: Boolean } : null,
        !port ? { 
          name: 'port', 
          message: 'Dev port?', 
          default: (answers: any) => {
            const fw = framework || answers.framework;
            return getFrameworkDefaultPort(fw);
          }, 
          type: 'number' 
        } : null,
        !shared ? { 
          name: 'shared', 
          message: 'Comma separated shared libs?', 
          default: (answers: any) => {
            const fw = framework || answers.framework;
            return getFrameworkDefaultShared(fw);
          }
        } : null,
      ].filter(Boolean) as any);
      
      name ??= answers.name;
      framework ??= answers.framework;
      buildTool ??= answers.buildTool;
      mfName ??= answers.mfName;
      port ??= answers.port;
      shared ??= answers.shared;
    }
    
    // Convert framework+buildTool to template for backwards compatibility
    template = `${framework}-${buildTool}`;
  } else {
    // Legacy template mode
    const missing = !name || !template || !mfName;
    if (missing) {
      console.log(chalk.cyan('\n🎯 Module Federation Generator\n'));
      const answers = await inquirer.prompt([
        !name ? { name: 'name', message: 'Package folder name?', validate: Boolean } : null,
        !template ? { name: 'template', message: 'Template?', type: 'list', choices: TEMPLATES } : null,
        !mfName ? { name: 'mfName', message: 'Module Federation container name?', validate: Boolean } : null,
        !port ? { name: 'port', message: 'Dev port?', default: 3000, type: 'number' } : null,
        !shared ? { name: 'shared', message: 'Comma separated shared libs?', default: 'react,react-dom' } : null,
      ].filter(Boolean) as any);
      name ??= answers.name;
      template ??= answers.template;
      mfName ??= answers.mfName;
      port ??= answers.port;
      shared ??= answers.shared;
    }
    
    // Extract framework and buildTool from template
    const parts = template!.split('-');
    if (parts.length >= 2) {
      framework = parts[0];
      buildTool = parts.slice(1).join('-');
    } else if (template === 'provider') {
      framework = 'react';
      buildTool = 'rsbuild';
    }
  }
  
  install = install ?? false;
  gitInit = gitInit ?? false;
  force = force ?? false;
  framework = framework ?? 'react';
  buildTool = buildTool ?? 'vite';
  
  return { 
    name: name!, 
    template: template!, 
    framework: framework!, 
    buildTool: buildTool!, 
    mfName: mfName!, 
    port: port!, 
    shared: shared!, 
    install, 
    gitInit, 
    force 
  };
}

function getFrameworkBuildTools(framework: string): string[] {
  const buildToolMap: Record<string, string[]> = {
    react: ['vite', 'webpack', 'rsbuild'],
    angular: ['webpack'],
    vue: ['vite', 'webpack'],
    svelte: ['vite']
  };
  return buildToolMap[framework] || ['vite'];
}

function getFrameworkDefaultPort(framework: string): number {
  const portMap: Record<string, number> = {
    react: 3000,
    angular: 4200,
    vue: 5173,
    svelte: 5173
  };
  return portMap[framework] || 3000;
}

function getFrameworkDefaultShared(framework: string): string {
  const sharedMap: Record<string, string> = {
    react: 'react,react-dom',
    angular: '@angular/core,@angular/common,@angular/router',
    vue: 'vue',
    svelte: 'svelte'
  };
  return sharedMap[framework] || 'react,react-dom';
}

async function runInstall(targetDir: string, packageName: string) {
  console.log(chalk.cyan(`\n📦 Installing dependencies for ${packageName}...`));
  try {
    execSync(`pnpm install`, { 
      cwd: targetDir, 
      stdio: 'inherit'
    });
    console.log(chalk.green('✅ Dependencies installed successfully'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Installation failed. Run manually: pnpm install'));
  }
}

async function runGenerate(argv: CliArgs) {
  const full = await ensureArgs(argv);
  
  if (!TEMPLATES.includes(full.template) && !full.framework) {
    console.error(chalk.red(`❌ Unknown template '${full.template}'. Available: ${TEMPLATES.join(', ')}`));
    process.exit(1);
  }
  
  if (full.framework && !FRAMEWORKS.includes(full.framework)) {
    console.error(chalk.red(`❌ Unknown framework '${full.framework}'. Available: ${FRAMEWORKS.join(', ')}`));
    process.exit(1);
  }
  
  const root = process.cwd();
  const targetDir = path.join(root, full.name);
  
  try {
    await createFromTemplate({ ...full, targetDir, root });
    await mutateWorkspace(root, full.name);

    if (full.install) {
      await runInstall(targetDir, full.name);
    }

    console.log(chalk.green.bold(`\n✨ Successfully generated MFE '${full.name}'!`));
    console.log(chalk.cyan(`\n📋 Next steps:`));
    console.log(chalk.white(`  1. cd ${full.name}`));
    if (!full.install) {
      console.log(chalk.white(`  2. pnpm install`));
    }
    console.log(chalk.white(`  ${full.install ? '2' : '3'}. pnpm dev`));
    console.log(chalk.white(`  ${full.install ? '3' : '4'}. Open http://localhost:${full.port}`));
    console.log(chalk.gray(`\n💡 Add to workspace dev orchestration if needed (see root package.json scripts)`));
    console.log(chalk.gray(`💡 Module Federation name: ${chalk.bold(full.mfName)}\n`));
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Generation failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runOptimize(options: { apply?: boolean; dryRun?: boolean }) {
  const root = process.cwd();
  
  try {
    // Check if we're in a workspace
    const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
    if (!await fs.pathExists(workspaceFile)) {
      console.error(chalk.red('\n❌ Not in a pnpm workspace. Run this command from the workspace root.\n'));
      process.exit(1);
    }
    
    // Run optimization
    const report = await optimizeWorkspace(root, options);
    
    // If not applying, ask if user wants to apply
    if (!options.apply && report.recommendations.toShare.length > 0) {
      const { shouldApply } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldApply',
          message: 'Would you like to apply these optimizations now?',
          default: false
        }
      ]);
      
      if (shouldApply) {
        await optimizeWorkspace(root, { apply: true, dryRun: false });
      } else {
        console.log(chalk.cyan('\n💡 Run with --apply flag to apply optimizations\n'));
      }
    }
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Optimization failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runDiscover(options: { save?: boolean; print?: boolean }) {
  const root = process.cwd();
  
  try {
    // Discover all remotes
    const registry = await discoverRemotes({ workspaceRoot: root });
    
    // Print registry
    if (options.print !== false) {
      printRegistry(registry);
    }
    
    // Save registry
    if (options.save) {
      await saveRegistry(registry);
    }
    
    return registry;
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Discovery failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runInit(options: { packagePath?: string; isHost?: boolean }) {
  const root = process.cwd();
  const packagePath = options.packagePath || root;
  
  try {
    console.log(chalk.cyan('\n🔧 Generating zero-config Module Federation setup...\n'));
    
    // Discover remotes for registry
    let registry: RemoteRegistry | undefined;
    if (options.isHost) {
      registry = await discoverRemotes({ workspaceRoot: root });
    }
    
    // Generate config
    const config = await generateZeroConfig(packagePath, {
      registry,
      isHost: options.isHost
    });
    
    // Determine config filename
    const pkgJson = await fs.readJson(path.join(packagePath, 'package.json'));
    const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
    
    let configFilename = 'module-federation.config.ts';
    if (deps['vite']) configFilename = 'module-federation.config.ts';
    else if (deps['webpack']) configFilename = 'module-federation.config.cjs';
    else if (deps['@rsbuild/core']) configFilename = 'module-federation.config.ts';
    
    const configPath = path.join(packagePath, configFilename);
    
    // Check if config already exists
    if (await fs.pathExists(configPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Config file ${configFilename} already exists. Overwrite?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('\n⚠️  Aborted. Config file not modified.\n'));
        return;
      }
    }
    
    // Write config
    await fs.writeFile(configPath, config, 'utf8');
    
    console.log(chalk.green(`✅ Generated ${configFilename}`));
    console.log(chalk.cyan('\n💡 Configuration auto-detected:'));
    console.log(chalk.gray('   - Framework and dependencies'));
    console.log(chalk.gray('   - Exposed modules'));
    console.log(chalk.gray('   - Shared dependencies'));
    if (options.isHost) {
      console.log(chalk.gray('   - Remote applications'));
    }
    console.log(chalk.green('\n✨ Zero-config setup complete!\n'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Init failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runRegistryStart(config: Partial<RegistryConfig>) {
  console.log(chalk.cyan('\n🚀 Starting Module Federation Registry Service...\n'));
  
  try {
    await startRegistryService(config);
    
    // Keep running
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Registry start failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runRegistryRegister(options: { registryUrl: string; packagePath?: string; watch?: boolean }) {
  console.log(chalk.cyan('\n📝 Registering with registry service...\n'));
  
  try {
    const config: AutoRegisterConfig = {
      registryUrl: options.registryUrl,
      packagePath: options.packagePath,
      autoDetect: true,
      onRegistered: (name, version) => {
        console.log(chalk.green(`\n✅ Successfully registered: ${name}@${version}\n`));
      },
      onError: (error) => {
        console.error(chalk.red(`\n❌ Registration failed: ${error.message}\n`));
      }
    };
    
    const success = await autoRegisterFromPackage(config);
    
    if (!success) {
      process.exit(1);
    }
    
    // Watch mode
    if (options.watch) {
      console.log(chalk.cyan('👀 Watching for changes...'));
      const cleanup = startAutoRegisterWatch(config);
      
      // Keep process alive
      process.on('SIGINT', () => {
        cleanup();
        console.log(chalk.yellow('\n⏹️  Watch stopped\n'));
        process.exit(0);
      });
    }
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Registration failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runRegistryList(options: { 
  registryUrl: string; 
  environment?: 'development' | 'staging' | 'production'; 
  healthyOnly?: boolean 
}) {
  try {
    const params = new URLSearchParams();
    if (options.environment) params.set('env', options.environment);
    if (options.healthyOnly) params.set('healthy', 'true');
    
    const url = `${options.registryUrl}/remotes?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Registry responded with ${response.status}`);
    }
    
    const data = await response.json();
    const remotes = data.remotes || [];
    
    console.log(chalk.cyan.bold(`\n📦 Registered Remotes (${remotes.length})\n`));
    
    if (remotes.length === 0) {
      console.log(chalk.gray('  No remotes found\n'));
      return;
    }
    
    remotes.forEach((remote: any) => {
      const healthIcon = remote.health?.status === 'healthy' ? '✅' : 
                        remote.health?.status === 'unhealthy' ? '❌' : '❔';
      
      console.log(chalk.bold(`  ${healthIcon} ${remote.name}@${remote.version}`));
      console.log(chalk.gray(`     URL: ${remote.url}`));
      console.log(chalk.gray(`     Framework: ${remote.framework || 'unknown'} (${remote.buildTool || 'unknown'})`));
      
      if (remote.exposes) {
        const exposeKeys = Object.keys(remote.exposes);
        if (exposeKeys.length > 0) {
          console.log(chalk.gray(`     Exposes: ${exposeKeys.join(', ')}`));
        }
      }
      
      if (remote.deployment) {
        console.log(chalk.gray(`     Environment: ${remote.deployment.environment}`));
        if (remote.deployment.canary) {
          console.log(chalk.yellow(`     🎯 Canary deployment`));
        }
      }
      
      console.log('');
    });
    
    console.log(chalk.cyan(`Total: ${data.count} remotes (${data.totalVersions} versions)\n`));
  } catch (error) {
    console.error(chalk.red.bold('\n❌ List failed:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runRegistryStatus(options: { registryUrl: string }) {
  try {
    const response = await fetch(`${options.registryUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Registry responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(chalk.green.bold('\n✅ Registry Service Status\n'));
    console.log(chalk.cyan(`  Status: ${data.status}`));
    console.log(chalk.gray(`  Uptime: ${Math.floor(data.uptime / 60)} minutes`));
    console.log(chalk.gray(`  URL: ${options.registryUrl}`));
    
    if (data.registry) {
      console.log(chalk.cyan('\n  Registry Data:'));
      console.log(chalk.gray(`    Total Remotes: ${data.registry.totalRemotes}`));
      console.log(chalk.gray(`    Total Versions: ${data.registry.totalVersions}`));
      console.log(chalk.green(`    Healthy: ${data.registry.healthyRemotes}`));
      if (data.registry.unhealthyRemotes > 0) {
        console.log(chalk.red(`    Unhealthy: ${data.registry.unhealthyRemotes}`));
      }
    }
    
    if (data.config) {
      console.log(chalk.cyan('\n  Configuration:'));
      console.log(chalk.gray(`    Port: ${data.config.port}`));
      console.log(chalk.gray(`    Health Check Interval: ${data.config.healthCheckInterval}ms`));
    }
    
    console.log('');
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Status check failed:'), error instanceof Error ? error.message : String(error));
    console.log(chalk.yellow('\n⚠️  Registry service may not be running. Start it with: mfe registry start\n'));
    process.exit(1);
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Module Federation CLI\n'));
  
  const argv = yargs(hideBin(process.argv))
    .scriptName('mfe')
    .command(
      ['generate <name>', '$0 <name>'],
      'Generate a new MFE package',
      (yargs) => {
        return yargs
          .positional('name', { describe: 'Directory/package name', type: 'string', demandOption: true })
          .option('template', { type: 'string', choices: TEMPLATES, describe: 'Template key (legacy)' })
          .option('framework', { type: 'string', choices: FRAMEWORKS, describe: 'Framework (react/angular/vue/svelte)' })
          .option('build-tool', { type: 'string', describe: 'Build tool (vite/webpack/rsbuild)' })
          .option('mf-name', { type: 'string', describe: 'Container/remote name' })
          .option('port', { type: 'number', describe: 'Dev server port' })
          .option('shared', { type: 'string', describe: 'Shared/peer deps' })
          .option('install', { type: 'boolean', default: false, describe: 'Run pnpm install after generation' })
          .option('git-init', { type: 'boolean', default: false })
          .option('force', { type: 'boolean', default: false, describe: 'Overwrite existing directory' })
          .example('$0 my-app --framework react --build-tool vite --mf-name myRemote --port 3200', 'Generate a React + Vite MFE')
          .example('$0 ng-app --framework angular --build-tool webpack --mf-name ngRemote', 'Generate an Angular + Webpack MFE');
      },
      async (argv) => {
        await runGenerate(argv as any);
      }
    )
    .command(
      'optimize',
      'Analyze and optimize shared dependencies',
      (yargs) => {
        return yargs
          .option('apply', { type: 'boolean', default: false, describe: 'Automatically apply optimizations' })
          .option('dry-run', { type: 'boolean', default: false, describe: 'Preview changes without applying' })
          .example('$0 optimize', 'Analyze dependencies and show recommendations')
          .example('$0 optimize --apply', 'Analyze and auto-apply optimizations')
          .example('$0 optimize --dry-run', 'Preview what would be changed');
      },
      async (argv) => {
        await runOptimize({ apply: argv.apply, dryRun: argv.dryRun });
      }
    )
    .command(
      'discover',
      'Discover all Module Federation remotes in workspace',
      (yargs) => {
        return yargs
          .option('save', { type: 'boolean', default: false, describe: 'Save registry to .mfe-registry.json' })
          .option('print', { type: 'boolean', default: true, describe: 'Print registry to console' })
          .example('$0 discover', 'Discover and display all remotes')
          .example('$0 discover --save', 'Discover and save registry file');
      },
      async (argv) => {
        await runDiscover({ save: argv.save, print: argv.print });
      }
    )
    .command(
      'init',
      'Initialize zero-config Module Federation setup',
      (yargs) => {
        return yargs
          .option('path', { type: 'string', describe: 'Package path (defaults to current directory)' })
          .option('host', { type: 'boolean', default: false, describe: 'Configure as host application' })
          .example('$0 init', 'Generate zero-config for current package')
          .example('$0 init --host', 'Generate config with auto-discovered remotes')
          .example('$0 init --path ./my-app', 'Generate config for specific package');
      },
      async (argv) => {
        await runInit({ packagePath: argv.path, isHost: argv.host });
      }
    )
    .command(
      'registry',
      'Manage the Module Federation registry service',
      (yargs) => {
        return yargs
          .command(
            'start',
            'Start the registry service',
            (yargs) => {
              return yargs
                .option('port', { type: 'number', default: 3999, describe: 'Registry server port' })
                .option('host', { type: 'string', default: 'localhost', describe: 'Registry server host' })
                .option('persist', { type: 'string', default: '.mfe-registry-service.json', describe: 'Registry persistence file' })
                .example('$0 registry start', 'Start registry on default port 3999')
                .example('$0 registry start --port 4000', 'Start registry on custom port');
            },
            async (argv) => {
              await runRegistryStart({ 
                port: argv.port, 
                host: argv.host, 
                persistPath: argv.persist 
              });
            }
          )
          .command(
            'register',
            'Register current package with registry',
            (yargs) => {
              return yargs
                .option('url', { type: 'string', default: 'http://localhost:3999', describe: 'Registry service URL' })
                .option('path', { type: 'string', describe: 'Package path (defaults to current directory)' })
                .option('watch', { type: 'boolean', default: false, describe: 'Watch for changes and re-register' })
                .example('$0 registry register', 'Register current package')
                .example('$0 registry register --watch', 'Register and watch for changes')
                .example('$0 registry register --url http://prod-registry:3999', 'Register to production registry');
            },
            async (argv) => {
              await runRegistryRegister({ 
                registryUrl: argv.url, 
                packagePath: argv.path, 
                watch: argv.watch 
              });
            }
          )
          .command(
            'list',
            'List all registered remotes',
            (yargs) => {
              return yargs
                .option('url', { type: 'string', default: 'http://localhost:3999', describe: 'Registry service URL' })
                .option('env', { type: 'string', choices: ['development', 'staging', 'production'], describe: 'Filter by environment' })
                .option('healthy', { type: 'boolean', default: false, describe: 'Show only healthy remotes' })
                .example('$0 registry list', 'List all registered remotes')
                .example('$0 registry list --env production', 'List production remotes only');
            },
            async (argv) => {
              await runRegistryList({ 
                registryUrl: argv.url, 
                environment: argv.env as any, 
                healthyOnly: argv.healthy 
              });
            }
          )
          .command(
            'status',
            'Check registry service status',
            (yargs) => {
              return yargs
                .option('url', { type: 'string', default: 'http://localhost:3999', describe: 'Registry service URL' })
                .example('$0 registry status', 'Check registry health');
            },
            async (argv) => {
              await runRegistryStatus({ registryUrl: argv.url });
            }
          )
          .demandCommand(1, 'Please specify a registry command')
          .help();
      }
    )
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .demandCommand(1, 'Please specify a command')
    .strict()
    .argv;

  await argv;
}

main().catch(err => {
  console.error(chalk.red(err instanceof Error ? err.stack : String(err)));
  process.exit(1);
});
