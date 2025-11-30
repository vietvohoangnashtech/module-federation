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

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Module Federation CLI\n'));
  
  const argv = (yargs(hideBin(process.argv))
    .scriptName('generate-mfe')
    .usage('$0 <name> [options]')
    .positional('name', { describe: 'Directory/package name', type: 'string' })
    .option('template', { type: 'string', choices: TEMPLATES, describe: 'Template key (legacy)' })
    .option('framework', { type: 'string', choices: FRAMEWORKS, describe: 'Framework (react/angular/vue/svelte)' })
    .option('build-tool', { type: 'string', describe: 'Build tool (vite/webpack/rsbuild)' })
    .option('mf-name', { type: 'string', describe: 'Container/remote name', demandOption: false })
    .option('port', { type: 'number', describe: 'Dev server port' })
    .option('shared', { type: 'string', describe: 'Shared/peer deps' })
    .option('install', { type: 'boolean', default: false, describe: 'Run pnpm install after generation' })
    .option('git-init', { type: 'boolean', default: false })
    .option('force', { type: 'boolean', default: false, describe: 'Overwrite existing directory' })
    .example('$0 my-app --framework react --build-tool vite --mf-name myRemote --port 3200', 'Generate a React + Vite MFE')
    .example('$0 ng-app --framework angular --build-tool webpack --mf-name ngRemote', 'Generate an Angular + Webpack MFE')
    .example('$0 vue-app --framework vue --build-tool vite --mf-name vueRemote', 'Generate a Vue + Vite MFE')
    .example('$0 analytics --template react-webpack --mf-name analytics --install', 'Generate MFE (legacy template mode)')
    .help().argv) as any as CliArgs;

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

main().catch(err => {
  console.error(chalk.red(err instanceof Error ? err.stack : String(err)));
  process.exit(1);
});
